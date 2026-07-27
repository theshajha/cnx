import { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { getAllBuildings, getAllAreaMetadata } from "@/lib/content";
import BriefSignup from "@/components/BriefSignup";
import DownloadButton from "@/components/DownloadButton";
import { areaStats, costBands, entryPrice, ASSUMED_KWH_PER_MONTH } from "@/lib/metrics";

export const metadata: Metadata = {
  title: "Your First Two Weeks in Chiang Mai — CNX Cribs",
  description:
    "The one-page arrival brief: what renting actually costs all-in, which neighbourhood to pick, what utility rates are fair, and the red flags to check before you sign.",
};

/**
 * The arrival brief — a live page that is also the print master for
 * public/cnx-first-two-weeks.pdf (see scripts/generate-onepager.mjs).
 *
 * One source, two outputs. A hand-made PDF would drift from the listings within
 * a month; this one is regenerated from the same functions that render /cribs,
 * so a price change flows into the printed sheet on the next build.
 *
 * Everything here is drawn from data we have checked. Nothing is included that
 * we would have to invent — which is why there are no temple recommendations
 * on it and why the short-stay section names no hostels yet.
 */

const RED_FLAGS = [
  "Electric above 8 ฿/unit",
  "No written contract",
  "No deposit receipt",
  "Musty smell or ceiling stains",
  "No management office",
  "Very old water heater",
];

const NEGOTIATION = [
  ["April", "Low season — supply is high and landlords flex"],
  ["6 months", "Gets you 10–20% off versus monthly"],
  ["Vacant units", "Ask which have sat empty; those owners deal"],
  ["Go direct", "No agent means no one-month commission"],
];

const THAI = [
  ["ลดได้ไหม?", "lot dai mai?", "Can you give a discount?"],
  // Kept short deliberately — a longer gloss wraps and orphans a word in the
  // narrow footer column of the printed sheet.
  ["ค่าไฟหน่วยละเท่าไหร่?", "kaa fai nuay la tao rai?", "What's the electric rate?"],
];

/** All figures lifted from guides we have already fact-checked. */
const FIRST_48 = [
  {
    k: "Get a SIM",
    v: "฿49–300",
    d: "AIS or True. Buy at an operator store, not a tourist-area 7-Eleven — they sometimes refuse local rates.",
  },
  {
    k: "Get cash",
    v: "฿220 fee",
    d: "Every foreign-card ATM withdrawal is charged this on top of your own bank's fee. Take out more, less often.",
  },
  {
    k: "Move around",
    v: "฿30 flat",
    d: "Red songthaews cross town for a fixed ฿30. Grab runs ฿80–120. A monthly scooter is ฿2,500–3,500.",
  },
  {
    k: "Skip the bank",
    v: "week 3+",
    d: "Opening an account is hard on a tourist entry and needs a lease. Do it once you have signed somewhere.",
  },
];

export default async function StartPage() {
  const buildings = getAllBuildings();
  const areas = getAllAreaMetadata();
  const bands = costBands(buildings);
  const cheapest = Math.min(...buildings.map(entryPrice));
  const utilities = bands[0]?.utilities ?? 0;

  // Baked in at build time, so the printed sheet works from paper.
  const qr = await QRCode.toString("https://www.cnxcribs.com/cribs", {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#33241a", light: "#0000" },
  });

  const stamped = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <>
      {/* Screen-only intro. The sheet itself is what prints. */}
      <div className="print:hidden pt-8 md:pt-12 max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta">
          Free · no email required
        </p>
        <h1 className="font-display font-bold text-[38px] md:text-[52px] text-espresso tracking-tight leading-[1.05] mt-3">
          Your first two weeks
        </h1>
        <p className="text-dark-roast text-[15px] md:text-[17px] leading-relaxed mt-4">
          Everything you need to not get stitched up in your first fortnight, on one page. Real
          numbers from {buildings.length} buildings we walked ourselves. Print it, screenshot it,
          send it to whoever is coming with you.
        </p>
        <div className="flex gap-3 mt-6 flex-wrap">
          <DownloadButton />
          <Link
            href="/cribs"
            className="bg-milk border border-sand text-dark-roast px-6 py-3 rounded-xl text-[14px] font-bold hover:border-latte transition-colors"
          >
            Browse every building
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-sand">
          <BriefSignup />
        </div>
      </div>

      {/* ── The sheet ───────────────────────────────────────────────
          Fixed A4 proportions so the screen preview and the PDF agree. */}
      <div className="print:hidden h-10" />
      <div
        id="sheet"
        className="bg-milk text-espresso mx-auto w-full max-w-[210mm] print:max-w-none print:w-full border border-sand print:border-0 rounded-2xl print:rounded-none overflow-hidden shadow-[var(--shadow-card)] print:shadow-none mb-16 print:mb-0"
      >
        <div className="p-[11mm]">
          {/* Masthead */}
          <header className="flex items-start justify-between gap-6 pb-3 border-b-2 border-espresso">
            <div>
              <p className="text-[7.5pt] font-bold uppercase tracking-[0.18em] text-terracotta">
                CNX Cribs · Field Sheet
              </p>
              <h2 className="font-display font-bold text-[25pt] leading-[1.02] tracking-tight mt-1">
                Your first two weeks
                <br />
                in Chiang Mai
              </h2>
            </div>
            <div className="text-right shrink-0">
              <div className="w-[21mm] h-[21mm] ml-auto [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qr }}
              />
              <p className="text-[6pt] text-latte mt-1 leading-tight">
                cnxcribs.com
                <br />
                {stamped}
              </p>
            </div>
          </header>

          <p className="text-[8pt] text-dark-roast leading-snug mt-2.5">
            Real numbers from {buildings.length} buildings we walked ourselves. No agent fees, no
            paid placement. <strong>Do not sign anything in your first week</strong> — walk the
            neighbourhoods first.
          </p>

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-x-[8mm] mt-4">
            {/* ── Left ── */}
            <div className="space-y-4">
              <section>
                <h3 className="text-[8pt] font-bold uppercase tracking-[0.12em] text-terracotta border-b border-sand pb-1 mb-2">
                  1 · What it costs, all in
                </h3>
                <table className="w-full text-[8pt]">
                  <thead>
                    <tr className="text-latte text-[6.5pt] uppercase tracking-wide">
                      <th className="text-left font-bold pb-1">Unit</th>
                      <th className="text-right font-bold pb-1">Rent</th>
                      <th className="text-right font-bold pb-1">+ Bills</th>
                      <th className="text-right font-bold pb-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bands.map((b) => (
                      <tr key={b.layout} className="border-t border-sand">
                        <td className="py-[3px] font-semibold">
                          {b.label}
                          <span className="text-latte font-normal text-[6.5pt] ml-1">
                            ~{b.sqm}m²
                          </span>
                        </td>
                        <td className="text-right tnum py-[3px]">
                          ฿{(b.rent / 1000).toFixed(1)}k
                        </td>
                        <td className="text-right tnum py-[3px] text-latte">
                          ฿{(b.utilities / 1000).toFixed(1)}k
                        </td>
                        <td className="text-right tnum py-[3px] font-bold">
                          ฿{(b.typical / 1000).toFixed(1)}k
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[6.5pt] text-latte leading-snug mt-1.5">
                  Median asking rent plus ~฿{utilities.toLocaleString()} of bills (electric at{" "}
                  {ASSUMED_KWH_PER_MONTH} kWh, water, internet). Bills are near-flat whatever the
                  size, so they hurt a cheap unit most. Cheapest we list: ฿
                  {cheapest.toLocaleString()}.
                </p>
              </section>

              <section>
                <h3 className="text-[8pt] font-bold uppercase tracking-[0.12em] text-terracotta border-b border-sand pb-1 mb-2">
                  2 · Pick your area
                </h3>
                {areas.map((a) => {
                  const s = areaStats(buildings.filter((b) => b.area === a.slug));
                  return (
                    <div key={a.slug} className="mb-2 last:mb-0">
                      <div className="flex items-baseline justify-between">
                        <span className="font-display font-bold text-[10pt]">{a.name}</span>
                        <span className="tnum text-[7.5pt] text-latte">
                          {s.count} bldgs · from ฿{(s.minPrice / 1000).toFixed(1)}k
                          {s.medianPpsm ? ` · ฿${s.medianPpsm}/m²` : ""}
                        </span>
                      </div>
                      <p className="text-[7pt] text-dark-roast leading-snug">{a.description}</p>
                    </div>
                  );
                })}
              </section>

              <section>
                <h3 className="text-[8pt] font-bold uppercase tracking-[0.12em] text-terracotta border-b border-sand pb-1 mb-2">
                  3 · Where to stay while you look
                </h3>
                <p className="text-[7.5pt] text-dark-roast leading-snug">
                  Book <strong>two weeks</strong> of short-stay before you commit to anything
                  longer. Nobody can judge a building from photos — you need to hear the traffic at
                  10pm, feel the afternoon sun on a west-facing wall, and walk to the 7-Eleven.
                  Base yourself in the area you think you want, then confirm or change your mind.
                </p>
                <p className="text-[7pt] text-latte leading-snug mt-1.5">
                  A month-long lease signed from abroad is the single most expensive mistake people
                  make here.
                </p>
              </section>
            </div>

            {/* ── Right ── */}
            <div className="space-y-4">
              <section>
                <h3 className="text-[8pt] font-bold uppercase tracking-[0.12em] text-terracotta border-b border-sand pb-1 mb-2">
                  4 · The rate card
                </h3>
                <table className="w-full text-[7.5pt]">
                  <tbody>
                    {[
                      ["Electric", "5–8 ฿/unit", "above 8 ฿", true],
                      ["Water", "25 ฿/unit", "above 35 ฿", true],
                      ["Deposit", "1–2 months", "3+ months", true],
                      ["WiFi", "Included", "check it exists", false],
                    ].map(([k, ok, bad]) => (
                      <tr key={String(k)} className="border-t border-sand">
                        <td className="py-[3px] font-semibold w-[24%]">{k}</td>
                        <td className="py-[3px] text-verified font-semibold tnum">✓ {ok}</td>
                        <td className="py-[3px] text-flag tnum text-right">✗ {bad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[6.5pt] text-latte leading-snug mt-1.5">
                  Government electric is ~4–5 ฿; every building marks it up. The rate is fixed by
                  the building and follows you every month — check it before the rent.
                </p>
              </section>

              <section>
                <h3 className="text-[8pt] font-bold uppercase tracking-[0.12em] text-terracotta border-b border-sand pb-1 mb-2">
                  5 · How to pay less
                </h3>
                <dl className="text-[7.5pt] space-y-[3px]">
                  {NEGOTIATION.map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="font-bold w-[19mm] shrink-0">{k}</dt>
                      <dd className="text-dark-roast leading-snug">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section>
                <h3 className="text-[8pt] font-bold uppercase tracking-[0.12em] text-flag border-b border-sand pb-1 mb-2">
                  6 · Walk away if
                </h3>
                <ul className="text-[7.5pt] grid grid-cols-1 gap-y-[2px]">
                  {RED_FLAGS.map((f) => (
                    <li key={f} className="flex gap-1.5 leading-snug">
                      <span className="text-flag font-bold shrink-0">✗</span>
                      <span className="text-dark-roast">{f}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-caution/10 border border-caution/30 rounded-md px-2.5 py-2">
                <h3 className="text-[7.5pt] font-bold uppercase tracking-[0.1em] text-caution">
                  ⚠ Visa — check before you fly
                </h3>
                <p className="text-[7pt] text-dark-roast leading-snug mt-1">
                  Thailand&rsquo;s Cabinet approved cutting the 60-day visa exemption to 30 days on
                  19 May 2026. It takes effect 15 days after Royal Gazette publication.{" "}
                  <strong>Verify the current rule before booking</strong> — do not plan a long stay
                  around visa-free entry.
                </p>
              </section>
            </div>
          </div>

          {/* Full-width: the practical first-48-hours strip */}
          <section className="mt-4">
            <h3 className="text-[8pt] font-bold uppercase tracking-[0.12em] text-terracotta border-b border-sand pb-1 mb-2">
              7 · Your first 48 hours
            </h3>
            <div className="grid grid-cols-4 gap-x-[5mm]">
              {FIRST_48.map((s) => (
                <div key={s.k}>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-[8pt] font-bold">{s.k}</span>
                    <span className="text-[7.5pt] tnum text-terracotta font-semibold">{s.v}</span>
                  </div>
                  <p className="text-[6.8pt] text-dark-roast leading-snug mt-0.5">{s.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Thai + footer */}
          <div className="grid grid-cols-2 gap-x-[8mm] mt-4 pt-3 border-t-2 border-espresso items-end">
            <div>
              <h3 className="text-[7.5pt] font-bold uppercase tracking-[0.12em] text-terracotta mb-1.5">
                Two phrases worth having
              </h3>
              {THAI.map(([th, rom, en]) => (
                <div key={rom} className="mb-1 last:mb-0">
                  <span className="text-[9pt]" lang="th">
                    {th}
                  </span>
                  <span className="text-[6.5pt] text-latte italic ml-1.5">{rom}</span>
                  <span className="text-[6.5pt] text-dark-roast ml-1.5">— &ldquo;{en}&rdquo;</span>
                </div>
              ))}
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-[12pt] leading-none">CNX Cribs</p>
              <p className="text-[7pt] text-dark-roast mt-1 leading-snug">
                {buildings.length} long-stay buildings, checked in person.
                <br />
                Real prices, real gotchas, no agent fees.
              </p>
              <p className="text-[8pt] font-bold text-terracotta mt-1">cnxcribs.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="print:hidden max-w-2xl mb-16">
        <p className="text-[13px] text-latte leading-relaxed">
          Everything on this sheet comes from data we have checked ourselves — that is why there are
          no temple recommendations on it. Prices update whenever the listings do, so re-download
          before you travel.
        </p>
      </div>
    </>
  );
}
