import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { EventRow, NewEvent } from '@/types'
import { toast } from 'sonner'

function normalizeEventRow(raw: any): EventRow {
  const holes = Number(raw?.numberofholes) || 18
  let par = raw?.parperhole
  if (typeof par === 'string') {
    try { par = JSON.parse(par) } catch { par = [] }
  }
  if (!Array.isArray(par)) par = []
  par = par.map((n: any) => Number(n) || 4)
  if (par.length !== holes) {
    const next = Array.from({ length: holes }, (_, i) => par[i] ?? 4)
    par = next
  }
  return { ...raw, parperhole: par } as EventRow
}

export function useEvents() {
  const [events, setEvents] = useState<EventRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchAll() {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('eventdate', { ascending: false })
    if (error) setError(error.message)
    setEvents(((data as any[]) || []).map(normalizeEventRow))
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  async function create(ev: NewEvent) {
    const { data, error } = await supabase.from('events').insert(ev).select('*').single()
    if (error) throw error
    const row = normalizeEventRow(data)
    setEvents((prev) => (prev ? [row, ...prev] : [row]))
    toast.success('Event created')
    return data as EventRow
  }

  async function update(id: number, patch: Partial<EventRow>) {
    const { data, error } = await supabase.from('events').update(patch).eq('eventid', id).select('*').single()
    if (error) throw error
    const row = normalizeEventRow(data)
    setEvents((prev) => prev?.map((e) => (e.eventid === id ? row : e)) ?? null)
    toast.success('Event updated')
    return data as EventRow
  }

  async function remove(id: number) {
    const { error } = await supabase.from('events').delete().eq('eventid', id)
    if (error) throw error
    setEvents((prev) => prev?.filter((e) => e.eventid !== id) ?? null)
    toast.success('Event deleted')
  }

  return { events, loading, error, refresh: fetchAll, create, update, remove }
}

export function useEvent(id?: number) {
  const [event, setEvent] = useState<EventRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      const { data } = await supabase.from('events').select('*').eq('eventid', id).single()
      setEvent(data ? normalizeEventRow(data) : null)
      setLoading(false)
    })()
  }, [id])

  return { event, loading, setEvent }
}
