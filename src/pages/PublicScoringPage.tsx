import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { EventRow } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function PublicScoringPage() {
  const [search] = useSearchParams()
  const codeParam = (search.get('code') || '').toUpperCase()
  const nav = useNavigate()
  const [code, setCode] = useState(codeParam)
  const [event, setEvent] = useState<EventRow | null>(null)

  useEffect(() => {
    ;(async () => {
      if (!codeParam) return
      const { data } = await supabase.from('events').select('*').eq('sharecode', codeParam).single()
      setEvent(data as EventRow)
    })()
  }, [codeParam])

  async function lookup() {
    const { data } = await supabase.from('events').select('*').eq('sharecode', code.toUpperCase()).single()
    if (data) setEvent(data as EventRow)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Public Scoring</h1>
      <div className="flex gap-2 max-w-md">
        <Input placeholder="Enter share code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        <Button onClick={lookup}>Find Event</Button>
      </div>

      {event && (
        <div className="border rounded p-3">
          <div className="font-medium">{event.eventname}</div>
          <div className="text-sm text-muted-foreground">{event.coursename} • {event.eventdate}</div>
          <div className="mt-2">
            <Button onClick={() => nav(`/scoring?code=${event.sharecode}`)}>Open Scoring</Button>
          </div>
        </div>
      )}
    </div>
  )
}
