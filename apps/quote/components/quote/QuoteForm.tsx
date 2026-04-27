'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { track } from '@/lib/analytics';
import { quoteSchema, type QuoteInput } from './schema';

const SIZE_OPTIONS = [
  { value: 'studio', label: 'Studio' },
  { value: '1bed', label: '1-bedroom' },
  { value: '2bed', label: '2-bedroom' },
  { value: '3bed', label: '3-bedroom or larger' },
  { value: 'multigen', label: 'Multigenerational household' },
  { value: 'senior', label: 'Senior or downsizing move' },
  { value: 'single_item', label: 'Single item or partial' },
] as const;

const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'flexible', label: "I'm flexible" },
] as const;

type Step = 0 | 1 | 2 | 3 | 4 | 5;
const TOTAL_STEPS = 6;

type SubmissionState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; id: string }
  | { kind: 'error'; message: string };

export function QuoteForm() {
  const [step, setStep] = useState<Step>(0);
  const [submission, setSubmission] = useState<SubmissionState>({ kind: 'idle' });

  const {
    control,
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    mode: 'onTouched',
    defaultValues: {
      size: undefined,
      from_address: '',
      to_address: '',
      preferred_date: '',
      preferred_time: 'flexible',
      notes: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
    },
  });

  const stepFields: Array<Array<keyof QuoteInput>> = [
    ['size'],
    ['from_address'],
    ['to_address'],
    ['preferred_date', 'preferred_time'],
    ['notes'],
    ['contact_name', 'contact_phone', 'contact_email'],
  ];

  const next = async () => {
    const fields = stepFields[step];
    if (!fields) return;
    const valid = await trigger(fields);
    if (!valid) return;
    track('quote_form_step_completed', { step });
    if (step < TOTAL_STEPS - 1) setStep((s) => (s + 1) as Step);
  };

  const back = () => {
    if (step > 0) setStep((s) => (s - 1) as Step);
  };

  const onSubmit = async (data: QuoteInput) => {
    setSubmission({ kind: 'submitting' });
    try {
      const r = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = (await r.json()) as { ok: boolean; id?: string; message?: string };
      if (!r.ok || !result.ok || !result.id) {
        throw new Error(result.message ?? 'Something went wrong. Please try again.');
      }
      track('quote_form_submitted', { id: result.id });
      setSubmission({ kind: 'success', id: result.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      track('quote_form_error', { message });
      setSubmission({ kind: 'error', message });
    }
  };

  if (submission.kind === 'success') {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-10 text-center">
        <h2 className="mb-3 font-display text-3xl font-medium tracking-tight text-inlet-navy display-soft">
          We've got it.
        </h2>
        <p className="mb-2 font-body text-lg text-charcoal">
          We'll text you a precise quote within an hour.
        </p>
        <p className="mb-6 font-mono text-xs text-graphite">
          Reference: <span className="text-inlet-navy">{submission.id}</span>
        </p>
        <Button href="/" variant="ghost-light" size="md">
          Back to home
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <ProgressBar current={step} total={TOTAL_STEPS} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="min-h-[260px]"
        >
          {step === 0 && (
            <Field
              label="What are you moving?"
              error={errors.size?.message}
              required
            >
              <Controller
                control={control}
                name="size"
                render={({ field }) => (
                  <div className="grid gap-2">
                    {SIZE_OPTIONS.map((o) => (
                      <label
                        key={o.value}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-md border p-3.5 font-body text-sm transition-colors',
                          field.value === o.value
                            ? 'border-pacific bg-pacific/5 text-inlet-navy'
                            : 'border-line-mid text-charcoal hover:border-pacific/40',
                        )}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          checked={field.value === o.value}
                          onChange={() => field.onChange(o.value)}
                        />
                        <span>{o.label}</span>
                        {field.value === o.value && (
                          <span className="font-mono text-[0.625rem] uppercase tracking-widest text-pacific">
                            ✓ Selected
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              />
            </Field>
          )}

          {step === 1 && (
            <Field
              label="From where?"
              error={errors.from_address?.message}
              required
            >
              <input
                type="text"
                autoComplete="street-address"
                placeholder="Street address, city"
                className="text-input"
                {...register('from_address')}
              />
              <p className="mt-1.5 font-mono text-[0.7rem] text-mist-dim">
                Address autocomplete (Google Places) wires up post-Week 1.
              </p>
            </Field>
          )}

          {step === 2 && (
            <Field
              label="To where?"
              error={errors.to_address?.message}
              required
            >
              <input
                type="text"
                placeholder="Street address, city"
                className="text-input"
                {...register('to_address')}
              />
            </Field>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <Field
                label="When?"
                error={errors.preferred_date?.message}
                required
              >
                <input type="date" className="text-input" {...register('preferred_date')} />
                <p className="mt-1.5 font-mono text-[0.7rem] text-mist-dim">
                  Same-week available.
                </p>
              </Field>
              <Field label="Time of day" error={errors.preferred_time?.message}>
                <select className="text-input" {...register('preferred_time')}>
                  {TIME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {step === 4 && (
            <Field
              label="Anything we should know?"
              error={errors.notes?.message}
            >
              <textarea
                rows={5}
                placeholder="Stairs, elevator, parking, pets, religious or ceremonial items, anything else."
                className="text-input"
                {...register('notes')}
              />
              <p className="mt-1.5 font-mono text-[0.7rem] text-mist-dim">Optional but helpful.</p>
            </Field>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <Field label="Your name" error={errors.contact_name?.message} required>
                <input
                  type="text"
                  autoComplete="name"
                  className="text-input"
                  {...register('contact_name')}
                />
              </Field>
              <Field label="Phone" error={errors.contact_phone?.message} required>
                <input
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="604-000-0000"
                  className="text-input"
                  {...register('contact_phone')}
                />
                <p className="mt-1.5 font-mono text-[0.7rem] text-mist-dim">
                  We'll text your quote here.
                </p>
              </Field>
              <Field label="Email (optional)" error={errors.contact_email?.message}>
                <input
                  type="email"
                  autoComplete="email"
                  className="text-input"
                  {...register('contact_email')}
                />
              </Field>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {submission.kind === 'error' && (
        <p className="rounded-md border border-error/30 bg-error/5 p-3 font-body text-sm text-error">
          {submission.message}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-line-light pt-6">
        <Button
          variant="ghost-light"
          type="button"
          onClick={back}
          className={step === 0 ? 'invisible' : ''}
        >
          ← Back
        </Button>

        {step < TOTAL_STEPS - 1 ? (
          <Button variant="primary" type="button" onClick={next} icon={<span>→</span>}>
            Next
          </Button>
        ) : (
          <Button
            variant="primary"
            type="submit"
            disabled={submission.kind === 'submitting'}
            icon={<span>→</span>}
          >
            {submission.kind === 'submitting' ? 'Sending…' : 'Get my quote'}
          </Button>
        )}
      </div>

      <style jsx>{`
        :global(.text-input) {
          width: 100%;
          padding: 0.875rem 1rem;
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--charcoal);
          background: white;
          border: 1px solid var(--line-mid);
          border-radius: 8px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        :global(.text-input:focus) {
          outline: none;
          border-color: #1f7a8c;
          box-shadow: 0 0 0 3px rgba(31, 122, 140, 0.12);
        }
      `}</style>
    </form>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-graphite">
        <span>
          Step {current + 1} of {total}
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-bone-warm">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #1F7A8C, #E76F51)',
          }}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 inline-block font-body text-sm font-semibold text-inlet-navy">
        {label}
        {required && <span className="ml-0.5 text-ember">*</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 inline-block font-body text-xs text-error">{error}</span>}
    </label>
  );
}
