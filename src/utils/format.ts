export function classNames(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(' ')
}

export function colorForScore(scoreToPar: number) {
  if (scoreToPar < 0) return 'text-success'
  if (scoreToPar > 0) return 'text-danger'
  return 'text-info'
}

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString()
