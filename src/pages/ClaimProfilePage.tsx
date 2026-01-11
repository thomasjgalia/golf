import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PlayerRow } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ClaimProfilePage() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [players, setPlayers] = useState<PlayerRow[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [email, setEmail] = useState('')

  // Create profile fields
  const [showCreate, setShowCreate] = useState(false)
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [hcp, setHcp] = useState<number | ''>(18)

  async function search() {
    if (!q.trim()) { setPlayers([]); return }
    setLoading(true)
    // search by last or first name (case-insensitive)
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .or(`lastname.ilike.%${q}%,firstname.ilike.%${q}%`)
      .order('lastname', { ascending: true })
    if (error) toast.error(error.message)
    setPlayers((data ?? []) as PlayerRow[])
    setLoading(false)
  }

  useEffect(() => {
    const id = setTimeout(() => { search() }, 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const selected = useMemo(() => players.find(p => p.playerid === selectedId) || null, [players, selectedId])

  async function sendMagicLink() {
    if (!selected) return toast.error('Select your name first')
    if (!email || !/.+@.+\..+/i.test(email)) return toast.error('Enter a valid email')

    try {
      // update the player email to this address (so we know where to reach them)
      const { error: upErr } = await supabase
        .from('players')
        .update({ email })
        .eq('playerid', selected.playerid)
      if (upErr) throw upErr

      // send magic link for passwordless sign-in
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) throw error
      toast.success('Magic link sent. Check your email to verify and sign in.')
    } catch (e: any) {
      toast.error(e.message || 'Failed to send magic link')
    }
  }

  async function createProfileAndSendLink() {
    if (!first.trim() || !last.trim()) return toast.error('First and last name are required')
    if (!createEmail || !/.+@.+\..+/i.test(createEmail)) return toast.error('Enter a valid email')
    const handicap = typeof hcp === 'number' ? hcp : 18

    try {
      // Create player profile
      const { error: insErr } = await supabase.from('players').insert({
        firstname: first.trim(),
        lastname: last.trim(),
        email: createEmail,
        phone: null,
        handicap,
      })
      if (insErr) throw insErr

      const { error } = await supabase.auth.signInWithOtp({
        email: createEmail,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) throw error
      toast.success('Profile created. Magic link sent—check your email to sign in.')
      setFirst(''); setLast(''); setCreateEmail(''); setHcp(18); setShowCreate(false)
    } catch (e: any) {
      toast.error(e.message || 'Failed to create profile')
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-xl font-semibold">Claim Your Profile</h1>
      <p className="text-sm text-muted-foreground">Find your name, add your email, and we’ll send you a magic link to sign in. No password required.</p>

      <div className="grid gap-3">
        <div>
          <Label>Search by name</Label>
          <Input placeholder="Type first or last name" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {loading && <div className="text-sm">Searching…</div>}

        {players.length > 0 && (
          <div className="grid gap-2 max-h-64 overflow-auto border rounded p-2">
            {players.map((p) => (
              <label key={p.playerid} className="flex items-center gap-2 text-sm">
                <input type="radio" name="player" checked={selectedId === p.playerid} onChange={() => { setSelectedId(p.playerid); setEmail(p.email || '') }} />
                <span className="font-medium">{p.lastname}, {p.firstname}</span>
                {p.handicap != null && <span className="text-xs text-muted-foreground">HC {p.handicap}</span>}
              </label>
            ))}
          </div>
        )}

        <div>
          <Label>Email *</Label>
          <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="text-xs text-muted-foreground mt-1">We’ll send a verification link to this address.</div>
        </div>

        <div className="flex justify-end">
          <Button onClick={sendMagicLink} disabled={!selected || !email}>Send magic link</Button>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">New here?</h2>
          <Button variant="outline" onClick={() => setShowCreate((v) => !v)}>{showCreate ? 'Hide' : 'Create new profile'}</Button>
        </div>
        {showCreate && (
          <div className="grid gap-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First name *</Label>
                <Input value={first} onChange={(e) => setFirst(e.target.value)} />
              </div>
              <div>
                <Label>Last name *</Label>
                <Input value={last} onChange={(e) => setLast(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
            </div>
            <div>
              <Label>Handicap</Label>
              <Input type="number" step="0.1" value={hcp} onChange={(e) => setHcp(e.target.value ? Number(e.target.value) : 18)} />
            </div>
            <div className="flex justify-end">
              <Button onClick={createProfileAndSendLink} disabled={!first || !last || !createEmail}>Create & send magic link</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
