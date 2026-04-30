import pricingData from '@pricing';

export interface PricingConfig {
  $schema?: string;
  lastUpdated: string;
  source: 'manual' | 'moveros-crm';
  currency: 'CAD';
  rates: {
    hourlyRate: number;
    minimumCharge: number;
    minimumHours: number;
    varies: boolean;
    hourlyRateLabel: string;
    variabilityNote: string;
  };
  fleet: {
    cargoVan: {
      type: string;
      primary: boolean;
      use: string;
    };
    truck: {
      type: string;
      primary: boolean;
      use: string;
    };
  };
  phone: {
    vanity: string;
    tel: string;
    active: boolean;
  };
  claims: {
    responseTimeMinutes: number;
    onTimePercent: number;
    overagePercent: number;
    insuranceAmountCAD: number;
    insuranceLabel: string;
    emailResponseHours: number;
    damageResponseLabel: string;
  };
  reviews: {
    ratingValue: number | null;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
    minCountForSchema: number;
  };
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  retention: {
    operationalMonths: number;
    photosNote: string;
    financialNote: string;
  };
  hours: {
    inquiries: string;
    inquiryAgent: string | null;
    movesOpens: string;
    movesCloses: string;
    movesDays: string[];
    timezone: string;
  };
  trust: {
    bcRegistered: boolean;
    workSafeBCActive: boolean;
    insuranceBound: boolean;
  };
  links: {
    quote: string;
  };
  tiers: {
    studio: TierConfig;
    '1-bedroom': TierConfig;
    '2-bedroom': TierConfig;
    '3-bedroom': TierConfig;
    multigenerational: TierConfig;
    'senior-downsizing': TierConfig;
  };
  terms: {
    areaEligibility: string;
    scopeDecline: string;
    compact: string;
  };
}

export interface TierConfig {
  label: string;
  estimatedHours: [number, number];
}

export type TierSlug = keyof PricingConfig['tiers'];

export interface TierEstimate {
  slug: TierSlug;
  label: string;
  hoursLow: number;
  hoursHigh: number;
  priceLow: number;
  priceHigh: number;
  priceLowLabel: string;
  priceHighLabel: string;
  rangeLabel: string;
  hoursLabel: string;
}

export const PRICING: PricingConfig = pricingData as PricingConfig;

export interface TrustCopy {
  bcRegistered: string;
  workSafeBC: string;
  insurance: string;
}

/**
 * Trust copy resolver — the single source of truth for trust assertions
 * consumed by both body copy and JSON-LD. Each claim hedges independently:
 * BC reg, WorkSafeBC, and insurance can each flip false without dragging
 * the others down. Realistic case: insurance lapses during renewal while
 * BC reg + WorkSafeBC stay active.
 *
 * Components compose these three strings at the call site; never inline
 * the verified or hedged forms in markup.
 */
/**
 * Maya AI-agent live check. When true, "24/7 inquiries" copy renders
 * across /contact, /faq, and Organization.contactPoint hoursAvailable.
 * When false, all such copy automatically reverts to the conservative
 * "movesOpens-movesCloses" hours window — flipping pricing.json.hours
 * .inquiryAgent to null is the launch-day kill switch.
 */
export function isInquiryAgentLive(): boolean {
  return PRICING.hours.inquiryAgent !== null && PRICING.hours.inquiries === '24/7';
}

/** "08:00-20:00 PT" formatted move-dispatch window for prose. */
export function movesHoursLabel(): string {
  return `${PRICING.hours.movesOpens}-${PRICING.hours.movesCloses} PT`;
}

/**
 * Quote-link absolute URL — resolves PRICING.links.quote to an absolute
 * URL suitable for JSON-LD schema contexts (ReserveAction.urlTemplate,
 * Service.offers.url) where relative paths are technically valid but
 * search engines and AI crawlers prefer absolute. CTA <a href> can use
 * PRICING.links.quote directly; browsers handle relative paths natively.
 *
 * If links.quote starts with "/" (internal /quote intake form),
 * prepends the canonical site origin. If it starts with "http",
 * returns as-is (external quote app deployment).
 */
const SITE_ORIGIN = 'https://inletmove.ca';
export function quoteUrlAbsolute(): string {
  const v = PRICING.links.quote;
  if (v.startsWith('http')) return v;
  if (v.startsWith('/')) return SITE_ORIGIN + v;
  return SITE_ORIGIN + '/' + v;
}

/**
 * Quote-link display string — for prose contexts ("Submit a 60-second
 * form at X"). Strips protocol from absolute URLs; prepends the canonical
 * host to relative paths so the displayed text always reads as a
 * domain.path form.
 */
export function quoteLinkDisplay(): string {
  const v = PRICING.links.quote;
  if (v.startsWith('http')) return v.replace(/^https?:\/\//, '');
  if (v.startsWith('/')) return 'inletmove.ca' + v;
  return 'inletmove.ca/' + v;
}

/**
 * Tier price math — derives "$750–$1,050" from hourly rate × estimated hours.
 * Computed at build time so a hourlyRate change in pricing.json propagates
 * to every tier page on next build with no per-page edits. Used by
 * /[tier]-movers pages and by Service-schema priceSpecification ranges.
 */
export function tierEstimate(slug: TierSlug): TierEstimate {
  const tier = PRICING.tiers[slug];
  const [hoursLow, hoursHigh] = tier.estimatedHours;
  const priceLow = hoursLow * PRICING.rates.hourlyRate;
  const priceHigh = hoursHigh * PRICING.rates.hourlyRate;
  const fmt = (n: number) =>
    n >= 1000 ? `$${n.toLocaleString('en-CA')}` : `$${n}`;
  return {
    slug,
    label: tier.label,
    hoursLow,
    hoursHigh,
    priceLow,
    priceHigh,
    priceLowLabel: fmt(priceLow),
    priceHighLabel: fmt(priceHigh),
    rangeLabel: `${fmt(priceLow)}–${fmt(priceHigh)}`,
    hoursLabel: hoursLow === hoursHigh ? `${hoursLow} hours` : `${hoursLow}–${hoursHigh} hours`,
  };
}

export function trustCopy(): TrustCopy {
  return {
    bcRegistered: PRICING.trust.bcRegistered
      ? 'BC-registered'
      : 'BC registration in progress',
    workSafeBC: PRICING.trust.workSafeBCActive
      ? 'WorkSafeBC clearance active'
      : 'WorkSafeBC application in progress',
    insurance: PRICING.trust.insuranceBound
      ? PRICING.claims.insuranceLabel
      : 'Insurance application in progress · $2M target coverage',
  };
}
