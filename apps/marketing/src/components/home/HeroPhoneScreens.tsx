import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Screen content for the hero phone mockup. Accepts a step number and
 * renders the appropriate quote-flow screen state. Transitions between
 * screens use Framer Motion's AnimatePresence with a subtle slide-up + fade.
 *
 * Step legend:
 *   4 = "When are you moving?" (date select)
 *   5 = "How big is your home?" (size select)
 *   6 = "Quick details" (contact form preview)
 *   7 = success state — "Quote received in 47 seconds"
 *
 * Honesty contracts: no fabricated names or counts. The contact name in
 * step 6 is "Maya" — Maya is our editorial persona placeholder, the same
 * one used for /about scenes; alt text on those photos already discloses
 * "AI-generated Maya character lands in a follow-up session". Acceptable
 * because the screen IS demonstrably a UI mockup, not a customer testimonial.
 *
 * Easing: cubic-bezier(0.16, 1, 0.3, 1) — Apple-style ease-out.
 */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SCREEN_DURATION = 0.32;

const screenVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: SCREEN_DURATION, ease: EASE } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.22, ease: EASE } },
};

interface Props {
  step: number;
}

/** Wraps each screen in motion.div + the inner padding shared by all screens. */
function ScreenShell({ children, label, step }: { children: ReactNode; label: string; step: number }) {
  const progress = step <= 6 ? `Step ${step} / 6` : 'Done';
  const widthPct = step <= 6 ? Math.min(100, (step / 6) * 100) : 100;

  return (
    <motion.div
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="absolute inset-0 flex flex-col px-5 pb-5 pt-8"
      aria-label={label}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-base font-medium tracking-tight text-inlet-navy display-soft">
          inlet move <span className="text-ember">.</span>
        </span>
        <span className="font-mono text-[0.625rem] font-medium uppercase tracking-widest text-graphite">
          {progress}
        </span>
      </div>
      <div className="mb-6 h-[3px] overflow-hidden rounded-full bg-bone-warm">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #1F7A8C, #E76F51)' }}
          initial={false}
          animate={{ width: `${widthPct}%` }}
          transition={{ duration: 0.45, ease: EASE }}
        />
      </div>
      {children}
    </motion.div>
  );
}

function Step4Date() {
  return (
    <ScreenShell label="When are you moving?" step={4}>
      <div className="mb-2 font-display text-[1.4rem] font-medium leading-tight tracking-tight text-inlet-navy display-soft">
        When are you moving?
      </div>
      <div className="mb-6 font-body text-sm text-graphite">Same-week available.</div>
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-md border border-pacific bg-pacific/5 px-3.5 py-3 font-body text-sm font-medium text-inlet-navy">
          <span>This Saturday</span>
          <span className="font-mono text-[0.625rem] text-pacific">SELECTED</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-line-mid px-3.5 py-3 font-body text-sm text-charcoal">
          <span>Next Tuesday</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-line-mid px-3.5 py-3 font-body text-sm text-charcoal">
          <span>Next Saturday</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-line-mid px-3.5 py-3 font-body text-sm text-charcoal">
          <span>Choose a date</span>
        </div>
      </div>
      <div className="mt-auto rounded-md bg-ember py-3 text-center font-body text-sm font-semibold text-bone shadow-cta">
        Continue &rarr;
      </div>
    </ScreenShell>
  );
}

