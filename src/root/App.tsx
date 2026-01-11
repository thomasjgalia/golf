import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function App() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="container flex h-14 items-center justify-between gap-4">
          <Link to="/" className="font-semibold">
            SOL Golf
          </Link>
          <nav className="flex gap-4 text-sm items-center">
            <NavLink to="/events" className={({ isActive }) => isActive ? 'text-primary font-medium' : 'text-muted-foreground'}>Events</NavLink>
            <NavLink to="/players" className={({ isActive }) => isActive ? 'text-primary font-medium' : 'text-muted-foreground'}>Players</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="text-xs text-muted-foreground hidden md:block">{user.email}</div>
                <Button variant="outline" onClick={signOut}>Sign out</Button>
              </>
            ) : (
              <Link to="/login" className="text-sm text-primary">Sign in</Link>
            )}
          </div>
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  )
}

