import Link from "next/link";

export default function Footer() {
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
              <Link href="/about" className="hover:text-terracotta transition-colors">About</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-sand text-xs text-latte">
        © {new Date().getFullYear()} CNX Cribs. Built with ☕ in Chiang Mai.
      </div>
    </footer>
  );
}
