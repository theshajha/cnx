import posthog from "posthog-js";

/**
 * Client-side analytics init. Next.js runs this before the app renders.
 *
 * Deliberately client-only: the site is a static export with no server, so
 * there is nothing to instrument server-side and nothing to change about the
 * build output. Pageviews and autocapture come from the `defaults` preset;
 * everything else we capture is an explicit business event.
 *
 * The key is a publishable project token — it ships in the client bundle by
 * design. It still lives in an env var so the value is set per environment
 * rather than baked into source.
 */
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    defaults: "2026-05-30",
    // Nothing on this site is behind a login, so there is no session to record
    // that would contain anything private — but people do type an email into
    // the arrival brief form, so mask inputs.
    mask_all_text: false,
    session_recording: { maskAllInputs: true },
  });
}
