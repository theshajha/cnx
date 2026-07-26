import { Metadata } from "next";
import Link from "next/link";
import { getAllBuildings } from "@/lib/content";
import { entryPrice } from "@/lib/metrics";

export const metadata: Metadata = {
  title: "The Rental Playbook — CNX Cribs",
  description:
    "How renting long-term in Chiang Mai actually works: which unit to pick, what rates are fair, what to negotiate, and the red flags that cost people money.",
};

/**
 * One page on purpose. At ~500 words across seven sections, splitting the
 * playbook into subpages would produce seven thin pages and bury the thing
 * people came for. What it needed was structure, not division: the sections are
 * the rental journey in order, and three of them are tables that were being
 * rendered as bullet lists.
 *
 * The content is held here rather than parsed out of content/playbook.md because
 * the shape is the point — a fair-vs-walk-away band and a term/discount ladder
 * are data, and flattening them back into markdown bullets is what made the old
 * page read as rudimentary. If a section grows past ~800 words it has earned its
 * own route; nothing here is close yet.
 */

interface Step {
  n: string;
  id: string;
  title: string;
  when: string;
  blurb: string;
}

const STEPS: Step[] = [
  { n: "01", id: "unit", title: "Pick the right unit", when: "Before you view", blurb: "Which floor, which way it faces — where most of the money is won or lost." },
  { n: "02", id: "rates", title: "Know what's fair", when: "While comparing", blurb: "Utility rates vary more than rent does, and a bad one follows you every month." },
  { n: "03", id: "terms", title: "Choose a term", when: "Deciding", blurb: "How long you commit is the biggest lever you have on price." },
  { n: "04", id: "negotiate", title: "Negotiate", when: "Making an offer", blurb: "What actually moves a landlord here, and when." },
  { n: "05", id: "flags", title: "Spot the red flags", when: "Before signing", blurb: "Six things that mean walk away, or at least push back hard." },
  { n: "06", id: "movein", title: "Move in clean", when: "Day one", blurb: "Twenty minutes of work that protects your deposit." },
];

const UNIT_RULES = [
  { k: "Facing", v: "North or east", good: true, why: "West-facing takes brutal afternoon sun and drives up AC bills. The single most common insider tip." },
  { k: "Floor", v: "4–8", good: true, why: "Low floors get street noise and mosquitoes. Top floors trap heat — critical in hot season, March–May." },
  { k: "Ground floor", v: "Avoid", good: false, why: "Flood risk in monsoon season, June–October, plus security and mosquitoes." },
  { k: "Corner units", v: "Worth a premium", good: true, why: "Cross-ventilation if you open windows in the cooler months, November–February." },
  { k: "Pool view", v: "Think twice", good: false, why: "Commands a 1,000–3,000 ฿ premium and is louder — pool parties, kids." },
];

const RATES = [
  { item: "Electricity", fair: "6–8 ฿/unit", flag: "Above 8 ฿", context: "Government rate is ~4–5 ฿. Buildings mark it up." },
  { item: "Water", fair: "18–25 ฿/unit", flag: null, context: "Or a flat 200–400 ฿/month." },
  { item: "WiFi", fair: "Included", flag: null, context: "If separate, expect 300–600 ฿/month." },
  { item: "Deposit", fair: "2 months", flag: "Above 2 months", context: "Negotiable to 1 month on 6+ month contracts." },
];

const TERMS = [
  { term: "1 month", discount: "Full price", note: "Usually 2-month deposit plus a month in advance.", best: false },
  { term: "3 months", discount: "5–10% off", note: "The most common commitment for nomads.", best: false },
  { term: "6 months", discount: "10–20% off", note: "Best value-to-flexibility ratio.", best: true },
  { term: "12 months", discount: "15–25% off", note: "Only worth it if you're certain you'll stay.", best: false },
];

const NEGOTIATION = [
  { t: "April is your friend", d: "Low season. Winter nomads left in March, supply is high, landlords are flexible." },
  { t: "Lead with commitment", d: "“I'll sign 3 months right now if you can do X price” works." },
  { t: "Ask for vacant units", d: "“Do you have any units that have been vacant for a while?” Those owners negotiate hardest." },
  { t: "Skip the agent", d: "At condo buildings where individual owners rent out units, going direct saves both sides the one-month commission." },
  { t: "Offer upfront payment", d: "Paying several months in advance gets a better rate from individual owners." },
];

const RED_FLAGS = [
  { t: "Electric above 8 ฿/unit", d: "Stealth markup that adds up fast once the AC is running." },
  { t: "No written contract", d: "Even month-to-month should have a written agreement. Walk away." },
  { t: "No deposit receipt", d: "Insist on one. No receipt means a high risk of losing your deposit." },
  { t: "Musty smell or ceiling stains", d: "Mould from monsoon rain. Check bathroom ceilings and around AC drip areas." },
  { t: "No management office", d: "Disputes get much harder to resolve." },
  { t: "Very old water heater", d: "Replacement cost may land on you." },
];

