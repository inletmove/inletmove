import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms of service for Inlet Move Co.',
};

export default function TermsPage() {
  return (
    <article className="bg-paper px-6 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-prose space-y-5 font-body text-charcoal">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-graphite">Legal</p>
        <h1 className="font-display text-3xl font-medium leading-tight tracking-tight text-inlet-navy display-soft">
          Terms.
        </h1>
        <p className="text-sm text-graphite">
          [Pending legal review — Week 3 deliverable. This page is a placeholder so the route
          exists for footer linking and sitemap.xml generation.]
        </p>
        <h2 className="pt-4 font-display text-xl font-medium leading-tight text-inlet-navy display-soft">
          Pricing
        </h2>
        <p>
          $150/hr per two-mover crew with cargo van. $300 minimum (two-hour minimum). Billed in
          15-minute increments after the minimum is met. Hourly rate includes wrap, padding, basic
          disassembly and reassembly, fuel, and standard insurance. No surcharges for stairs, weekends,
          or fuel.
        </p>
        <h2 className="pt-4 font-display text-xl font-medium leading-tight text-inlet-navy display-soft">
          Heavy or specialty items
        </h2>
        <p>
          Pianos, safes, and certain specialty items may require additional planning. We will
          surface any such items during the quote conversation; nothing is invoiced as a surprise.
        </p>
        <h2 className="pt-4 font-display text-xl font-medium leading-tight text-inlet-navy display-soft">
          Liability
        </h2>
        <p>
          Inlet Move Co. carries $2M cargo + liability coverage on every move. Claims procedures
          are documented in your move-day paperwork.
        </p>
      </div>
    </article>
  );
}
