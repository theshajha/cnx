import { getAllContributors } from "@/lib/content";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contributors — The People Behind CNX Cribs",
  description: "Meet the expats and nomads who verify listings, share tips, and keep CNX Cribs accurate. Want to join? Reach out.",
};

export default function ContributorsPage() {
  const contributors = getAllContributors();

  return (
    <>
      <section className="pt-8 pb-6">
        <h1 className="font-serif font-bold text-[40px] text-espresso tracking-[-1.5px]">
          Contributors
        </h1>
        <p className="text-[15px] text-latte mt-2 max-w-2xl leading-relaxed">
          CNX Cribs is built by people who actually live here. Every verified listing,
          every tip, every gotcha comes from someone who walked in and checked.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {contributors.map((c) => (
          <div
            key={c.slug}
            className="bg-milk rounded-[14px] border border-sand p-6 flex gap-5"
          >
            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-sand">
              {c.photo ? (
                <Image
                  src={`/contributors/${c.photo}`}
                  alt={c.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-latte text-xl font-serif font-bold">
                  {c.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-espresso">{c.name}</h2>
                <span className="bg-terracotta/10 text-terracotta px-2 py-0.5 rounded text-[10px] font-semibold">
                  {c.role}
                </span>
              </div>
              <p className="text-sm text-latte mt-1 leading-relaxed">{c.bio}</p>
              <div className="mt-3 flex items-center gap-4">
                {c.twitter && (
                  <a
                    href={`https://twitter.com/${c.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-dark-roast hover:text-terracotta transition-colors font-medium"
                  >
                    @{c.twitter}
                  </a>
                )}
                {c.link && !c.twitter && (
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-dark-roast hover:text-terracotta transition-colors font-medium"
                  >
                    Website ↗
                  </a>
                )}
                <span className="text-[11px] text-latte">
                  {c.contributions.length} contribution{c.contributions.length !== 1 ? "s" : ""}
                </span>
                <span className="text-[11px] text-latte">
                  Since {new Date(c.joined).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className="pb-16 text-center">
        <div className="bg-milk rounded-[14px] border border-sand p-10 max-w-xl mx-auto">
          <h2 className="font-serif font-bold text-[24px] text-espresso tracking-tight">
            Want to contribute?
          </h2>
          <p className="text-sm text-latte mt-3 leading-relaxed">
            If you visit Chiang Mai regularly and want to help keep this guide
            accurate, we&apos;d love to have you. Verify a listing, share a tip,
            or suggest a new building.
          </p>
          <a
            href="mailto:hello@cnxcribs.com"
            className="mt-5 inline-block bg-terracotta text-cream py-3 px-7 rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Get in touch →
          </a>
        </div>
      </section>
    </>
  );
}
