import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { NewTeam, TeamRow } from '@/types'
import { toast } from 'sonner'

export function useTeams(eventId?: number) {
  const [teams, setTeams] = useState<TeamRow[] | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchAll() {
    if (!eventId) return
    setLoading(true)
    const { data } = await supabase
      .from('teams')
      .select('*')
      .eq('eventid', eventId)
      .order('teamname', { ascending: true })
    setTeams(data as TeamRow[])
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  async function create(team: NewTeam) {
    const { data, error } = await supabase.from('teams').insert(team).select('*').single()
    if (error) throw error
    setTeams((prev) => (prev ? [...prev, data as TeamRow] : [data as TeamRow]))
    toast.success('Team created')
    return data as TeamRow
  }

  async function update(id: number, patch: Partial<TeamRow>) {
    const { data, error } = await supabase.from('teams').update(patch).eq('teamid', id).select('*').single()
    if (error) throw error
    setTeams((prev) => prev?.map((t) => (t.teamid === id ? (data as TeamRow) : t)) ?? null)
    toast.success('Team updated')
    return data as TeamRow
  }

  async function remove(id: number) {
    const { error } = await supabase.from('teams').delete().eq('teamid', id)
    if (error) throw error
    setTeams((prev) => prev?.filter((t) => t.teamid !== id) ?? null)
    toast.success('Team deleted')
  }

  return { teams, loading, refresh: fetchAll, create, update, remove }
}
