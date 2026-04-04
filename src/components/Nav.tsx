"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/cribs", label: "Cribs" },
  { href: "/directory", label: "Directory" },
  { href: "/guides", label: "Guides" },
  { href: "/playbook", label: "Playbook" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="px-4 md:px-8 py-5 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Image src="/mascot.svg" alt="" width={32} height={32} className="w-8 h-8" />
          <span className="font-serif font-bold text-[22px] text-espresso tracking-tight">
            CNX Cribs
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-7 text-sm font-medium text-dark-roast">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-terracotta transition-colors"
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
            className={`block w-5 h-[2px] bg-espresso transition-transform duration-200 ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-5 h-[2px] bg-espresso transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-[2px] bg-espresso transition-transform duration-200 ${
              menuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-2 border-t border-sand pt-4 flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-dark-roast hover:text-terracotta transition-colors py-1"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
