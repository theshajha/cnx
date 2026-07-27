"use client";

import { useState } from "react";
import posthog from "posthog-js";

/**
 * Optional email capture for the arrival brief.
 *
 * The PDF itself is never gated — gating the most shareable thing on the site
 * would sit badly next to "free, no agent fees", and gated PDFs do not get
 * forwarded. This is a separate, honest ask: leave an address if you want the
 * sheet again when the numbers move.
 *
 * Addresses go to PostHog rather than a mailing platform, so there is no server
 * and no new service — which keeps the site a static export. That does mean
 * this is a list to export later, not something that can send mail today.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type State = "idle" | "error" | "done";

export default function BriefSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Honeypot: real people never fill a field they cannot see.
    const trap = (e.currentTarget.elements.namedItem("company") as HTMLInputElement)?.value;
    if (trap) {
      setState("done");
      return;
    }

    const value = email.trim().toLowerCase();
    if (!EMAIL.test(value)) {
      setState("error");
      setMessage("That does not look like an email address.");
      return;
    }

    // Identify by email so the list is exportable as people rather than as raw
    // events, then record the signup itself with where it came from.
    posthog.identify(value, { email: value, signup_source: "arrival-brief" });
    posthog.capture("brief_signup", { source: "arrival-brief" });

    setState("done");
    setMessage("");
  }

  if (state === "done") {
    return (
      <div className="bg-verified/[0.07] border border-verified/30 rounded-xl p-5 max-w-lg">
        <p className="text-[15px] font-semibold text-verified">Got it — you&rsquo;re on the list.</p>
        <p className="text-[13px] text-dark-roast leading-relaxed mt-1.5">
          We&rsquo;ll send the sheet again when the numbers move, and nothing else. The PDF above is
          yours either way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg">
      <label htmlFor="brief-email" className="block text-[15px] font-semibold text-espresso">
        Want the updated sheet when prices move?
      </label>
      <p className="text-[13px] text-latte leading-relaxed mt-1">
        Optional. The rents on this sheet change as we re-check buildings — leave an address and
        we&rsquo;ll send the new one. No newsletter, no drip sequence.
      </p>

      <div className="flex gap-2 mt-3 flex-wrap sm:flex-nowrap">
        <input
          id="brief-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          aria-invalid={state === "error"}
          aria-describedby={state === "error" ? "brief-email-error" : undefined}
          className={`flex-1 min-w-0 bg-milk border rounded-xl px-4 py-3 text-[14px] text-espresso placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-colors ${
            state === "error" ? "border-flag" : "border-sand hover:border-latte"
          }`}
        />
        {/* Not display:none — some bots skip hidden fields but fill off-screen ones. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] w-px h-px opacity-0"
        />
        <button
          type="submit"
          className="bg-espresso text-cream px-6 py-3 rounded-xl text-[14px] font-bold hover:bg-dark-roast transition-colors shrink-0"
        >
          Send it to me
        </button>
      </div>

      {state === "error" && (
        <p id="brief-email-error" className="text-[12px] text-flag mt-2">
          {message}
        </p>
      )}

      <p className="text-[11px] text-mist mt-2.5 leading-relaxed">
        Your address is stored in our analytics tool and used only to send the updated sheet. We
        don&rsquo;t sell it or pass it to landlords. Ask us any time and we&rsquo;ll delete it.
      </p>
    </form>
  );
}
