import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Colophon',
  description:
    'Notes on the technology and partners behind Inlet Move Co. — MoverOS (operations) and Demandra (marketing).',
};

/**
 * Colophon — the single page where MoverOS and Demandra are mentioned.
 * Per mega prompt §3.1: plain page, no CTA, no marketing.
 */
export default function ColophonPage() {
  return (
    <article className="bg-paper px-6 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-prose">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-graphite">Colophon</p>
        <h1 className="mb-8 font-display text-3xl font-medium leading-tight tracking-tight text-inlet-navy display-soft">
          About this site.
        </h1>

        <div className="space-y-5 font-body text-charcoal">
          <p>
            Inlet Move Co. is a Metro Vancouver moving company. This site is the front door — a
            quote form, a service area, a few pages explaining how we work.
          </p>
          <p>
            <strong>MoverOS</strong> is the operations platform powering Inlet Move Co. and similar
            moving operators. It handles dispatch, scheduling, photo documentation, and customer
            communication behind the scenes. Customers do not interact with MoverOS directly.
          </p>
          <p>
            <strong>Demandra</strong> is the marketing partner that runs Inlet Move Co.'s ads, SEO,
            and analytics.
          </p>
          <p className="pt-4 text-sm text-graphite">
            That is the whole story. There is nothing to sign up for here.
          </p>
        </div>
      </div>
    </article>
  );
}
