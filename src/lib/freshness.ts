/**
 * Honesty helpers for data that ages.
 *
 * The site's whole proposition is "your honest friend" — so a listing checked in
 * April should not look identical to one checked last week. These two helpers are
 * the single source of truth for how confident the UI is allowed to sound, and
 * `scripts/audit-freshness.mjs` reads the same thresholds so the monthly sweep and
 * the rendered site never disagree.
 */

export type FreshnessTier = "fresh" | "aging" | "stale";

export interface Freshness {
  days: number;
  tier: FreshnessTier;
  /** Short form for badges: "Verified Jul", "Checked Apr". */
  label: string;
  /** Long form for detail pages. */
  longLabel: string;
  /** True once a listing is overdue for the monthly sweep. */
  needsRefresh: boolean;
}

/** Past this many days we stop saying "verified" and start saying "last checked". */
const AGING_AFTER_DAYS = 60;
const STALE_AFTER_DAYS = 120;

const MONTH_YEAR: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };

/**
 * `now` is injectable so the freshness audit script can reason about arbitrary
 * dates, and so tests don't depend on the wall clock.
 */
export function freshnessOf(lastVerified: string, now: Date = new Date()): Freshness {
  const then = new Date(lastVerified);
  const days = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 86_400_000));
  const when = then.toLocaleDateString("en-US", MONTH_YEAR);

  if (days <= AGING_AFTER_DAYS) {
    return { days, tier: "fresh", label: `Verified ${when}`, longLabel: `Verified in person, ${when}`, needsRefresh: false };
  }
  if (days <= STALE_AFTER_DAYS) {
    return { days, tier: "aging", label: `Checked ${when}`, longLabel: `Last checked in person, ${when}`, needsRefresh: false };
  }
  return {
    days,
    tier: "stale",
    label: `Last checked ${when}`,
    longLabel: `Last checked ${when} — prices may have moved since`,
    needsRefresh: true,
  };
}

/**
 * Walk times are derived from coordinates rounded to 3–4 decimals, so a precise
 * minute figure would be false precision. Buckets say only what the data supports.
 */
export function walkBucket(minutes: number): string {
  if (minutes <= 3) return "3 min walk";
  if (minutes <= 5) return "5 min walk";
  if (minutes <= 8) return "8 min walk";
  if (minutes <= 12) return "12 min walk";
  if (minutes <= 15) return "15 min walk";
  return "short ride";
}

/** Prefix used wherever a derived (not measured) number is shown. */
export const APPROX = "≈";

/**
 * Byline dating for guides. Shows the revision date when a piece has been
 * revised, because on a site about visa rules and prices "when was this last
 * checked" matters more than "when was it first written". Falls back to the
 * publication date when they are the same, rather than implying an edit.
 */
export function articleDate(
  published: string,
  updated: string | undefined,
  style: "long" | "short" = "long"
): { label: string; revised: boolean } {
  const opts: Intl.DateTimeFormatOptions =
    style === "long"
      ? { month: "long", day: "numeric", year: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" };

  const wasRevised = Boolean(updated) && updated !== published;
  const shown = wasRevised ? updated! : published;
  const formatted = new Date(shown).toLocaleDateString("en-US", opts);

  return { label: wasRevised ? `Updated ${formatted}` : formatted, revised: wasRevised };
}
