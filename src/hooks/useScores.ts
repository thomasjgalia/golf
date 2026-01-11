import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { NewScore, ScoreRow } from '@/types'
import { toast } from 'sonner'

export function useScores(eventId?: number, teamId?: number) {
  const [scores, setScores] = useState<ScoreRow[] | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchAll() {
    if (!eventId) return
    setLoading(true)
    let query = supabase.from('scores').select('*').eq('eventid', eventId)
    if (teamId) query = query.eq('teamid', teamId)
    const { data } = await query.order('holenumber', { ascending: true })
    setScores(data as ScoreRow[])
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, teamId])

  async function upsertScore(score: NewScore) {
    const conflict = score.playerid == null ? 'eventid,teamid,holenumber' : 'eventid,playerid,holenumber'
    const payload: any = {
      eventid: score.eventid,
      teamid: score.teamid ?? null,
      playerid: score.playerid ?? null,
      holenumber: score.holenumber,
      strokes: score.strokes,
    }
    const { data, error } = await supabase
      .from('scores')
      .upsert(payload, { onConflict: conflict })
      .select('*')
      .single()
    if (error) throw error
    toast.success('Score saved')
    await fetchAll()
    return data as ScoreRow
  }

  async function clearScore(eventId: number, playerOrTeamId: number, hole: number, mode: 'player' | 'team' = 'player') {
    const match = mode === 'player'
      ? { eventid: eventId, playerid: playerOrTeamId, holenumber: hole }
      : { eventid: eventId, teamid: playerOrTeamId, holenumber: hole }
    const { error } = await supabase.from('scores').delete().match(match)
    if (error) throw error
    toast.success('Score cleared')
    await fetchAll()
  }

  return { scores, loading, refresh: fetchAll, upsertScore, clearScore }
}
