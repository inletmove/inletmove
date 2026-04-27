-- ============================================================================
-- inletmove-prod · seed-neighborhoods.sql
-- ----------------------------------------------------------------------------
-- Seeds the 3 starter neighborhoods. Mirrors content/neighborhoods.json so the
-- programmatic pages render identically whether reading from JSON (Week 1) or
-- Supabase (Week 3 once Supabase is provisioned).
-- ============================================================================

insert into public.neighborhoods (slug, display_name, city, region, postal_codes, primary_persona, copy_intro, copy_movein_pattern, active)
values
  (
    'mt-pleasant',
    'Mt Pleasant',
    'Vancouver',
    'Vancouver East Side',
    array['V5T','V5V'],
    'young_professional',
    'Mt Pleasant is one of Vancouver''s most-moved-into neighborhoods. Inlet Move Co. handles studio and one-bedroom moves between Mt Pleasant and the rest of Metro Vancouver every week. Same-week availability, hourly billing from $150/hr, $300 minimum. Quote in 60 seconds.',
    'Most Mt Pleasant moves we run are studio and one-bedroom apartments going to Yaletown, Kitsilano, or East Van. Walk-up buildings are common; we handle the stairs without a stair fee.',
    true
  ),
  (
    'yaletown',
    'Yaletown',
    'Vancouver',
    'Vancouver Downtown',
    array['V6Z','V6B'],
    'young_professional',
    'Yaletown moves are typically condo-to-condo with elevator coordination. Inlet Move Co. handles building bookings and elevator pads as part of the standard hourly rate — no concierge fee, no elevator surcharge. Quote in 60 seconds; same-week availability.',
    'Condo-to-condo within the downtown core, or downtown-to-suburb (North Van, Burnaby) for couples upgrading to larger spaces.',
    true
  ),
  (
    'burnaby-metrotown',
    'Burnaby — Metrotown',
    'Burnaby',
    'Central Burnaby',
    array['V5H','V5G'],
    'family',
    'Metrotown moves are often 2- and 3-bedroom moves into and out of high-rise condos. Inlet Move Co. handles two-mover crews + cargo van for hourly billing from $150/hr, $300 minimum. Multigenerational moves are a specialty — we''re trained for households with extended family and ceremonial items.',
    'Condo-to-condo within Burnaby, or Metrotown-to-Surrey for families upgrading to detached homes.',
    true
  )
on conflict (slug) do update set
  display_name = excluded.display_name,
  city = excluded.city,
  region = excluded.region,
  postal_codes = excluded.postal_codes,
  primary_persona = excluded.primary_persona,
  copy_intro = excluded.copy_intro,
  copy_movein_pattern = excluded.copy_movein_pattern,
  active = excluded.active;
