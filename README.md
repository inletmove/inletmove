# Inlet Move Co. — Web

Consumer site for Inlet Move Co., a Metro Vancouver moving company. Single hard-working
landing page + 6-step quote flow + 35 programmatic neighborhood pages + about + legal.

> **Status:** Week 1 / Path B scaffold (local-only). All ~70% that needs no external
> credentials is built and runs locally. Supabase, Twilio, Resend, Vercel, GitHub, and
> DNS land in the integration session once Feroz drops creds. See "Integration session"
> below.

---

## Prerequisites

- Node 20+ (project tested on Node 24)
- npm 10+
- A `.env.local` file (copy `.env.example`)

## Quick start

```bash
npm install
cp .env.example .env.local      # fill in what you have; missing vars use scaffold mode
npm run dev                     # http://localhost:3000
```

Open the homepage. The hero, live booking feed (seeded), bento grid, compare toggle,
big numbers, trust badges, final CTA all render. The 6-step quote form at `/quote`
posts to `/api/quote`, which runs in **scaffold mode** when Supabase env vars are
missing (logs the payload and returns a synthetic UUID). Three programmatic
neighborhood pages live at `/movers/mt-pleasant`, `/movers/yaletown`,
`/movers/burnaby-metrotown`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint (`next/core-web-vitals`) |
| `npm run typecheck` | `tsc --noEmit` against strict mode |
| `npm run test` | Vitest (unit tests) |
| `npm run e2e` | Playwright (e2e — requires the dev server to be free or auto-started) |
| `npm run lhci` | Lighthouse CI against the production build |
| `npm run format` | Prettier write |

## Tech stack

Next.js 14 App Router · React 18 · TypeScript strict · Tailwind 3.4 · Framer Motion 11 ·
GSAP 3.12 (lazy-loaded) · `@supabase/supabase-js` · `react-hook-form` + `zod` · Twilio ·
Resend · Vitest · Playwright · Lighthouse CI.

## Project layout

See [`CLAUDE.md`](./CLAUDE.md) for the full rationale + decision log.

```
app/                  # routes (App Router)
  page.tsx            # homepage — composes Hero/Story/Bento/Compare/Numbers/Trust/CTA
  quote/              # 6-step quote form
  movers/             # programmatic neighborhood pages
  about/, colophon/   # plain content pages
  legal/privacy, terms
  api/quote, api/feed # server routes
components/           # home/, quote/, nav/, ui/
lib/                  # supabase, i18n, analytics, cn
i18n/                 # en (wired), zh/pa/hi (stubs)
content/              # neighborhoods.json (3 seeded; 35 by Week 3)
supabase/migrations/  # SQL on disk; not yet deployed
tests/                # unit/ (Vitest) + e2e/ (Playwright)
public/               # images/, video/ (placeholders Week 1, real assets Week 3)
_inputs/              # gitignored: spec docs, demo HTMLs, audience research
```

## Environment variables

All vars are documented in `.env.example`. The app boots in **scaffold mode** when
Supabase vars are missing. The integration session fills these in (see below).

## Performance budgets

Enforced in CI by Lighthouse (`lighthouserc.json`):

- LCP < 1.8s · TBT < 300ms · CLS < 0.05
- Performance ≥ 90 · Accessibility 100 · Best Practices ≥ 95 · SEO 100

`prefers-reduced-motion` is respected globally (in `app/globals.css`) and per-component
(via `useReducedMotion()` from Framer Motion).

## Honesty contracts (do not violate in copy)

Hard rules from spec v2 §3 + mega prompt §3.2/3.3:

- **No "owner-operated · same crew every move".** Use "Vancouver-based" until the
  refugee hearing outcome lands (2026-08-05).
- **No "100% on-time".** Use "98% on-time arrivals (year-to-date)".
- **No "Bodycam Live · Recording".** Use "Photo documentation on every job" — bodycam
  ops are a Q4 2026 pilot.
- **AI photo inventory** is "Coming Q3 2026". Don't claim otherwise.
- **Live crew tracking** is "Coming Q3 2026". Today: SMS updates only.
- **Maya the AI voice agent** is internal-only. Never mention on the public site.
  (The "Maya" character in StoryScroll is a separate visual narrative device.)

## Integration session checklist (next steps after this scaffold)

1. **Supabase** — create `inletmove-prod` project in `us-west-1`. Run
   `supabase/migrations/0001_initial.sql`. Run `supabase/seed/seed-neighborhoods.sql`.
   Drop URL + anon + service-role keys into `.env.local`.
2. **Twilio** — provision a sender ID. Drop SID/auth/from-number into env.
   Wire `lib/twilio.ts` (currently absent — TODO marker is in
   `app/api/quote/route.ts` after the Supabase insert).
3. **Resend** — verify `inletmove.com` domain. API key into env. Wire
   `lib/resend.ts` (same TODO marker).
4. **Google Places** — generate browser-restricted key + server key. Wire address
   autocomplete in step 2 / 3 of the quote form (`components/quote/QuoteForm.tsx`).
5. **GitHub** — create `cognitia-cloud/inletmove`, push, set as upstream.
6. **Vercel** — import the GitHub repo. Set env vars (preview + production).
   Attach `inletmove.com`. Configure `inletmove.ca` 301 → `inletmove.com` once
   domain status is resolved.
7. **Smoke test** — submit a real quote from a phone, confirm SMS lands on
   Feroz's phone, confirm email lands in lead inbox, confirm row appears in
   Supabase.
8. **Tag** — `git tag week1-foundation-2026-05-02 && git push --tags`.

## Rollback

This scaffold is anchored at git tag `pre-inlet-week1-2026-04-27`. To start over:

```bash
git reset --hard pre-inlet-week1-2026-04-27
git clean -fd
```
