import { describe, expect, it } from 'vitest';
import { quoteSchema } from '@/components/quote/schema';

describe('quoteSchema', () => {
  const valid = {
    size: 'studio' as const,
    from_address: '123 Main St, Vancouver',
    to_address: '456 Hastings St, Burnaby',
    preferred_date: '2026-05-15',
    preferred_time: 'morning' as const,
    notes: '',
    contact_name: 'Maya',
    contact_phone: '604-555-0100',
    contact_email: '',
  };

  it('accepts a valid payload', () => {
    expect(quoteSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an invalid size', () => {
    const r = quoteSchema.safeParse({ ...valid, size: 'mansion' });
    expect(r.success).toBe(false);
  });

  it('rejects a too-short address', () => {
    const r = quoteSchema.safeParse({ ...valid, from_address: 'no' });
    expect(r.success).toBe(false);
  });

  it('rejects an invalid email when one is provided', () => {
    const r = quoteSchema.safeParse({ ...valid, contact_email: 'not-an-email' });
    expect(r.success).toBe(false);
  });

  it('accepts an empty optional email', () => {
    const r = quoteSchema.safeParse({ ...valid, contact_email: '' });
    expect(r.success).toBe(true);
  });
});
