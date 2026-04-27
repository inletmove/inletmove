# CLAUDE.md — Inlet Move Co. project guide

For future Claude Code sessions working in this repo. Read this and the canonical
spec docs in `_inputs/` before making non-trivial changes.

---

## Source of truth, in priority order

1. `_inputs/inlet-astro-migration-addendum.md` — **NEW (2026-04-27).** Supersedes mega
   prompt §5.1, §5.2, §8 partially. Locks the split-deploy architecture: Astro static
   on Hostinger for marketing (`inletmove.com`), Next.js on Vercel for quote app
   (`quote.inletmove.com`), `inletmove.ca` 301 → `.com`. **Read this BEFORE the mega
   prompt** for the next phase (the migration itself, scoped in phases M1–M8).
2. `_inputs/inlet-mega-claude-code-prompt.md` — the canonical mega prompt.
   1,004 lines. Dated 2026-04-27. **Wins all conflicts not explicitly superseded by
   the addendum above.**
3. `_inputs/inlet-move-site-spec-v2.md` — the build-ready spec. Use for content
   structure where neither the addendum nor the mega prompt overrides.
4. `_inputs/inlet-move-audience-research-v1.md` — persona psychology informing
   copy choices.
5. `_inputs/inlet-move-personas-6-7-supplement.md` — Mandarin/Cantonese +
   Punjabi/Hindi cultural-community personas.
6. `_inputs/inlet-move-v8.html` — the structural and visual baseline.

> **Predecessor commit:** `e536f08` is the Path B Next.js scaffold. Per the
> addendum, it is **intact, NOT to be deleted**. The migration restructures it
> into `apps/quote/` inside a pnpm monorepo, preserving the schema/forms/APIs and
> moving marketing components to a new Astro app at `apps/web/`. Rollback target
> is the `pre-inlet-week1-2026-04-27` tag.

If a doc in `_inputs/` conflicts with code in this repo, default to the mega
prompt and update the doc-or-code in a small follow-up PR. Don't paper over.

## Decisions already made (do not relitigate)

- **Stack** — Next.js 14 App Router · TS strict · Tailwind · Framer Motion · GSAP
  (lazy) · Supabase · Vercel · Resend · Twilio · Google Places.
- **Body font** — Hanken Grotesk (mega prompt + v8). Spec v2's "Inter" is
  superseded.
- **Lead table** — `quotes` (mega prompt §6), with reserved `movros_*` columns
  for v1.1 handoff. Spec v2's `leads` name is superseded.
- **Layout** — v8 baseline: Hero (phone mockup + chips + counters + live feed) →
  StoryScroll (5 Maya scenes, NOT pinned) → Bento (5 cards) → CompareToggle →
  BigNumbers → TrustBadges → FinalCTA → Footer. Spec v2's 8-frame cinematic
  pin-and-scrub plan is superseded — see mega prompt §2.3 (v7 was rejected
  because pinning without real assets felt broken).
- **i18n** — `i18n/{en,zh,pa,hi}.json`. en wired in Week 1. zh/pa/hi are stubs;
  `<LangSwitcher>` renders them as disabled with "(Coming soon)". Real
  translations land Week 3 with native-speaker review.

## Operating rules (mega prompt §9 — non-negotiable)

1. **Single focused Claude Code session per phase.** No parallel sessions in
   this repo. The MoverOS PM2/PM1 collision pattern is what we're avoiding.
2. **Git tag for rollback after every phase.** Pre-work tag exists at
   `pre-inlet-week1-2026-04-27`. End of next phase: `week1-foundation-2026-05-02`.
   End of Week 3 launch: `v1.0-launch-2026-05-23`.
3. **Execution report at end of each session.** Path:
   `~/sync/cognitia-state/inlet-{phase}/{phase}-report.md`. Sections: attempted,
   completed (with evidence), deferred (with reason), broken/unknown (audit
   list), next session's first task.
