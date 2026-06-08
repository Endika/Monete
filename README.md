<p align="center">
  <img src="./public/icon-512.png" width="128" alt="Monete app icon" />
</p>

<h1 align="center">Monete</h1>

<p align="center">
  Account-free RSVP for kids' birthday parties — host creates a party with standard or custom questions; each family RSVPs once listing one or more children; the host gets a live headcount and a venue-ready summary.
</p>

<p align="center">
  <a href="https://github.com/Endika/Monete/releases/latest"><img src="https://img.shields.io/github/v/release/Endika/Monete?style=flat-square&color=f59e0b&label=release" alt="Latest release" /></a>
  <a href="https://github.com/Endika/Monete/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Endika/Monete/ci.yml?style=flat-square&label=ci&branch=main" alt="CI" /></a>
  <a href="https://github.com/Endika/Monete/commits/main"><img src="https://img.shields.io/github/last-commit/Endika/Monete?style=flat-square" alt="Last commit" /></a>
  <a href="https://www.conventionalcommits.org"><img src="https://img.shields.io/badge/conventional_commits-1.0.0-FE5196?style=flat-square" alt="Conventional Commits" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/Endika/Monete?style=flat-square&color=10B981" alt="License: MIT" /></a>
</p>

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

## Security model

- **No direct table access** — anonymous clients cannot read, list, insert, or update the `parties` table directly. Row-Level Security denies all direct access; every operation goes through `SECURITY DEFINER` RPCs. There is **no bulk read**: a party can only be fetched by its exact id (`get_party`), so the anon key cannot enumerate or dump other families' data.
- **Server-side edit PIN** — when a party has an edit PIN, config edits and PIN changes are verified **server-side** (the PIN hash is computed in Postgres and never shipped to clients). A party **without** a PIN stays editable by anyone holding its link — that is by design, to keep the no-signup flow; treat the host link as the capability and keep it private.
- **Bounded writes** — RSVP submissions are capped (per-RSVP size, RSVP count, and total blob size) to prevent storage/egress abuse. RSVP appends are atomic, so concurrent families never clobber each other.

### Accepted limitations (by the no-signup design)

- **A PIN-less party is fully open to link-holders.** Anyone with the link can edit it, and can set the *first* PIN themselves — so the no-signup model can't stop a malicious link-holder from locking a host out of a party the host left PIN-less. Set a PIN if that matters.
- **Online PIN guessing is not rate-limited.** The 4–6 digit PIN is verified server-side and the hash never ships, so offline cracking is gone — but a link-holder can still try PINs against the API without a lockout. The PIN raises the bar for a link-holder; it is not a strong secret. Keep the host link private regardless.

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

Or paste the files in `supabase/migrations/` (in order) directly into the Supabase SQL editor. `0004_harden_access.sql` closes direct table access and routes everything through RPCs — apply it on top of the earlier migrations.

### Commands

| Command              | Description                               |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Start the dev server                      |
| `npm run build`      | Production build (`tsc -b && vite build`) |
| `npm run test:run`   | Run tests once                            |
| `npm run lint`       | ESLint (zero warnings)                    |
| `npm run type:check` | TypeScript type check                     |

CI runs lint, typecheck, tests, and the production build on every PR.

### Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase project values:

| Variable                 | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `VITE_SUPABASE_URL`      | Your Supabase project URL                        |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon (public) key                  |
| `VITE_GOOGLE_MAPS_KEY`   | Google Maps/Places key (optional, address + map) |

> **Restrict the Google Maps key.** `VITE_GOOGLE_MAPS_KEY` ships in the client bundle by design, so it cannot be kept secret. Lock it down in the Google Cloud Console or anyone can run up your bill: set an **HTTP-referrer** restriction to your production domain, an **API allowlist** (Maps Embed + Places API only), and a **billing budget + alert**. This control lives in GCP — the code cannot enforce it.
