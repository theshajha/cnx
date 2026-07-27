# Analytics and email signups

**Set up:** 27 July 2026 · **Tool:** PostHog (US cloud)

## Where things live

| What | Where |
|---|---|
| Project | `Default project`, id `454176`, org **Wovo** |
| Saved signup list | [Arrival brief — email signups](https://us.posthog.com/project/454176/insights/8xpNEk21) |
| Init | `instrumentation-client.ts` |
| Signup form | `src/components/BriefSignup.tsx` |
| Config | `NEXT_PUBLIC_POSTHOG_KEY` / `_HOST` — set on Vercel for Production and Development |

The key is a publishable client token; it ships in the browser bundle by design. It still
lives in an env var rather than source so it is set per environment.

## Exporting the email list

Open the saved insight above and use **Export → CSV**. It returns `email`, `signed_up_at`
and `source`, newest first, and filters out `@example.com` records (RFC 2606 reserves that
domain for testing, so it is never a real signup).

The underlying query, if you need it elsewhere:

```sql
SELECT
    person.properties.email AS email,
    min(timestamp) AS signed_up_at,
    person.properties.signup_source AS source
FROM events
WHERE event = 'brief_signup'
  AND timestamp >= now() - INTERVAL 365 DAY
  AND person.properties.email != ''
  AND person.properties.email NOT LIKE '%@example.com'
GROUP BY email, source
ORDER BY signed_up_at DESC
```

`BriefSignup` calls `identify(email, { email, signup_source })` before capturing, so each
signup becomes a **person** rather than a loose event property. That is what makes the list
exportable as people.

## Events we capture deliberately

| Event | Fires when | Why it matters |
|---|---|---|
| `brief_signup` | Someone opts in on `/start` | The list |
| `brief_downloaded` | The PDF download is clicked | Whether the sheet is worth maintaining |

Pageviews, autocapture, heatmaps and web vitals come from the `defaults: "2026-05-30"`
preset. Session recording masks all inputs — the only input on the site is an email field.

## Gotchas

**PostHog silently drops automated browsers.** Playwright, Puppeteer and headless Chrome
are detected as bots and their events are discarded client-side — the SDK still loads,
fetches remote config and calls `/flags/`, so everything *looks* wired up while zero events
arrive. Turn on debug with `?__posthog_debug=true` and you will see
`Refusing to render web experiment since the viewer is a likely bot`. This is correct
behaviour, but it means **the signup flow cannot be verified end-to-end from a script** —
submit from a real browser instead. To check the pipeline itself without a browser, POST
straight to the ingestion endpoint:

```bash
curl -X POST https://us.i.posthog.com/i/v0/e/ -H 'Content-Type: application/json' \
  -d '{"api_key":"<token>","event":"pipeline_test","distinct_id":"cli"}'
```

**Ingestion lags about a minute.** A new event will not appear in SQL immediately. Wait
before concluding something is broken.

**The project is shared.** `Default project` already carries another product's events
(`page_read`, `plan_meter_viewed`, `hero_setup_mode_changed`, `onboarding_completed`).
cnx data mixes in with those. Worth splitting into its own project before traffic builds —
nothing here depends on the project id except the token.

**PostHog stores, it does not send.** This is a list to export, not a mailing platform.
When you want to actually mail people, export the CSV into something that sends. Preview
deployments deliberately have no PostHog key, so preview traffic never lands in the numbers.
