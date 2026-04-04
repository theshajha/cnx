import Link from "next/link";
import { getAllContributors } from "@/lib/content";

export default function Footer() {
  const contributors = getAllContributors();
  const showInFooter = contributors.slice(0, 3);
  const remaining = contributors.length - showInFooter.length;

  return (
    <footer className="border-t border-sand mt-16 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div className="max-w-md">
          <div className="font-serif font-bold text-lg text-espresso">CNX Cribs</div>
          <p className="text-sm text-latte mt-2 leading-relaxed">
            Curated long-term rentals in Chiang Mai. Built by an expat, for expats.
            Every listing verified on foot.
          </p>
        </div>
        <div className="flex gap-12 text-sm">
          <div>
            <div className="font-semibold text-espresso mb-3">Explore</div>
            <div className="flex flex-col gap-2 text-latte">
              <Link href="/cribs" className="hover:text-terracotta transition-colors">All Cribs</Link>
              <Link href="/cribs/nimman" className="hover:text-terracotta transition-colors">Nimman</Link>
              <Link href="/cribs/old-city" className="hover:text-terracotta transition-colors">Old City</Link>
              <Link href="/directory" className="hover:text-terracotta transition-colors">Directory</Link>
              <Link href="/playbook" className="hover:text-terracotta transition-colors">Playbook</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-espresso mb-3">Contribute</div>
            <div className="flex flex-col gap-2 text-latte">
              <a href="mailto:hello@cnxcribs.com" className="hover:text-terracotta transition-colors">Email Us</a>
              <Link href="/contributors" className="hover:text-terracotta transition-colors">Contributors</Link>
              <Link href="/about" className="hover:text-terracotta transition-colors">About</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-sand flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-latte">
        <span>&copy; {new Date().getFullYear()} CNX Cribs</span>
        <span>
          Built by{" "}
          {showInFooter.map((c, i) => {
            const url = c.link || (c.slug === "shashank" ? "https://theshajha.com" : null);
            return (
              <span key={c.slug}>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-dark-roast font-medium hover:text-terracotta transition-colors">{c.name}</a>
                ) : (
                  <span className="text-dark-roast font-medium">{c.name}</span>
                )}
                {i < showInFooter.length - 1 && ", "}
              </span>
            );
          })}
          {remaining > 0 && (
            <>
              {" & "}
              <Link href="/contributors" className="text-terracotta font-medium hover:underline">
                {remaining} other{remaining !== 1 ? "s" : ""}
              </Link>
            </>
          )}
        </span>
      </div>
    </footer>
  );
}
