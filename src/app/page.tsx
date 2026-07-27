import Link from "next/link";
import Image from "next/image";
import {
  getAllBuildings,
  getAllGuides,
  getAllArticles,
  getAllContributors,
  getAllAreaMetadata,
} from "@/lib/content";
import { websiteJsonLd } from "@/lib/seo";
import { freshnessOf } from "@/lib/freshness";
import {
  areaStats,
  costBands,
  entryPrice,
  estimatedMonthly,
  sortBuildings,
  sqmRange,
  valueVsArea,
} from "@/lib/metrics";
import BuildingCard from "@/components/BuildingCard";
import CostSection from "@/components/CostSection";

/**
 * Three questions everyone arrives with. Giving them their own row replaces the
 * old vague two-button hero and gets people to the answer in one click.
 */
const ENTRY_PATHS = [
  {
    href: "/start",
    kicker: "Just arriving?",
    body: "The one-page arrival brief — costs, areas, rates and red flags. Free PDF.",
  },
  {
    href: "/cribs",
    kicker: "Where should I live?",
    body: "Every building we would live in, ranked, with ฿/sqm and all-in costs.",
  },
  {
    href: "/playbook",
    kicker: "How do I actually rent?",
    body: "Deposits, contracts, negotiation and the red flags that cost people money.",
  },
];

