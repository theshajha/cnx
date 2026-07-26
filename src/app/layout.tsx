import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

/*
  Fraunces carries the editorial voice; Plex Sans keeps dense data legible without
  going corporate; Plex Mono makes prices and rates read as measurements rather
  than marketing. next/font self-hosts at build time, so this stays compatible
  with `output: "export"` and costs no extra round-trip.
*/
// Variable font: declaring `axes` means the weight range comes along for free,
// so an explicit `weight` list is both unnecessary and rejected by next/font.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CNX Cribs — Chiang Mai Long-Term Rentals for Expats",
  description:
    "Curated monthly rentals in Chiang Mai, checked in person. Real prices, real gotchas, and the expat directory around every building.",
  openGraph: {
    title: "CNX Cribs — Chiang Mai Long-Term Rentals for Expats",
    description:
      "Curated monthly rentals in Chiang Mai, checked in person. Real prices, real gotchas, honest reviews.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="bg-cream text-espresso antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:bg-espresso focus:text-cream focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="max-w-6xl mx-auto px-4 md:px-8 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