const MOVE_IN = [
  "Photo and video everything — walls, floors, AC units, furniture, bathroom. Timestamp it.",
  "Get a deposit receipt in writing.",
  "Confirm utility rates in the contract: electric ฿/unit, water ฿/unit, WiFi included or not.",
  "Test the AC, hot water, and WiFi speed.",
  "Check every lock — room door, balcony, windows.",
  "Send photos of any existing damage to the landlord or management immediately.",
];

const THAI = [
  { th: "มีห้องให้เช่ารายเดือนไหม?", rom: "mee hong hai chao rai duean mai?", en: "Do you have rooms for monthly rent?" },
  { th: "ค่าไฟหน่วยละเท่าไหร่?", rom: "kaa fai nuay la tao rai?", en: "How much per unit of electricity?" },
  { th: "ลดได้ไหม?", rom: "lot dai mai?", en: "Can you give a discount?" },
];

function SectionHead({ step }: { step: Step }) {
  return (
    <div className="flex items-baseline gap-4 mb-5">
      <span className="tnum text-[13px] font-bold text-terracotta shrink-0">{step.n}</span>
      <div>
        <h2 className="font-display font-bold text-[24px] md:text-[28px] text-espresso tracking-tight leading-tight">
          {step.title}
        </h2>
        <p className="text-[12px] text-latte mt-1.5">
          <span className="uppercase tracking-[0.1em] font-bold text-mist">{step.when}</span>
          <span className="mx-2 text-sand">·</span>
          {step.blurb}
        </p>
      </div>
    </div>
  );
}

