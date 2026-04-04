import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, getArticleBySlug, getAllContributors } from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} | CNX Cribs`,
    description: article.description,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const contributors = getAllContributors();
  const author = contributors.find((c) => c.slug === article.author);
  const otherArticles = getAllArticles().filter((a) => a.slug !== slug).slice(0, 3);

  const sections = article.content
    .split(/^## /m)
    .filter((s) => s.trim());

  return (
    <div className="pt-8 md:pt-12 pb-8 max-w-3xl mx-auto">
      {/* Article Header */}
      <header className="mb-10">
        <h1 className="font-serif font-bold text-[30px] md:text-[40px] text-espresso tracking-tight leading-tight">
          {article.title}
        </h1>
        {article.description && (
          <p className="text-latte text-base md:text-lg mt-3 leading-relaxed">
            {article.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-4">
          {author?.photo && (
            <img
              src={`/contributors/${author.photo}`}
              alt={author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div className="text-sm">
            {author && <div className="font-medium text-espresso">{author.name}</div>}
            <div className="text-latte">
              {new Date(article.published).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              &middot; {article.reading_time} min read
            </div>
          </div>
        </div>
      </header>

      {/* Article Body */}
      <article className="text-[15px] leading-[1.8] text-dark-roast">
        {sections.map((section, i) => {
          const newlineIndex = section.indexOf("\n");
          if (newlineIndex === -1) {
            return (
              <div key={i} className="mb-6 space-y-4">
                {section.split("\n\n").map((para, j) => {
                  const lines = para.split("\n");
                  const isList = lines.every((l) => l.trimStart().startsWith("- ") || l.trim() === "");
                  if (isList) {
                    return (
                      <div key={j} className="space-y-2.5">
                        {lines.filter((l) => l.trimStart().startsWith("- ")).map((line, k) => {
                          const text = line.trimStart().slice(2);
                          return (
                            <div key={k} className="flex gap-2">
                              <span className="text-terracotta mt-1 shrink-0">&#8226;</span>
                              <span
                                className="text-dark-roast text-[15px] leading-relaxed"
                                dangerouslySetInnerHTML={{
                                  __html: text.replace(
                                    /\*\*(.*?)\*\*/g,
                                    '<strong class="text-espresso font-semibold">$1</strong>'
                                  ),
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return <p key={j}>{para}</p>;
                })}
              </div>
            );
          }
          const title = section.slice(0, newlineIndex).trim();
          const body = section.slice(newlineIndex + 1).trim();
          return (
            <div key={title} className="mb-8">
              <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-3">
                {title}
              </h2>
              <div className="space-y-4">
                {body.split("\n\n").map((para, j) => {
                  const lines = para.split("\n");
                  const isList = lines.every((l) => l.trimStart().startsWith("- ") || l.trim() === "");
                  if (isList) {
                    return (
                      <div key={j} className="space-y-2.5">
                        {lines.filter((l) => l.trimStart().startsWith("- ")).map((line, k) => {
                          const text = line.trimStart().slice(2);
                          return (
                            <div key={k} className="flex gap-2">
                              <span className="text-terracotta mt-1 shrink-0">&#8226;</span>
                              <span
                                className="text-dark-roast text-[15px] leading-relaxed"
                                dangerouslySetInnerHTML={{
                                  __html: text.replace(
                                    /\*\*(.*?)\*\*/g,
                                    '<strong class="text-espresso font-semibold">$1</strong>'
                                  ),
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return (
                    <p
                      key={j}
                      dangerouslySetInnerHTML={{
                        __html: para.replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong class="text-espresso font-semibold">$1</strong>'
                        ),
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </article>

      {/* More Guides */}
      {otherArticles.length > 0 && (
        <div className="border-t border-sand mt-12 pt-10">
          <h2 className="font-serif font-bold text-xl text-espresso tracking-tight mb-6">
            More Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherArticles.map((a) => (
              <Link
                key={a.slug}
                href={`/guides/${a.slug}`}
                className="block bg-milk rounded-2xl border border-sand p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <h3 className="font-serif font-bold text-lg text-espresso">{a.title}</h3>
                <p className="text-sm text-latte mt-1 line-clamp-2">{a.description}</p>
              </Link>
            ))}
          </div>
          <Link
            href="/guides"
            className="inline-block mt-6 text-sm font-semibold text-terracotta hover:underline"
          >
            View all guides →
          </Link>
        </div>
      )}
    </div>
  );
}
