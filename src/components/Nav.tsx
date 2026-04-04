import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex justify-between items-center px-8 py-5">
      <Link href="/" className="font-serif font-bold text-[22px] text-espresso tracking-tight hover:text-terracotta transition-colors">
        cnx cribs
      </Link>
      <div className="flex gap-7 text-sm font-medium text-dark-roast">
        <Link href="/nimman" className="hover:text-terracotta transition-colors">Nimman</Link>
        <Link href="/old-city" className="hover:text-terracotta transition-colors">Old City</Link>
        <Link href="/guide" className="hover:text-terracotta transition-colors">Guide</Link>
        <Link href="/playbook" className="hover:text-terracotta transition-colors">Playbook</Link>
        <Link href="/about" className="hover:text-terracotta transition-colors">About</Link>
      </div>
    </nav>
  );
}
