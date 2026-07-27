"use client";

import posthog from "posthog-js";

/**
 * Whether the sheet actually gets downloaded is the only real measure of
 * whether it was worth making, so the click is recorded. The href is a plain
 * link — the event is fire-and-forget and never blocks the download.
 */
export default function DownloadButton() {
  return (
    <a
      href="/cnx-first-two-weeks.pdf"
      download
      onClick={() => posthog.capture("brief_downloaded", { format: "pdf" })}
      className="bg-terracotta text-cream px-6 py-3 rounded-xl text-[14px] font-bold hover:bg-terracotta/90 transition-colors"
    >
      Download the PDF ↓
    </a>
  );
}
