/**
 * FAQ data — single source of truth for both the rendered /faq page
 * (with FAQPage JSON-LD that requires byte-exact text match between
 * schema and visible answer) and the llms-full.txt AI-readable
 * citation map. Both consumers call getFaqs() at build time so any
 * pricing.json change cascades to both surfaces on next build.
 *
 * Conditional logic preserved:
 *   - Q4 (booking speed) flips between Maya-AI-agent and human-only
 *     wording based on isInquiryAgentLive()
 *   - Q6 (insurance) flips between bound and unbound coverage forms
 *     based on PRICING.trust.insuranceBound
 *
 * If you change any answer here, the /faq page and llms-full.txt
 * both update on next build with no further edits.
 */

import { PRICING, tierEstimate, isInquiryAgentLive, movesHoursLabel } from '../lib/pricing';

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export function getFaqs(): Faq[] {
  const overageThreshold = Math.ceil(PRICING.claims.overagePercent);
  const studio = tierEstimate('studio');
  const threeBd = tierEstimate('3-bedroom');
  const insuranceMillions = (PRICING.claims.insuranceAmountCAD / 1_000_000).toFixed(0);
  const quoteHost = PRICING.links.quote.replace(/^https?:\/\//, '');

  const agentLive = isInquiryAgentLive();
  const moveHours = movesHoursLabel();
  const q4Answer = agentLive
    ? `Same-week local moves are typical. After you submit a quote, you'll get a first response within an hour — ${PRICING.hours.inquiryAgent}, our AI assistant, handles inquiries 24/7, with a real human following up during move dispatch hours (${moveHours}). Target first-text in ${PRICING.claims.responseTimeMinutes} minutes. Saturday slots fill fastest; weekday mornings have the most flexibility.`
    : `Same-week local moves are typical. After you submit a quote, a real human texts back within an hour — target ${PRICING.claims.responseTimeMinutes} minutes — with a written estimate and available dates. Saturday slots fill fastest; weekday mornings have the most flexibility.`;

  const insuranceAnswer = PRICING.trust.insuranceBound
    ? `Yes — Inlet carries $${insuranceMillions}M cargo and liability insurance covering damage to your belongings in transit and on-site liability during the move. To file a claim, contact us with photos and a description as soon as you notice an issue, and we'll walk you through the insurer's process within two business days.`
    : `Inlet's coverage is currently being bound — application is in progress for $${insuranceMillions}M cargo and liability target coverage. Until the policy is active, we recommend checking with your own home or renters insurance about coverage during a move. We will publish the active certificate URL on this page once the policy binds.`;

  return [
    {
      id: 'cost',
      question: 'How much will my move cost?',
      answer: `Two movers and a cargo van cost $${PRICING.rates.hourlyRate} an hour, with a $${PRICING.rates.minimumCharge} minimum (${PRICING.rates.minimumHours} hours). The clock starts when we arrive at your address and stops when the truck doors close at the destination. Most local moves run between ${studio.priceLowLabel} (a small studio) and ${threeBd.priceHighLabel} (a 3-bedroom home).`,
    },
    {
      id: 'whats-included',
      question: "What's included in the price?",
      answer: `The hourly rate covers two movers, the cargo van, fuel, transit time, and standard wrapping (moving blankets, plastic film). There is no fuel surcharge, no stair fee, no weekend upcharge, and no per-item heavy-piece fee. Photo documentation of every job is included at no extra cost.`,
    },
    {
      id: 'whats-not-included',
      question: "What's not included?",
      answer: `We don't provide packing materials or pack rooms for you — your loose items should be boxed before move day, and we'll wrap and load furniture, fragile pieces, and what you've already boxed. We don't transport hazardous materials (paint, propane, batteries, fuel), firearms, live animals, or cash and jewelry. We're a local-moves company only — no out-of-province moves and no inter-address storage.`,
    },
    {
      id: 'how-fast',
      question: 'How fast can you book a move?',
      answer: q4Answer,
    },
    {
      id: 'overage',
      question: 'What if my move runs longer than estimated?',
      answer: `Hourly billing means you only pay for the hours you actually use — if the move runs short, the bill runs short. Our target overage from quote to final bill is under ${overageThreshold}%. The rate is the same regardless of duration; there is no surcharge for hour 6 versus hour 3.`,
    },
    {
      id: 'insurance',
      question: 'Are you insured?',
      answer: insuranceAnswer,
    },
    {
      id: 'damage',
      question: 'What if something gets damaged?',
      answer: `Every job is photo-documented before, during, and after — fragile items, furniture condition, the load-out, and the load-in. If something is damaged, those photos are the first record we check, alongside your description and any photos you took. We respond to claims ${PRICING.claims.damageResponseLabel}, and the photos are archived for the duration of the insurance policy's claim window.`,
    },
    {
      id: 'screening',
      question: 'How do you screen your movers?',
      answer: `Every Inlet crew member is trained and vetted before they take a job — hired directly by Inlet, briefed on the specifics of your move before arrival, and introduced by name when they arrive. Background-checked, reference-checked, and hired directly by Inlet — no anonymous subcontractors. The same crew handles your move from start to finish.`,
    },
    {
      id: 'out-of-area',
      question: 'Do you move outside Metro Vancouver?',
      answer: `No — Inlet is a local-moves company only. We don't move to Whistler, Hope, the Okanagan, or interprovincially, and we don't store goods between addresses. For long-haul or interprovincial moves, the Canadian Association of Movers maintains a public directory of vetted long-haul carriers.`,
    },
    {
      id: 'how-to-quote',
      question: 'How do I get a quote?',
      answer: `Submit a 60-second form at ${quoteHost} — six questions, no login, no credit card required. A real human texts back within an hour with a written estimate (target ${PRICING.claims.responseTimeMinutes} minutes). Most quotes get a confirmed date within the same week.`,
    },
  ];
}
