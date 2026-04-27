import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';

export function Footer() {
  const t = useTranslations();
  return (
    <footer className="border-t border-line-light bg-inlet-deep text-bone">
      <div className="mx-auto max-w-container px-6 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-display text-xl font-medium tracking-tight display-soft"
            >
              inlet move <span className="text-ember">.</span>
            </Link>
            <p className="mt-3 font-body text-sm leading-relaxed text-mist">
              Honest, careful local movers in Metro Vancouver.
              <br />
              <span className="font-mono text-xs text-mist-dim">$150/hr · $300 minimum · same-week</span>
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-mist-dim">
              {t('footer.service_area_label')}
            </h2>
            <p className="font-body text-sm leading-relaxed text-mist">
              {t('footer.service_area')}
            </p>
            <Link
              href="/movers"
              className="mt-3 inline-block font-body text-sm text-teal-glow underline-offset-4 hover:underline"
            >
              All neighborhoods →
            </Link>
          </div>

          <div>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-mist-dim">
              {t('footer.company_label')}
            </h2>
            <ul className="space-y-2 font-body text-sm">
              <li>
                <Link href="/quote" className="text-bone hover:text-ember-warm">
                  {t('footer.links.quote')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-bone hover:text-ember-warm">
                  {t('footer.links.about')}
                </Link>
              </li>
              <li>
                <Link href="/movers" className="text-bone hover:text-ember-warm">
                  {t('footer.links.movers')}
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-mist hover:text-bone">
                  {t('footer.links.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-mist hover:text-bone">
                  {t('footer.links.terms')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-mist-dim">
              {t('footer.contact_label')}
            </h2>
            <ul className="space-y-2 font-body text-sm">
              <li>
                <a
                  href={`tel:${t('footer.phone_placeholder').replace(/\D/g, '')}`}
                  className="font-mono text-bone hover:text-ember-warm"
                >
                  {t('footer.phone_placeholder')}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${t('footer.email')}`}
                  className="text-bone hover:text-ember-warm"
                >
                  {t('footer.email')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-line-darker pt-6 text-xs text-mist-dim md:flex-row md:items-center">
          <p>{t('footer.copyright')}</p>
          <p>
            <Link href="/colophon" className="hover:text-mist">
              {t('footer.attribution')}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
