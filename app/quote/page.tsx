import type { Metadata } from 'next';
import { QuoteForm } from '@/components/quote/QuoteForm';

export const metadata: Metadata = {
  title: 'Get a quote',
  description:
    'Quote in 60 seconds. Six questions, no login, no site visit. Real human follow-up within the hour.',
};

export default function QuotePage() {
  return (
    <article className="bg-paper px-6 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-pacific">
          Quote · 60 seconds
        </p>
        <h1 className="mb-3 font-display text-display-2 font-medium leading-tight tracking-tight text-inlet-navy display-soft">
          Tell us about your <em className="display-italic text-ember">move.</em>
        </h1>
        <p className="mb-10 font-body text-lg text-graphite">
          Six questions. No login. No site visit. We'll text a precise quote within the hour.
        </p>

        <QuoteForm />

        <p className="mt-10 font-mono text-[0.7rem] text-mist-dim">
          By submitting, you consent to be contacted by SMS and email about your move. We don't
          sell or share your information. See{' '}
          <a className="text-pacific underline" href="/legal/privacy">
            Privacy
          </a>
          .
        </p>
      </div>
    </article>
  );
}