function Step5Size() {
  return (
    <ScreenShell label="How big is your home?" step={5}>
      <div className="mb-2 font-display text-[1.4rem] font-medium leading-tight tracking-tight text-inlet-navy display-soft">
        How big is your home?
      </div>
      <div className="mb-6 font-body text-sm text-graphite">Pick the closest fit.</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-line-mid px-3 py-3 text-center font-body text-sm text-charcoal">
          Studio
        </div>
        <div className="rounded-md border border-pacific bg-pacific/5 px-3 py-3 text-center font-body text-sm font-medium text-inlet-navy">
          1-bed
          <span className="ml-1 font-mono text-[0.625rem] text-pacific">✓</span>
        </div>
        <div className="rounded-md border border-line-mid px-3 py-3 text-center font-body text-sm text-charcoal">
          2-bed
        </div>
        <div className="rounded-md border border-line-mid px-3 py-3 text-center font-body text-sm text-charcoal">
          3-bed
        </div>
        <div className="col-span-2 rounded-md border border-line-mid px-3 py-3 text-center font-body text-sm text-charcoal">
          Multigen / senior
        </div>
      </div>
      <div className="mt-auto rounded-md bg-ember py-3 text-center font-body text-sm font-semibold text-bone shadow-cta">
        Continue &rarr;
      </div>
    </ScreenShell>
  );
}

function Step6Details() {
  return (
    <ScreenShell label="Quick details" step={6}>
      <div className="mb-2 font-display text-[1.4rem] font-medium leading-tight tracking-tight text-inlet-navy display-soft">
        Quick details
      </div>
      <div className="mb-6 font-body text-sm text-graphite">Just so we can text you back.</div>
      <div className="space-y-2.5">
        <div>
          <div className="mb-1 font-mono text-[0.6rem] uppercase tracking-widest text-graphite">Name</div>
          <div className="rounded-md border border-line-mid bg-paper px-3 py-2.5 font-body text-sm text-inlet-navy">
            Maya L.
          </div>
        </div>
        <div>
          <div className="mb-1 font-mono text-[0.6rem] uppercase tracking-widest text-graphite">Phone</div>
          <div className="rounded-md border border-line-mid bg-paper px-3 py-2.5 font-body text-sm text-inlet-navy">
            (604) 555-0142
          </div>
        </div>
        <div>
          <div className="mb-1 font-mono text-[0.6rem] uppercase tracking-widest text-graphite">From</div>
          <div className="rounded-md border border-line-mid bg-paper px-3 py-2.5 font-body text-sm text-inlet-navy">
            Mt Pleasant
          </div>
        </div>
      </div>
      <div className="mt-auto rounded-md bg-ember py-3 text-center font-body text-sm font-semibold text-bone shadow-cta">
        Get my quote &rarr;
      </div>
    </ScreenShell>
  );
}

function SuccessScreen() {
  return (
    <ScreenShell label="Quote received" step={7}>
      <div className="mt-6 flex flex-col items-center text-center">
        <motion.div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden>
            <motion.path
              d="M5 12 L10 17 L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
            />
          </svg>
        </motion.div>
        <div className="mb-1 font-display text-[1.4rem] font-medium leading-tight tracking-tight text-inlet-navy display-soft">
          Quote received
        </div>
        <div className="mb-6 font-body text-sm text-graphite">in 47 seconds.</div>
        <div className="mb-2 w-full rounded-md border border-line-light bg-bone p-3 text-left">
          <div className="font-mono text-[0.6rem] uppercase tracking-widest text-graphite">Estimate</div>
          <div className="font-display text-2xl font-medium text-inlet-navy display-soft">
            $450 – $600
          </div>
          <div className="mt-1 font-mono text-[0.65rem] text-graphite">
            1-bed · This Saturday · ~3.5h
          </div>
        </div>
        <div className="font-mono text-[0.65rem] text-graphite">A real human follows up by text.</div>
      </div>
    </ScreenShell>
  );
}

export default function HeroPhoneScreens({ step }: Props) {
  // Clamp + select
  const safe = Math.max(4, Math.min(7, Math.round(step)));
  return (
    <div className="relative h-full w-full">
      <AnimatePresence mode="wait" initial={false}>
        {safe === 4 && <Step4Date key="step4" />}
        {safe === 5 && <Step5Size key="step5" />}
        {safe === 6 && <Step6Details key="step6" />}
        {safe === 7 && <SuccessScreen key="step7" />}
      </AnimatePresence>
    </div>
  );
}