export default function PlaybookPage() {
  const buildings = getAllBuildings();
  const cheapest = Math.min(...buildings.map(entryPrice));

  return (
    <div className="pb-8">
      <header className="pt-8 md:pt-12 max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta">
          Field manual
        </p>
        <h1 className="font-display font-bold text-[38px] md:text-[52px] text-espresso tracking-tight leading-[1.05] mt-3">
          How renting here
          <br />
          actually works
        </h1>
        <p className="text-dark-roast text-[15px] md:text-[17px] leading-relaxed mt-4">
          Six steps, in the order you&rsquo;ll hit them &mdash; from picking a unit to protecting
          your deposit. All of it from renting here, not from a listing site.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)] gap-8 lg:gap-12 mt-10 items-start">
        {/* Sticky nav — this is a reference you come back to mid-viewing. */}
        <nav className="hidden lg:block lg:sticky lg:top-24" aria-label="Playbook steps">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-latte mb-3">
            The six steps
          </p>
          <ol className="border-l border-sand">
            {STEPS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="group flex gap-2.5 py-1.5 pl-3 -ml-px border-l-2 border-transparent hover:border-terracotta transition-colors"
                >
                  <span className="tnum text-[11px] font-bold text-mist group-hover:text-terracotta transition-colors">
                    {s.n}
                  </span>
                  <span className="text-[13px] font-medium text-dark-roast group-hover:text-terracotta transition-colors leading-snug">
                    {s.title}
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <a
            href="#thai"
            className="block mt-4 pt-4 border-t border-sand text-[13px] font-bold text-terracotta hover:underline"
          >
            Thai phrases →
          </a>
        </nav>

        <div className="min-w-0 space-y-14 md:space-y-16">
          {/* 01 */}
          <section id="unit" className="scroll-mt-24">
            <SectionHead step={STEPS[0]} />
            <dl className="bg-milk rounded-2xl border border-sand divide-y divide-sand overflow-hidden">
              {UNIT_RULES.map((r) => (
                <div
                  key={r.k}
                  className="grid grid-cols-1 sm:grid-cols-[136px_minmax(0,1fr)] gap-1 sm:gap-5 px-5 py-4"
                >
                  <dt className="text-[11px] font-bold uppercase tracking-[0.09em] text-latte pt-1">
                    {r.k}
                  </dt>
                  <dd>
                    <span
                      className={`text-[15px] font-semibold ${r.good ? "text-verified" : "text-caution"}`}
                    >
                      {r.v}
                    </span>
                    <p className="text-[13px] text-dark-roast leading-relaxed mt-1">{r.why}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* 02 — a fair-band table, not a bullet list */}
          <section id="rates" className="scroll-mt-24">
            <SectionHead step={STEPS[1]} />
            <div className="bg-milk rounded-2xl border border-sand overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-parchment border-b border-sand">
                      <th className="text-[10px] font-bold uppercase tracking-[0.09em] text-latte px-5 py-2.5">
                        Item
                      </th>
                      <th className="text-[10px] font-bold uppercase tracking-[0.09em] text-latte px-3 py-2.5 whitespace-nowrap">
                        Fair
                      </th>
                      <th className="text-[10px] font-bold uppercase tracking-[0.09em] text-latte px-3 py-2.5 whitespace-nowrap">
                        Push back
                      </th>
                      <th className="text-[10px] font-bold uppercase tracking-[0.09em] text-latte px-5 py-2.5 hidden md:table-cell">
                        Context
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    {RATES.map((r) => (
                      <tr key={r.item}>
                        <td className="px-5 py-3.5 text-[14px] font-semibold text-espresso whitespace-nowrap">
                          {r.item}
                        </td>
                        <td className="px-3 py-3.5 text-[14px] text-verified font-semibold tnum whitespace-nowrap">
                          {r.fair}
                        </td>
                        <td className="px-3 py-3.5 text-[14px] tnum whitespace-nowrap">
                          {r.flag ? (
                            <span className="text-flag font-semibold">{r.flag}</span>
                          ) : (
                            <span className="text-mist">&mdash;</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-dark-roast hidden md:table-cell">
                          {r.context}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Context column folds below the table on small screens. */}
              <div className="md:hidden px-5 py-3.5 border-t border-sand space-y-1.5">
                {RATES.map((r) => (
                  <p key={r.item} className="text-[12px] text-latte leading-snug">
                    <span className="font-semibold text-dark-roast">{r.item}:</span> {r.context}
                  </p>
                ))}
              </div>
            </div>
          </section>

          {/* 03 — a term ladder with the recommendation marked */}
          <section id="terms" className="scroll-mt-24">
            <SectionHead step={STEPS[2]} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TERMS.map((t) => (
                <div
                  key={t.term}
                  className={`rounded-xl border p-5 ${
                    t.best ? "border-verified/40 bg-verified/[0.06]" : "border-sand bg-milk"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display font-bold text-[19px] text-espresso">
                      {t.term}
                    </span>
                    {t.best && (
                      <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-verified bg-verified/12 px-2 py-0.5 rounded">
                        Sweet spot
                      </span>
                    )}
                  </div>
                  <p
                    className={`tnum text-[15px] font-semibold mt-1.5 ${
                      t.best ? "text-verified" : "text-terracotta"
                    }`}
                  >
                    {t.discount}
                  </p>
                  <p className="text-[13px] text-latte leading-relaxed mt-1.5">{t.note}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 04 */}
          <section id="negotiate" className="scroll-mt-24">
            <SectionHead step={STEPS[3]} />
            <ol className="bg-milk rounded-2xl border border-sand divide-y divide-sand overflow-hidden">
              {NEGOTIATION.map((n, i) => (
                <li key={n.t} className="flex gap-4 px-5 py-4">
                  <span className="tnum text-[12px] font-bold text-mist shrink-0 pt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-espresso">{n.t}</p>
                    <p className="text-[13px] text-dark-roast leading-relaxed mt-0.5">{n.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* 05 — loud on purpose; this is the walk-away list */}
          <section id="flags" className="scroll-mt-24">
            <SectionHead step={STEPS[4]} />
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RED_FLAGS.map((f) => (
                <li key={f.t} className="bg-flag/[0.05] border border-flag/25 rounded-xl px-5 py-4">
                  <p className="text-[14px] font-bold text-flag leading-snug">{f.t}</p>
                  <p className="text-[13px] text-dark-roast leading-relaxed mt-1">{f.d}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* 06 — something you can actually work down */}
          <section id="movein" className="scroll-mt-24">
            <SectionHead step={STEPS[5]} />
            <ul className="bg-milk rounded-2xl border border-sand divide-y divide-sand overflow-hidden">
              {MOVE_IN.map((item) => (
                <li key={item} className="flex gap-3.5 px-5 py-3.5 items-start">
                  <span
                    className="w-[18px] h-[18px] rounded-[5px] border-2 border-sand shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <span className="text-[14px] text-dark-roast leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Worth screenshotting before you go out */}
          <section id="thai" className="scroll-mt-24">
            <div className="bg-espresso rounded-2xl p-6 md:p-8">
              <h2 className="font-display font-bold text-[22px] md:text-[26px] text-cream tracking-tight">
                Three phrases worth having
              </h2>
              <p className="text-cream/50 text-[13px] mt-1.5 mb-6">
                Screenshot this before you go looking.
              </p>
              <div className="space-y-4">
                {THAI.map((p) => (
                  <div
                    key={p.rom}
                    className="border-t border-cream/12 pt-4 first:border-0 first:pt-0"
                  >
                    <p className="text-cream text-[19px] md:text-[21px] leading-snug" lang="th">
                      {p.th}
                    </p>
                    <p className="text-cream/55 text-[13px] italic mt-1">{p.rom}</p>
                    <p className="text-cream/80 text-[13px] mt-1">&ldquo;{p.en}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-sand pt-8">
            <h2 className="font-display font-bold text-[20px] text-espresso">Now go looking</h2>
            <p className="text-[14px] text-dark-roast leading-relaxed mt-2 max-w-lg">
              {buildings.length} buildings, checked in person, from ฿{cheapest.toLocaleString()}
              /month &mdash; each with its own gotchas listed.
            </p>
            <div className="flex gap-3 mt-5 flex-wrap">
              <Link
                href="/cribs"
                className="bg-terracotta text-cream px-6 py-3 rounded-xl text-[14px] font-bold hover:bg-terracotta/90 transition-colors"
              >
                Browse every building →
              </Link>
              <Link
                href="/guides/cost-of-living-chiang-mai"
                className="bg-milk border border-sand text-dark-roast px-6 py-3 rounded-xl text-[14px] font-bold hover:border-latte transition-colors"
              >
                What it all costs
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