export default function Home() {
  const buildings = getAllBuildings();
  const guides = getAllGuides();
  const articles = getAllArticles();
  const contributors = getAllContributors();
  const allAreas = getAllAreaMetadata();

  const ranked = sortBuildings(buildings, "recommended", buildings);
  const [lead, ...rest] = ranked.slice(0, 7);
  const bands = costBands(buildings);
  const cheapest = Math.min(...buildings.map(entryPrice));

  const newestSweep = buildings.map((b) => b.last_verified).sort().at(-1)!;
  const sweep = freshnessOf(newestSweep);

  const leadValue = valueVsArea(lead, buildings.filter((b) => b.area === lead.area));
  const leadSizes = sqmRange(lead);
  const leadArea = allAreas.find((a) => a.slug === lead.area);

  // Use a whole contributor note rather than slicing it at the second full stop —
  // the old version produced fragments that ended mid-thought.
  const quoted = ranked.find(
    (b) => b.contributor_note && b.contributor_note.length > 90 && b.contributor_note.length < 260
  );
  const quoteAuthor = quoted
    ? contributors.find((c) => c.slug === quoted.contributed_by)
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="-mx-4 md:-mx-8 -mt-16 relative overflow-hidden rounded-b-[2rem] md:rounded-b-[2.5rem]">
        <Image
          src="/hero.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/88 via-espresso/65 to-espresso/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-espresso/25" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-32 md:pt-40 pb-14 md:pb-20">
          <div className="max-w-2xl">
            <p className="text-cream/60 text-[11px] font-bold uppercase tracking-[0.18em]">
              Chiang Mai · long stay
            </p>
            <h1 className="font-display font-black text-[44px] md:text-[64px] text-cream tracking-tight leading-[1.02] mt-3">
              Your honest friend
              <br />
              in Chiang Mai.
            </h1>
            <p className="text-cream/80 text-[16px] md:text-[18px] leading-relaxed mt-5 max-w-xl">
              {buildings.length} buildings walked in person. Real rents, the bills nobody quotes you,
              and the gotchas a landlord will not mention.
            </p>

            <div className="flex gap-3 mt-8 flex-wrap">
              <Link
                href="/cribs"
                className="bg-terracotta text-cream px-7 py-3.5 rounded-xl text-[15px] font-bold hover:bg-terracotta/90 transition-colors shadow-lg"
              >
                Browse every building →
              </Link>
              <Link
                href="/playbook"
                className="bg-cream/10 text-cream border border-cream/25 px-7 py-3.5 rounded-xl text-[15px] font-semibold hover:bg-cream/20 transition-colors backdrop-blur-sm"
              >
                New here? Read the playbook
              </Link>
            </div>
          </div>
        </div>

        {/* Honest trust bar — states the real sweep date instead of "updated weekly". */}
        <div className="relative z-10 border-t border-cream/15 bg-cream/10 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-3.5 flex justify-center md:justify-start gap-5 md:gap-10 flex-wrap text-[12px] md:text-[13px] text-cream/75">
            <span>
              <strong className="text-cream font-bold tnum">{buildings.length}</strong> buildings
            </span>
            <span>
              <strong className="text-cream font-bold tnum">
                ฿{(cheapest / 1000).toFixed(1)}k
              </strong>{" "}
              cheapest rent
            </span>
            <span>
              <strong className="text-cream font-bold tnum">{allAreas.length}</strong> neighbourhoods
            </span>
            <span>
              Last sweep <strong className="text-cream font-bold">{sweep.label.replace(/^\S+ /, "")}</strong>
            </span>
            <span className="hidden sm:inline">No agent fees, ever</span>
          </div>
        </div>
      </section>

      {/* ── Three entry paths ────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-sand rounded-2xl overflow-hidden border border-sand mt-12 mb-16">
        {ENTRY_PATHS.map((p, i) => (
          <Link key={p.href} href={p.href} className="group bg-cream hover:bg-milk transition-colors p-6 md:p-7">
            <span className="tnum text-[11px] font-bold text-terracotta">0{i + 1}</span>
            <h2 className="font-display font-bold text-[20px] text-espresso mt-2 group-hover:text-terracotta transition-colors">
              {p.kicker}
            </h2>
            <p className="text-[13px] text-latte leading-relaxed mt-1.5">{p.body}</p>
          </Link>
        ))}
      </section>

      {/* ── The picks: one lead + a ranked list ──────────── */}
      <section className="mb-20">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-display font-bold text-[28px] md:text-[32px] text-espresso tracking-tight rule-tick">
              Where we would live
            </h2>
            <p className="text-[14px] text-latte mt-3.5 max-w-md leading-relaxed">
              Ranked by value against the neighbourhood, not by who is paying.
            </p>
          </div>
          <Link href="/cribs" className="text-[13px] font-bold text-terracotta hover:underline hidden md:block shrink-0">
            All {buildings.length} buildings →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 items-stretch">
          {/* Lead pick — given real weight rather than being one of six equal cards. */}
          <Link
            href={`/cribs/${lead.area}/${lead.slug}`}
            className="group flex flex-col bg-milk rounded-2xl border border-sand overflow-hidden hover:shadow-[var(--shadow-lift)] transition-all duration-200"
          >
            <div className="relative flex-1 min-h-[300px] md:min-h-[360px] bg-sand">
              <Image
                src={`/buildings/${lead.slug}/${lead.photos[0] || "hero.jpg"}`}
                alt={lead.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/25 to-espresso/10" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-terracotta text-cream text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                  Our top pick
                </span>
                {leadValue?.tier === "great" && (
                  <span className="bg-verified text-cream text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                    Good value
                  </span>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <p className="text-cream/70 text-[11px] font-bold uppercase tracking-[0.14em]">
                  {leadArea?.name ?? lead.area}
                </p>
                <h3 className="font-display font-bold text-[30px] md:text-[36px] text-cream leading-[1.05] mt-1.5">
                  {lead.name}
                </h3>

                {/* Metrics get their own rule and even spacing rather than being
                    crammed onto the headline's baseline. */}
                <div className="flex items-center gap-3 md:gap-4 mt-4 pt-4 border-t border-cream/20">
                  <span className="font-display font-bold text-[24px] text-cream tnum leading-none">
                    ฿{(entryPrice(lead) / 1000).toFixed(0)}k
                    <span className="text-[12px] font-sans font-medium text-cream/65 ml-0.5">
                      /mo
                    </span>
                  </span>
                  {leadSizes && (
                    <>
                      <span className="w-px h-4 bg-cream/25" aria-hidden />
                      <span className="tnum text-cream/85 text-[13px]">
                        {leadSizes[0]}–{leadSizes[1]}
                        <span className="font-sans text-cream/55 text-[11px] ml-1">sqm</span>
                      </span>
                    </>
                  )}
                  {leadValue && (
                    <>
                      <span className="w-px h-4 bg-cream/25" aria-hidden />
                      <span className="tnum text-cream/85 text-[13px]">
                        ฿{leadValue.ppsm}
                        <span className="font-sans text-cream/55 text-[11px] ml-1">/sqm</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Padding lives on the wrapper: line-clamp on a padded element
                measures the padding box and leaks a clipped extra line. */}
            {lead.contributor_note && (
              <div className="p-5 md:p-6 border-t border-sand">
                <p className="text-[14px] text-dark-roast leading-relaxed line-clamp-3">
                  {lead.contributor_note}
                </p>
                <span className="inline-block mt-2.5 text-[12px] font-bold text-terracotta">
                  Read the full take →
                </span>
              </div>
            )}
          </Link>

          {/* Runners-up as a compact ranked list, not more big cards. */}
          <ol className="bg-milk rounded-2xl border border-sand overflow-hidden divide-y divide-sand">
            {rest.map((b, i) => {
              const v = valueVsArea(b, buildings.filter((p) => p.area === b.area));
              const s = sqmRange(b);
              return (
                <li key={b.slug}>
                  <Link
                    href={`/cribs/${b.area}/${b.slug}`}
                    className="group flex items-center gap-4 px-4 py-3.5 hover:bg-parchment/70 transition-colors"
                  >
                    <span className="tnum text-[13px] font-bold text-mist w-5 shrink-0">
                      {i + 2}
                    </span>
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-sand shrink-0">
                      <Image
                        src={`/buildings/${b.slug}/${b.photos[0] || "hero.jpg"}`}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-bold text-[15px] text-espresso truncate group-hover:text-terracotta transition-colors">
                        {b.name}
                      </h3>
                      <p className="text-[11px] text-latte truncate mt-0.5">
                        {allAreas.find((a) => a.slug === b.area)?.name}
                        {s ? ` · ${s[0]}–${s[1]} sqm` : ""}
                        {v ? ` · ฿${v.ppsm}/sqm` : ""}
                      </p>
                    </div>
                    <span className="font-display font-bold text-[16px] text-espresso tnum shrink-0">
                      ฿{(entryPrice(b) / 1000).toFixed(0)}k
                    </span>
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/cribs"
                className="block px-4 py-3.5 text-[13px] font-bold text-terracotta hover:bg-parchment/70 transition-colors"
              >
                See all {buildings.length} buildings →
              </Link>
            </li>
          </ol>
        </div>
      </section>

      {/* ── What it actually costs — composition, not totals ──
          Three totals in three boxes hid the actual finding. Splitting each bar
          into rent and bills on one shared scale shows it: the bills are close
          to flat, so they take a far bigger bite out of a studio than a two-bed. */}
      {bands.length > 0 && <CostSection bands={bands} buildingCount={buildings.length} />}

      {/* ── Neighbourhood comparison ─────────────────────── */}
      <section className="mb-20">
        <h2 className="font-display font-bold text-[28px] md:text-[32px] text-espresso tracking-tight rule-tick">
          Pick a neighbourhood
        </h2>
        <p className="text-[14px] text-latte mt-3.5 mb-7 max-w-lg leading-relaxed">
          The two areas we know well enough to have opinions about.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {allAreas.map((area) => {
            const inArea = buildings.filter((b) => b.area === area.slug);
            const s = areaStats(inArea);
            return (
              <Link
                key={area.slug}
                href={`/cribs/${area.slug}`}
                className="group block bg-milk rounded-2xl border border-sand p-6 md:p-7 hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display font-bold text-[24px] text-espresso group-hover:text-terracotta transition-colors">
                    {area.name}
                  </h3>
                  <span className="tnum text-[13px] text-latte shrink-0">
                    {s.count} buildings
                  </span>
                </div>
                <p className="text-[14px] text-dark-roast mt-2 leading-relaxed">{area.description}</p>

                <dl className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-sand">
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.1em] text-latte font-bold">
                      Rent from
                    </dt>
                    <dd className="tnum text-[16px] text-espresso font-semibold mt-1">
                      ฿{(s.minPrice / 1000).toFixed(1)}k
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.1em] text-latte font-bold">
                      Median ฿/sqm
                    </dt>
                    <dd className="tnum text-[16px] text-espresso font-semibold mt-1">
                      {s.medianPpsm ? `฿${s.medianPpsm}` : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.1em] text-latte font-bold">
                      With a pool
                    </dt>
                    <dd className="tnum text-[16px] text-espresso font-semibold mt-1">
                      {s.withPool}/{s.count}
                    </dd>
                  </div>
                </dl>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Voice moment ─────────────────────────────────── */}
      {quoted?.contributor_note && (
        <section className="mb-20 max-w-3xl mx-auto text-center">
          <blockquote className="font-display text-[21px] md:text-[26px] text-espresso leading-[1.45] tracking-tight">
            &ldquo;{quoted.contributor_note}&rdquo;
          </blockquote>
          <p className="text-[12px] text-latte mt-5">
            {quoteAuthor?.name ?? "CNX Cribs"} on{" "}
            <Link
              href={`/cribs/${quoted.area}/${quoted.slug}`}
              className="text-terracotta font-semibold hover:underline"
            >
              {quoted.name}
            </Link>
          </p>
        </section>
      )}

      {/* ── The rest of the field guide ──────────────────── */}
      <section className="mb-16">
        <h2 className="font-display font-bold text-[28px] md:text-[32px] text-espresso tracking-tight rule-tick">
          The rest of the field guide
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 mt-8 items-start">
          {/* Guides — the long reads */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-latte mb-4">
              In-depth guides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {articles.slice(0, 4).map((article) => {
                const author = contributors.find((c) => c.slug === article.author);
                return (
                  <Link
                    key={article.slug}
                    href={`/guides/${article.slug}`}
                    className="group block bg-milk rounded-xl border border-sand p-5 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <h4 className="font-display font-bold text-[17px] text-espresso leading-snug group-hover:text-terracotta transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-[13px] text-latte mt-1.5 leading-relaxed line-clamp-2">
                      {article.description}
                    </p>
                    <p className="text-[11px] text-mist mt-3 tnum">
                      {author?.name} · {article.reading_time} min
                    </p>
                  </Link>
                );
              })}
            </div>
            <Link
              href="/guides"
              className="inline-block mt-5 text-[13px] font-bold text-terracotta hover:underline"
            >
              All {articles.length} guides →
            </Link>
          </div>

          {/* Directory — a compact index, visually distinct from the cards */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-latte mb-4">
              The directory
            </h3>
            <ul className="bg-milk rounded-xl border border-sand divide-y divide-sand overflow-hidden">
              {guides.slice(0, 8).map((g) => (
                <li key={g.category}>
                  <Link
                    href={`/directory/${g.category}`}
                    className="group flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-parchment/70 transition-colors"
                  >
                    <span className="text-[13px] font-semibold text-dark-roast group-hover:text-terracotta transition-colors">
                      {g.name}
                    </span>
                    <span className="tnum text-[11px] text-mist shrink-0">{g.spots.length}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/directory"
              className="inline-block mt-4 text-[13px] font-bold text-terracotta hover:underline"
            >
              Full directory →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
