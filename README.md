# Monete

> Account-free RSVP for kids' birthday parties — host creates a party with standard or custom questions; each family RSVPs once listing one or more children; the host gets a live headcount and a venue-ready summary.

[![Latest release](https://img.shields.io/github/v/release/Endika/Monete?style=flat-square&color=f59e0b&label=release)](https://github.com/Endika/Monete/releases/latest)
[![CI](https://img.shields.io/github/actions/workflow/status/Endika/Monete/ci.yml?style=flat-square&label=ci&branch=main)](https://github.com/Endika/Monete/actions/workflows/ci.yml)
[![Last commit](https://img.shields.io/github/last-commit/Endika/Monete?style=flat-square)](https://github.com/Endika/Monete/commits/main)
[![Conventional Commits](https://img.shields.io/badge/conventional_commits-1.0.0-FE5196?style=flat-square)](https://www.conventionalcommits.org)
[![License: MIT](https://img.shields.io/github/license/Endika/Monete?style=flat-square&color=10B981)](./LICENSE)

## What you can do

- Create a party in seconds — no signup, no email.
- Share a guest link via WhatsApp or any channel. Each family RSVPs once and can list multiple children.
- Standard one-click questions: adult count, allergies, date of birth, preferred snack.
- Custom questions per family or per child — choice (dropdown), free text, number, or date.
- Watch RSVPs arrive live; the headcount updates in real time.
- Export a venue-ready summary (WhatsApp-formatted) with every family's answers.
- Hybrid add-to-calendar: `.ics` file on iOS and desktop, Google Calendar link on Android.
- Six languages: Spanish, English, Galician, Basque, Catalan, Valencian.
- Install it as a PWA on any device.

## Known limitations

- **Open RLS** — any anonymous client can read, insert, or update parties in the database. The edit PIN is enforced client-side only and is not a server-side security boundary. Keep the host link private; anyone who obtains it can edit the party.
- **RSVP writes are atomic** — a Supabase RPC appends each family's RSVP to the JSON array without reading the full blob first, so concurrent families do not clobber each other.

---

## For developers

Open-source, MIT licensed. PRs welcome.

**Stack** — React 19, Vite, TypeScript (strict), Tailwind CSS 4, Supabase (Postgres + Realtime), vite-plugin-pwa, i18next, Vitest.

**Architecture** — Hexagonal (domain → application → infrastructure → presentation). DI via a hand-rolled container. Tests use in-memory fakes — no DB mocks.

### Local dev

```sh
git clone git@github.com:Endika/Monete.git
cd Monete
cp .env.example .env.local   # fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

### Database

Apply the migration once to your Supabase project:

```sh
supabase db push
```

Or paste `supabase/migrations/0001_parties.sql` directly into the Supabase SQL editor.

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (`tsc -b && vite build`) |
| `npm run test:run` | Run tests once |
| `npm run lint` | ESLint (zero warnings) |
| `npm run type:check` | TypeScript type check |

CI runs lint, typecheck, tests, and the production build on every PR.

### Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase project values:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon (public) key |
