import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How Inlet Move Co. handles your information.',
};

export default function PrivacyPage() {
  return (
    <article className="bg-paper px-6 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-prose space-y-5 font-body text-charcoal">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-graphite">Legal</p>
        <h1 className="font-display text-3xl font-medium leading-tight tracking-tight text-inlet-navy display-soft">
          Privacy.
        </h1>
        <p className="text-sm text-graphite">
          [Pending legal review — Week 3 deliverable. This page is a placeholder so the route
          exists for footer linking and sitemap.xml generation.]
        </p>
        <h2 className="pt-4 font-display text-xl font-medium leading-tight text-inlet-navy display-soft">
          What we collect
        </h2>
        <p>
          When you submit a quote request, we collect your name, phone number, optional email,
          origin and destination addresses, preferred move date, and any notes you provide. This
          data is stored in our Supabase database in Oregon (us-west-1).
        </p>
        <h2 className="pt-4 font-display text-xl font-medium leading-tight text-inlet-navy display-soft">
          How we use it
        </h2>
        <p>
          To respond to your quote request, schedule your move, dispatch crew, and follow up.
          That's it. We do not sell your information. We do not share it with marketers.
        </p>
        <h2 className="pt-4 font-display text-xl font-medium leading-tight text-inlet-navy display-soft">
          Your rights
        </h2>
        <p>
          You can request deletion of your record by emailing{' '}
          <a className="text-pacific underline" href="mailto:hello@inletmove.com">
            hello@inletmove.com
          </a>
          . We will confirm within 30 days.
        </p>
      </div>
    </article>
  );
}
