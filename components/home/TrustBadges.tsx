import { cn } from '@/lib/cn';

type Badge = {
  key: string;
  title: string;
  value: string;
  verifyHref?: string;
  pending: boolean;
};

const BADGES: Badge[] = [
  {
    key: 'bc_reg',
    title: 'BC Registered',
    value: 'Reg # [Pending verification]',
    pending: true,
  },
  {
    key: 'wcb',
    title: 'WorkSafeBC',
    value: 'Clearance active',
    verifyHref: 'https://online.worksafebc.com/clearancepermission/',
    pending: false,
  },
  {
    key: 'insured',
    title: 'Insured',
    value: '$2M cargo + liability',
    pending: true,
  },
  {
    key: 'gst',
    title: 'GST Registered',
    value: 'GST # [Pending verification]',
    pending: true,
  },
];

export function TrustBadges() {
  return (
    <section aria-label="Verified" className="bg-bone px-6 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-container">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-pacific">Verified</p>
          <h2 className="font-display text-display-2 font-medium leading-tight tracking-tight text-inlet-navy display-soft">
            The boring stuff, <em className="display-italic text-pacific">all in order.</em>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {BADGES.map((b) => (
            <div
              key={b.key}
              className="group flex items-start gap-4 rounded-xl border border-line-light bg-paper p-6"
            >
              <div
                aria-hidden
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-pacific/10 text-pacific"
              >
                {/* simple geometric mark per badge type */}
                <span className="font-display text-xl font-medium display-soft">✓</span>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-body text-sm font-semibold text-inlet-navy">{b.title}</h3>
                <p
                  className={cn(
                    'font-mono text-xs',
                    b.pending ? 'text-amber' : 'text-graphite',
                  )}
                >
                  {b.value}
                </p>
                {b.verifyHref && (
                  <a
                    href={b.verifyHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 inline-block font-body text-xs text-pacific underline-offset-4 hover:underline"
                  >
                    Verify →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 font-mono text-[0.7rem] text-mist-dim">
          Pending values are filled in by Feroz before public launch (week 3).
        </p>
      </div>
    </section>
  );
}
