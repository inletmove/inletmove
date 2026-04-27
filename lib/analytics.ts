/**
 * Analytics event helper. Week 1 logs to console only.
 * Week 3 wires up Vercel Analytics + (optional) PostHog.
 */

type EventName =
  | 'quote_form_started'
  | 'quote_form_step_completed'
  | 'quote_form_submitted'
  | 'quote_form_error'
  | 'lang_switcher_opened'
  | 'compare_toggle_clicked'
  | 'cta_clicked'
  | 'phone_link_clicked';

export function track(name: EventName, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[track]', name, payload);
  }
  // Week 3: forward to Vercel Analytics / PostHog here.
}
