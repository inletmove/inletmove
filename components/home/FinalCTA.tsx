import { Button } from '@/components/ui/Button';
import { useTranslations } from '@/lib/i18n';

export function FinalCTA() {
  const t = useTranslations();
  return (
    <section
      aria-label="Ready to move?"
      className="bg-paper px-6 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 font-display text-display-2 font-medium leading-tight tracking-tight text-inlet-navy display-soft">
          Ready to <em className="display-italic text-ember">move?</em>
        </h2>
        <p className="mb-10 font-body text-lg leading-relaxed text-graphite">
          {t('final_cta.sub')}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button href="/quote" variant="primary" size="lg" icon={<span className="arrow">→</span>}>
            {t('final_cta.primary')}
          </Button>
          <Button href={`tel:${t('footer.phone_placeholder').replace(/\D/g, '')}`} variant="ghost-light" size="lg">
            📞 {t('footer.phone_placeholder')}
          </Button>
        </div>
      </div>
    </section>
  );
}
