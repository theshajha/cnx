import { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, getAllContributors } from "@/lib/content";
import { articleDate } from "@/lib/freshness";

export const metadata: Metadata = {
  title: "Guides — In-Depth Articles on Living in Chiang Mai | CNX Cribs",
  description:
    "In-depth articles on living in Chiang Mai. Visas, cost of living, healthcare, transport, and more — written by expats who've figured it out.",
};

export default function GuidesPage() {
  const articles = getAllArticles();
  const contributors = getAllContributors();

  return (
    <div className="pt-8 md:pt-12 pb-8">
      <h1 className="font-serif font-bold text-[36px] md:text-[48px] text-espresso tracking-tight leading-tight mb-2">
        Guides
      </h1>
      <p className="text-latte text-base mb-10 max-w-xl leading-relaxed">
        In-depth articles on living in Chiang Mai. Written by expats who have figured it out.
      </p>

      {articles.length === 0 ? (
        <div className="bg-milk rounded-2xl border border-dashed border-sand p-6 max-w-2xl">
          <p className="text-dark-roast text-sm leading-relaxed">
            Articles are on the way. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => {
            const author = contributors.find((c) => c.slug === article.author);
            return (
              <Link
                key={article.slug}
                href={`/guides/${article.slug}`}
                className="block bg-milk rounded-2xl border border-sand p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <h2 className="font-serif font-bold text-[20px] text-espresso leading-snug">
                  {article.title}
                </h2>
                <p className="text-dark-roast text-[14px] mt-2 leading-relaxed line-clamp-2">
                  {article.description}
                </p>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-sand text-xs text-latte">
                  {author && <span className="font-medium text-dark-roast">{author.name}</span>}
                  <span>{article.reading_time} min read</span>
                  {(() => {
                    const d = articleDate(article.published, article.updated, "short");
                    return (
                      <span className={d.revised ? "text-verified font-medium" : undefined}>
                        {d.label}
                      </span>
                    );
                  })()}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
