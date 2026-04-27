# CLAUDE.md — Inlet Move Co. project guide

For future Claude Code sessions working in this repo. Read this and the
canonical spec docs in `_inputs/` (gitignored — local mirror at
`C:\Users\smrai\inlet move\_inputs\`) before non-trivial changes.

---

## Live state (as of 2026-04-27)

- **Marketing site shipped** at https://inletmove.ca (Astro static on
  Hostinger). Replaced a default WordPress install on the same hosting
  plan. Deploy via `pnpm deploy:marketing` (FTPS, ~7s).
- **Quote app** (`apps/quote/`) is intact Next.js scaffold ready for Vercel
  deploy at `quote.inletmove.ca` in v1.1. Not deployed yet.
- **inletmove.com** has NO Hostinger plan attached. When it does, configure
  a 301 .com → .ca at the Hostinger Domains panel, NOT in code.
- **WordPress files** still on disk at /public_html but web-inaccessible
  via the .htaccess 410-Gone rules. Cleanup is hygiene, not blocking.
- **Resend not yet configured** — quote form submissions log to
  `/home/u475505275/domains/inletmove.ca/private-logs/quotes-YYYY-MM.log`
  on the server until RESEND_API_KEY + FEROZ_NOTIFY_EMAIL are set in
  Hostinger hPanel → Advanced → PHP Configuration.

## Source of truth, in priority order

1. `_inputs/inlet-astro-migration-addendum.md` — split-deploy architecture
   (supersedes the mega prompt for stack + project structure + Week 1
   deliverables).
2. `_inputs/inlet-mega-claude-code-prompt.md` — canonical product brief
   (1004 lines, 2026-04-27). Wins on content/copy/honesty contracts and
   anything not explicitly superseded by the addendum.
3. `_inputs/inlet-move-site-spec-v2.md` — content + structure.
4. `_inputs/inlet-move-audience-research-v1.md` — persona psychology.
5. `_inputs/inlet-move-personas-6-7-supplement.md` — Mandarin/Cantonese +
   Punjabi/Hindi cultural-community personas.
6. `_inputs/inlet-move-v8.html` — visual baseline.

If a doc conflicts with code, default to the addendum / mega prompt and
update the code-or-doc in a follow-up PR. Don't paper over.

## Decisions already made (do not relitigate)

- **Stack**:
  - `apps/marketing/` — Astro 4.16, Tailwind 3.4, React islands (LIVE)
  - `apps/quote/` — Next.js 14 + Supabase + Twilio + Resend (deferred to
    Vercel deploy)
- **Canonical domain** — inletmove.ca (NOT .com). Pivot decided at deploy
  time because .com has no Hostinger plan. See addendum + project memory.
- **Body font** — Hanken Grotesk. Display: Fraunces. Mono: JetBrains Mono.
- **Quote table** — `quotes` (mega prompt §6), with reserved `movros_*`
  columns for v1.1 handoff.
- **Layout** — v8 baseline (Hero → Bento → CompareToggle → BigNumbers →
  TrustBadges → FinalCTA → Footer). NO StoryScroll cinematic for v1
  (deferred until real Maya photography lands).
- **i18n** — only English wired. zh/pa/hi disabled in `<LangSwitcher>`
  with "Coming soon".

## Operating rules (mega prompt §9 — non-negotiable)

1. **Single focused Claude Code session per phase.** No parallel sessions.
2. **Git tag for rollback after every phase.** Current chain:
   `pre-inlet-week1-2026-04-27`, `pre-astro-migration-2026-04-27`,
   `astro-marketing-v1-build-2026-04-27`,
   `astro-marketing-v1-deployed-2026-04-27`. Next: `v1.0-launch-2026-05-23`.
3. **Execution report at end of each session.** Path:
   `C:\Users\smrai\sync\cognitia-state\inlet-{phase}\{phase}-report.md`.
   See `inlet-marketing-v1\build-report.md` for the latest.
4. **Evidence-first labeling.** `[VERIFIED]` (I ran it), `[INFERRED]` (I
   expect it works but didn't run), `[UNKNOWN]` (needs audit). No claim
   unlabeled.
5. **Honesty contracts on copy** are load-bearing (brief §6):
   - Never claim "owner-operated, same crew every move".
   - Use "Trained, vetted, branded crew · introduced by name" instead.
   - Prefix unmeasured metrics with "Target" (Inlet has no operating
     history yet — 11min/4.1%/98% are aspirations).
   - "AI photo inventory" → "Coming Q3 2026" badge.
   - "Bodycam ops" → "Pilot Q4 2026" (NEVER "Bodycam Live · Recording").
   - Trust badges with `[Pending verification]` for BC Reg #, GST #,
     insurance certificate URL.
6. **No refactoring while building.** Leave TODOs.
7. **No new dependencies without surfacing first.** Stack is locked.

## Repo layout

```
/                                 ← pnpm workspace root
├── apps/
│   ├── marketing/                ← Astro 4.16, LIVE on inletmove.ca
│   │   ├── src/
│   │   │   ├── pages/            ← index, quote, thanks, about, colophon,
│   │   │   │                       movers/, legal/{privacy,terms}
│   │   │   ├── components/       ← home/, nav/, footer/, quote/, shared/
│   │   │   ├── layouts/Base.astro
│   │   │   ├── content/neighborhoods.json (3 seeded)
│   │   │   ├── lib/quote-handler.ts (interface contract docs)
│   │   │   └── styles/global.css
│   │   ├── public/
│   │   │   ├── .htaccess         ← Apache config (forces index.html,
│   │   │   │                       410-Gones /wp-* paths, security headers)
│   │   │   ├── quote-handler.php ← v1 form endpoint (Resend or file log)
│   │   │   ├── llms.txt, robots.txt, sitemap.xml, favicon.svg, og/default.svg
│   │   ├── astro.config.mjs      ← site: 'https://inletmove.ca'
│   │   └── tailwind.config.ts    ← v8 design tokens
│   └── quote/                    ← Next.js 14, deferred
│       └── (former root-level scaffold, e536f08 history preserved via git mv)
├── scripts/
│   └── deploy-marketing.mjs      ← Node-based FTPS deploy
├── _inputs/                      ← canonical specs (gitignored)
├── pnpm-workspace.yaml
└── package.json                  ← workspace root, pnpm onlyBuiltDependencies allowlist
```

## Network-boundary abstraction (Path B-with-modification)

Marketing form posts to `import.meta.env.PUBLIC_QUOTE_ENDPOINT`:

- **v1**: `PUBLIC_QUOTE_ENDPOINT=/quote-handler.php` (Hostinger PHP shim)
- **v1.1**: `PUBLIC_QUOTE_ENDPOINT=https://quote.inletmove.ca/api/quote`
  (Vercel/Next.js)

**Form code does not change.** Single env-var swap.

Field names are snake_case across the boundary — locked. See
`apps/marketing/src/lib/quote-handler.ts` for the binding interface
contract. If you add a field, update all 4 sites: form, PHP shim, future
Next endpoint, Supabase migration.

## How to deploy the marketing site

Pre-reqs: `apps/marketing/.env.local` exists (gitignored) with FTP creds.

```bash
pnpm --filter inletmove-marketing build   # ~1.4s, 11 pages
pnpm deploy:marketing                      # FTPS to Hostinger, ~7s
```

Verify: `curl -I https://inletmove.ca/`

## Cross-project context

- **MoverOS** (separate repo). Its Supabase project is `moveros-prod` —
  do NOT reuse. The `movros_*` columns on this repo's `quotes` table are
  the integration handoff seam.
- **Demandra** is the in-house ads/SEO/content arm. Footer link
  "Advertised by Demandra" goes to `/colophon`. No public marketing.
- **Cognitia Cloud** is the holding company. Never appears on the public
  site.

## Things explicitly NOT in the v1 scaffold

Per Path B / mega prompt §8 deferrals:

- AI Photo Inventory backend (Q3 2026)
- Bodycam UI (Q4 2026)
- Live crew tracking UI (Q3 2026)
- Stripe payments (v1.1)
- Live multi-language toggle (zh/pa/hi disabled in switcher)
- Customer login / dashboard (lives in MoverOS)
- Live chat / chatbot (no, ever — phone is the channel)
- AI-generated humans in customer-facing photos (real photography only)
- StoryScroll cinematic Maya section (deferred until real photography)
