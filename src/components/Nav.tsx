"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/start", label: "Start here" },
  { href: "/cribs", label: "Cribs" },
  { href: "/directory", label: "Directory" },
  { href: "/guides", label: "Guides" },
  { href: "/playbook", label: "Playbook" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // On homepage: transparent when at top, solid on scroll
  // On other pages: always solid
  const navBg = scrolled
    ? "bg-cream/95 backdrop-blur-md border-b border-sand shadow-sm"
    : "bg-transparent";

  const textColor = scrolled || !isHome ? "text-espresso" : "text-cream";
  const linkColor = scrolled || !isHome ? "text-dark-roast hover:text-terracotta" : "text-cream/80 hover:text-cream";
  const hamburgerColor = scrolled || !isHome ? "bg-espresso" : "bg-cream";
  const mobileMenuBg = scrolled || !isHome
    ? "border-sand"
    : "border-cream/20";
  const mobileLinkColor = scrolled || !isHome
    ? "text-dark-roast hover:text-terracotta"
    : "text-cream/80 hover:text-cream";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Image src="/mascot.svg" alt="" width={32} height={32} className="w-8 h-8" />
            <span className={`font-serif font-bold text-[22px] tracking-tight transition-colors duration-300 ${textColor}`}>
              CNX Cribs
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-7 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-300 ${linkColor}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-[2px] transition-all duration-200 ${hamburgerColor} ${
                menuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block w-5 h-[2px] transition-all duration-200 ${hamburgerColor} ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-[2px] transition-all duration-200 ${hamburgerColor} ${
                menuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className={`md:hidden mt-4 pb-2 border-t pt-4 flex flex-col gap-3 ${mobileMenuBg}`}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium transition-colors py-1 ${mobileLinkColor}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
