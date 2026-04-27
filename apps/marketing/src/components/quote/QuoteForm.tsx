import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/cn';

/**
 * Quote form — native HTML5 form with a thin React submit wrapper.
 * Posts JSON to PUBLIC_QUOTE_ENDPOINT (set in apps/marketing/.env).
 *
 * v1: PUBLIC_QUOTE_ENDPOINT=/quote-handler.php (Hostinger PHP shim, emails Feroz)
 * v1.1: PUBLIC_QUOTE_ENDPOINT=https://quote.inletmove.ca/api/quote (Vercel + Supabase)
 *
 * The swap is one env var change. The form code does not need to change.
 * Field names are snake_case to match the eventual Vercel/Supabase schema
 * and the existing apps/quote/components/quote/schema.ts.
 */

const ENDPOINT = import.meta.env.PUBLIC_QUOTE_ENDPOINT || '/quote-handler.php';

const SIZE_OPTIONS = [
  { value: 'studio', label: 'Studio' },
  { value: '1bed', label: '1-bedroom' },
  { value: '2bed', label: '2-bedroom' },
  { value: '3bed', label: '3-bedroom or larger' },
  { value: 'multigen', label: 'Multigenerational household' },
  { value: 'senior', label: 'Senior or downsizing move' },
  { value: 'single_item', label: 'Single item or partial' },
];

const TIME_OPTIONS = [
  { value: 'flexible', label: "I'm flexible" },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

type SubmissionState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; id?: string }
  | { kind: 'error'; message: string };

const inputClass =
  'w-full rounded-md border border-line-mid bg-white px-4 py-3 font-body text-base text-charcoal transition focus:border-pacific focus:outline-none focus:ring-4 focus:ring-pacific/15';

const labelClass = 'mb-2 inline-block font-body text-sm font-semibold text-inlet-navy';

export default function QuoteForm() {
  const [state, setState] = useState<SubmissionState>({ kind: 'idle' });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.kind === 'submitting') return;
    setState({ kind: 'submitting' });

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const payload = {
      ...data,
      submitted_at: new Date().toISOString(),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      landing_page: typeof window !== 'undefined' ? window.location.pathname : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await r.json().catch(() => ({}))) as {
        success?: boolean;
        ok?: boolean;
        quoteId?: string;
        id?: string;
        error?: string;
        message?: string;
      };
      const ok = (json.success ?? json.ok) === true;
      if (!r.ok || !ok) {
        throw new Error(
          json.error || json.message || 'Submission failed. Please try again or call us.',
        );
      }
      setState({ kind: 'success', id: json.quoteId ?? json.id });
      form.reset();
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Network error. Please try again or call (604) 000-0000.';
      setState({ kind: 'error', message });
    }
  };

  if (state.kind === 'success') {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-10 text-center">
        <h2 className="mb-3 font-display text-3xl font-medium tracking-tight text-inlet-navy display-soft">
          We've got it.
        </h2>
        <p className="mb-2 font-body text-lg text-charcoal">
          A real human will text you a precise quote within an hour. If you don't hear from us by
          then, call (604) 000-0000.
        </p>
        {state.id && (
          <p className="mb-6 font-mono text-xs text-graphite">
            Reference: <span className="text-inlet-navy">{state.id}</span>
          </p>
        )}
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-line-mid bg-paper px-6 py-3 font-body text-sm font-semibold text-inlet-navy transition hover:bg-bone-warm"
        >
          Back to home
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="size" className={labelClass}>
          What are you moving? <span className="text-ember">*</span>
        </label>
        <select id="size" name="size" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Pick one
          </option>
          {SIZE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="from_address" className={labelClass}>
          From where? <span className="text-ember">*</span>
        </label>
        <input
          id="from_address"
          name="from_address"
          type="text"
          required
          minLength={5}
          maxLength={300}
          autoComplete="street-address"
          placeholder="Street address, city"
          className={inputClass}
        />
        <p className="mt-1.5 font-mono text-[0.7rem] text-mist-dim">
          Address autocomplete (Google Places) wires up in v1.1.
        </p>
      </div>

      <div>
        <label htmlFor="to_address" className={labelClass}>
          To where? <span className="text-ember">*</span>
        </label>
        <input
          id="to_address"
          name="to_address"
          type="text"
          required
          minLength={5}
          maxLength={300}
          placeholder="Street address, city"
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="preferred_date" className={labelClass}>
            When? <span className="text-ember">*</span>
          </label>
          <input
            id="preferred_date"
            name="preferred_date"
            type="date"
            required
            className={inputClass}
          />
          <p className="mt-1.5 font-mono text-[0.7rem] text-mist-dim">Same-week available.</p>
        </div>
        <div>
          <label htmlFor="preferred_time" className={labelClass}>
            Time of day
          </label>
          <select
            id="preferred_time"
            name="preferred_time"
            className={inputClass}
            defaultValue="flexible"
          >
            {TIME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Anything we should know?
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={2000}
          placeholder="Stairs, elevator, parking, pets, religious or ceremonial items, anything else."
          className={inputClass}
        />
        <p className="mt-1.5 font-mono text-[0.7rem] text-mist-dim">Optional but helpful.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label htmlFor="contact_name" className={labelClass}>
            Your name <span className="text-ember">*</span>
          </label>
          <input
            id="contact_name"
            name="contact_name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact_phone" className={labelClass}>
            Phone <span className="text-ember">*</span>
          </label>
          <input
            id="contact_phone"
            name="contact_phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="604-000-0000"
            className={inputClass}
          />
          <p className="mt-1.5 font-mono text-[0.7rem] text-mist-dim">We'll text your quote.</p>
        </div>
        <div>
          <label htmlFor="contact_email" className={labelClass}>
            Email
          </label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={inputClass}
          />
          <p className="mt-1.5 font-mono text-[0.7rem] text-mist-dim">Optional.</p>
        </div>
      </div>

      {state.kind === 'error' && (
        <p
          role="alert"
          className="rounded-md border border-error/30 bg-error/5 p-3 font-body text-sm text-error"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-col items-stretch justify-between gap-4 border-t border-line-light pt-6 sm:flex-row sm:items-center">
        <p className="font-mono text-xs text-mist-dim">
          By submitting, you agree to our{' '}
          <a href="/legal/privacy" className="underline-offset-4 hover:underline">
            privacy policy
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={state.kind === 'submitting'}
          className={cn(
            'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md bg-ember px-7 py-3.5 font-body text-base font-semibold text-bone shadow-cta transition-all',
            'hover:-translate-y-px hover:scale-[1.02] hover:bg-ember-warm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          {state.kind === 'submitting' ? 'Sending…' : 'Get my quote'}
          <span aria-hidden>→</span>
        </button>
      </div>
    </form>
  );
}
