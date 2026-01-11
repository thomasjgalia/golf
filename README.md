# Golf Tournament Manager (React + TypeScript + Vite + Supabase)

MVP Features:
- Events CRUD (share codes, QR)
- Players CRUD
- Teams CRUD
- Scoring (per hole, quick buttons)
- Leaderboard (with tiebreakers)

Tech: React 18, TypeScript, Tailwind + shadcn/ui, React Router v6, Supabase

Auth: Supabase Auth (email/password + magic link). Management routes require sign-in. Public pages: Leaderboard and Public Scoring.

## Quick start

1) Copy env file

   cp .env.example .env

2) Install deps

   npm install

3) Run dev server

   npm run dev

Supabase DB already provisioned per requirements.

4) Auth setup (Supabase dashboard)
- Enable Email/Password and Magic Link providers
- Add Redirect URLs: http://localhost:5173 and your production domain
- Optional: Customize email templates

## Scripts
- dev: start vite dev server
- build: type-check + build
- preview: preview production build

## Notes
- All CRUD uses Supabase JS client. RLS is public for MVP.
- Routes:
  - Protected: /, /events, /events/:id, /events/:id/teams, /players
  - Public: /leaderboard, /events/:id/scoring, /scoring?code=XXXXX, /login
- See src/hooks/* for data hooks
- See src/pages/* for routes

