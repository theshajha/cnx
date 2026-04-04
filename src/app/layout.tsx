import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "CNX Cribs — Chiang Mai Long-Term Rentals for Expats",
  description: "Curated, verified monthly rentals in Chiang Mai. Real prices, expat tips, and honest reviews. Built by an expat, for expats.",
  openGraph: {
    title: "CNX Cribs — Chiang Mai Long-Term Rentals for Expats",
    description: "Curated, verified monthly rentals in Chiang Mai. Real prices, expat tips, and honest reviews.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cream text-espresso antialiased">
        <Nav />
        <main className="max-w-6xl mx-auto px-4 md:px-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
