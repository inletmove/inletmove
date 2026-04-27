import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Inlet Move Co. is a Vancouver-based moving company built on three ideas: honest pricing, careful handling, and complete documentation.',
};

/**
 * About page — neutral framing per mega prompt §3.2 ("Vancouver-based" not
 * "owner-operated"; defer personal narrative until refugee hearing outcome
 * 2026-08-05). Real names + photos go in via Week 3 commission.
 */
export default function AboutPage() {
  return (
    <article className="bg-paper px-6 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-pacific">About</p>
        <h1 className="mb-8 font-display text-display-2 font-medium leading-tight tracking-tight text-inlet-navy display-soft">
          Vancouver-based. <em className="display-italic text-ember">Built on three ideas.</em>
        </h1>

        <div className="space-y-6 font-body text-lg leading-relaxed text-charcoal">
          <p>
            Inlet Move Co. is a local moving company serving Metro Vancouver. We work in two-mover
            crews with a cargo van, billing by the hour from $150/hr with a $300 minimum.
          </p>

          <h2 className="pt-4 font-display text-2xl font-medium leading-tight tracking-tight text-inlet-navy display-soft">
            Honest pricing
          </h2>
          <p>
            Hourly. Quoted in 60 seconds online. No fuel surcharge, no stair fee, no weekend
            upcharge. Quote = bill, with an average overage of 4.1% (industry average is around
            22%).
          </p>

          <h2 className="pt-4 font-display text-2xl font-medium leading-tight tracking-tight text-inlet-navy display-soft">
            Careful handling
          </h2>
          <p>
            Wrap and pad on every job. Trained for senior moves, multigenerational moves, and
            cultural and ceremonial items. $2M cargo and liability coverage on every move.
          </p>

          <h2 className="pt-4 font-display text-2xl font-medium leading-tight tracking-tight text-inlet-navy display-soft">
            Complete documentation
          </h2>
          <p>
            Photo records on every job — fragile items, before-and-after, load-out. If anything is
            ever questioned, there is proof. Bodycam ops are in pilot for Q4 2026; live crew
            tracking ships Q3 2026.
          </p>

          <p className="pt-4 text-graphite">
            We are early. Our team is still small. We do the work ourselves and we hire the rest of
            the crew with care. If you have a move that needs more than a sofa-and-a-couple-boxes
            kind of attention — a parent downsizing, a multigenerational household, a household
            with religious or ceremonial items — call us. That is why we are here.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button href="/quote" variant="primary" size="lg" icon={<span className="arrow">→</span>}>
            Get a quote
          </Button>
          <Button href="/movers" variant="ghost-light" size="lg">
            See where we work
          </Button>
        </div>
      </div>
    </article>
  );
}
