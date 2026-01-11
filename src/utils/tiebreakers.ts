import type { ScoreRow, TeamRow } from '@/types'

// Compute totals and tie-breaker arrays for a team
export function computeTeamScores(
  team: TeamRow,
  scores: ScoreRow[],
  parPerHole: number[]
) {
  const byHole: Record<number, { strokes: number | null; par: number }> = {}
  for (const s of scores) {
    byHole[s.holenumber] = { strokes: s.strokes, par: s.par }
  }
  const holes = parPerHole.length
  const frontIdx = [...Array(Math.min(9, holes)).keys()].map((i) => i + 1)
  const backIdx = holes === 18 ? [...Array(9).keys()].map((i) => i + 10) : []

  const sum = (idx: number[]) =>
    idx.reduce((acc, h) => acc + (byHole[h]?.strokes ?? 0), 0)
  const sumPar = (idx: number[]) => idx.reduce((acc, h) => acc + (byHole[h]?.par ?? parPerHole[h - 1] ?? 4), 0)

  const frontStrokes = sum(frontIdx)
  const backStrokes = sum(backIdx)
  const totalStrokes = frontStrokes + backStrokes

  const frontPar = sumPar(frontIdx)
  const backPar = sumPar(backIdx)
  const totalPar = frontPar + backPar

  const scoreToPar = totalStrokes - totalPar

  // tie-break: lower back9, then last 3 holes
  const last3Idx = parPerHole.length >= 3
    ? [parPerHole.length - 2, parPerHole.length - 1, parPerHole.length].map((h) => h)
    : []
  const last3Strokes = last3Idx.reduce((acc, h) => acc + (byHole[h]?.strokes ?? 0), 0)

  return {
    frontStrokes,
    backStrokes,
    totalStrokes,
    frontPar,
    backPar,
    totalPar,
    scoreToPar,
    last3Strokes,
  }
}

export function leaderboardSort(
  a: ReturnType<typeof computeTeamScores>,
  b: ReturnType<typeof computeTeamScores>
) {
  if (a.scoreToPar !== b.scoreToPar) return a.scoreToPar - b.scoreToPar
  if (a.backStrokes !== b.backStrokes) return a.backStrokes - b.backStrokes
  if (a.last3Strokes !== b.last3Strokes) return a.last3Strokes - b.last3Strokes
  return 0
}