4. **Evidence-first labeling.** When reporting status, label:
   `[VERIFIED]` (I ran it), `[INFERRED]` (I expect it works but didn't run),
   `[UNKNOWN]` (needs audit). No claim is unlabeled.
5. **Honesty contracts on copy.** See README.md "Honesty contracts" section.
   When in doubt, surface to Feroz before writing.
6. **No refactoring while building.** Leave TODOs; refactor in a dedicated
   session post-launch.
7. **No new dependencies without surfacing first.** Stack is locked.

## Architecture notes

### Component philosophy

- **Server components by default.** Client only when it needs state, effects,
  or browser APIs (Hero, LiveBookingFeed, CompareToggle, BigNumbers, StoryScroll,
  Nav, LangSwitcher, QuoteForm).
- **`useTranslations` is a factory function**, not a hook. Safe in server and
  client components. Reads from `i18n/<locale>.json` synchronously.
- **`Button`** is a small primitive in `components/ui/Button.tsx`. Use it for
  CTAs; don't write inline `<button>` for branded actions.

### Data flow for the quote form

```
QuoteForm.tsx (client)
  ↓ react-hook-form + zod (quoteSchema in components/quote/schema.ts)
  ↓ POST /api/quote
app/api/quote/route.ts (server, node runtime)
  ↓ quoteServerSchema (extends quoteSchema with attribution fields)
  ↓ if Supabase configured: insert into quotes; else: log + synthetic UUID
  ↓ TODO: Twilio SMS to FEROZ_NOTIFY_PHONE (integration session)
  ↓ TODO: Resend confirmation email to contact_email (integration session)
  → returns { ok: true, id }
```

### Live booking feed

- `components/home/LiveBookingFeed.tsx` (client) reads from `/api/feed` every 30s.
- `app/api/feed/route.ts` reads from the masked `live_quote_feed` Supabase view
  (no PII — neighborhood + size + price + minutes-ago only). View grant:
  `select on public.live_quote_feed to anon`.
- Falls back to seed data if Supabase isn't configured or returns empty.

### StoryScroll — why NOT pinned

Per mega prompt §5.3 critical execution note: v7 demo failed because pinned
sections without real assets feel broken. The fix: each Maya scene is its own
100vh section. Image and text crossfade independently using
`useScroll({ target, offset: ['start end', 'end start'] })`. The user is
genuinely scrolling, so the page never feels stuck. Real photography (Maya AI
+ Vancouver crew shots, Week 3) carries the cinematic weight.

## Asset placeholders (Week 1 → Week 3)

Every placeholder is a captioned div, NOT a fake image. Week 3 swaps the divs
for Next.js `<Image>` calls with AVIF + WebP + JPEG fallbacks.

| Placeholder | Replaced by | Path |
|---|---|---|
| 5 Maya scenes | Nano Banana / Flux 1.1 Pro AI generation, retoucher pass | `public/images/maya/scene-{1-5}-*.jpg` |
| Crew + van + hands-on-boxes | Vancouver photographer (~$300-500) | `public/images/crew/`, `public/images/van/` |
| 5 UI mockups (phone, MoverOS dash, bodycam, map, receipt) | Figma exports | `public/images/ui-mockups/` |
| Bodycam loop | Vancouver videographer staged shoot | `public/video/b-roll/` |

## Things to do in the next session (Astro migration, M1–M8)

The next session is **the Astro migration**, not direct integration of the existing
Next.js scaffold. Read `_inputs/inlet-astro-migration-addendum.md` end-to-end first.
Phases M1–M8 are scoped tightly there. Top three on entry:

1. Pre-work tag: `git tag pre-astro-migration-2026-04-27` before any restructuring.
2. Phase M1 — restructure into pnpm monorepo: `apps/quote/` (existing scaffold),
   `apps/web/` (new Astro), `packages/{ui,content,types}`, root-level `i18n/`,
   `content/`, `supabase/`. Verify `apps/quote` still runs after the move.
3. Phase M2 — scaffold Astro 4.x in `apps/web/` with Tailwind + sitemap + React +
   Partytown integrations. Port design tokens from `apps/quote/tailwind.config.ts`.

Supabase / Twilio / Resend / GitHub / Vercel / Hostinger wiring all happen during
or after the migration phases — not before. The addendum has the full sequence.

## Things explicitly NOT in this scaffold

Per Path B / mega prompt §8 deferrals:

- AI Photo Inventory backend (Q3 2026 — keep `photo_*` columns reserved on
  schema, no UI yet)
- Bodycam UI (Q4 2026)
- Live crew tracking UI (Q3 2026)
- Stripe payments (v1.1)
- Live multi-language toggle (zh/pa/hi disabled in switcher; en only)
- Customer login / dashboard (lives in MoverOS)
- Live chat / chatbot (no, ever — phone is the channel)
- AI-generated humans in customer-facing photos (real photography only)

## Cross-project context

- **MoverOS** lives in a separate repo. Its Supabase project is
  `moveros-prod` — do NOT reuse. The `movros_*` columns on this repo's `quotes`
  table are the integration handoff seam.
- **Demandra** is the in-house ads/SEO/content arm. The "Advertised by Demandra"
  footer link goes to `/colophon`. No public marketing for Demandra.
- **Cognitia Cloud** is the holding company. Never appears on the public site.
