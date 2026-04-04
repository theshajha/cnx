import Link from "next/link";
import { getAllContributors } from "@/lib/content";

export default function Footer() {
  const contributors = getAllContributors();
  const showInFooter = contributors.slice(0, 5);
  const remaining = contributors.length - showInFooter.length;

  return (
    <footer className="border-t border-sand mt-16 py-12 px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div className="max-w-md">
          <div className="font-serif font-bold text-lg text-espresso">cnx cribs</div>
          <p className="text-sm text-latte mt-2 leading-relaxed">
            Curated long-term rentals in Chiang Mai. Built by an expat, for expats.
            Every listing verified on foot.
          </p>
        </div>
        <div className="flex gap-12 text-sm">
          <div>
            <div className="font-semibold text-espresso mb-3">Explore</div>
            <div className="flex flex-col gap-2 text-latte">
              <Link href="/nimman" className="hover:text-terracotta transition-colors">Nimman</Link>
              <Link href="/old-city" className="hover:text-terracotta transition-colors">Old City</Link>
              <Link href="/guide" className="hover:text-terracotta transition-colors">Guide</Link>
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

      {/* Contributors strip */}
      {contributors.length > 0 && (
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-sand">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-latte font-medium">Built by</span>
            {showInFooter.map((c, i) => (
              <span key={c.slug} className="text-xs text-dark-roast font-semibold">
                {c.twitter ? (
                  <a
                    href={`https://twitter.com/${c.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-terracotta transition-colors"
                  >
                    {c.name}
                  </a>
                ) : (
                  c.name
                )}
                {i < showInFooter.length - 1 && <span className="text-latte font-normal"> · </span>}
              </span>
            ))}
            {remaining > 0 && (
              <Link href="/contributors" className="text-xs text-terracotta font-semibold hover:underline">
                and {remaining} more
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto mt-4 pt-4 border-t border-sand text-xs text-latte">
        © {new Date().getFullYear()} CNX Cribs. Built with ☕ in Chiang Mai.
      </div>
    </footer>
  );
}
