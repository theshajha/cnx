# cnx — UI/UX Revamp Design Spec

**Date:** 2026-05-03
**Scope:** Design system + Home page + Building Detail page
**Deliverable:** A Pencil design file in this repo, plus this spec

---

## 1. Brief

The current cnx site reads as a tasteful but generic blog template ("polished poly-update website"). It has a clear voice — *your honest friend in Chiang Mai* — but the visual design doesn't carry the voice. This revamp commits the site to a **Bold & Playful** direction with a distinctly **Chiang Mai** visual vocabulary, so that landing on cnx creates an immediate, memorable impression: *"this is made by someone who lives here, has opinions, and is not pretending to be a corporate listing site."*

### Personality

Made-by-humans, opinionated, alive, locally rooted. Sharpie-on-paper energy meeting modern editorial confidence. Not a tourism brand. Not a real-estate aggregator. A *field guide.*

### What changes
- The visual language (palette, type, motifs, components, motion)
- The Home page (composition + interactive moments)
- The Building Detail page (composition + the Trust Scorecard pattern)

### What does *not* change (this round)
- Information architecture / URL structure
- Content model fundamentals (small content additions noted below)
- Cribs index, Area, Playbook, Guides, Directory pages — these will inherit the design system and be redesigned in a follow-up

---

## 2. Design System

### 2.1 Palette

Saturated, committed colors pulled from Chiang Mai streets. The current coffee palette (espresso/cream/sand/terracotta/milk/latte) is retired.

| Token | Hex (target) | Role |
|---|---|---|
| `saffron-600` | `#E85A1A` | Primary action, monk-orange — the loud color |
| `jade-700` | `#0E5E4E` | Secondary action, success, "go" |
| `tuk-tuk-red` | `#D6271E` | Alert, hot, warnings, Sharpie marks |
| `naga-indigo` | `#1B1F3A` | Primary text, dark surfaces |
| `sticky-rice` | `#F7F1E3` | Warm off-white background |
| `mango` | `#FFC857` | Accent, hover-highlight |
| `paper-white` | `#FFFCF5` | Card / paper surfaces |
| `ink-mid` | `#4A4F6A` | Body text on light surfaces |

Plus two derived patterns:
- **Karen-stripe** — horizontal multi-color stripe (saffron, jade, indigo, mango)
- **Hmong-diamond** — small geometric diamond tile (indigo on sticky-rice)

Used sparingly: as section dividers, behind tags, occasionally as full-bleed band backgrounds.

### 2.2 Typography

- **Display:** heavy condensed grotesque, Druk-class. STAMPED, set tight, often italic on the most opinionated headlines. (Final face TBD at design time — placeholder: *Druk Wide Heavy Italic* or *PP Neue Machina Ultrabold*.)
- **Body:** humanist sans, General Sans / Söhne-class. 16/26 default. (Placeholder: *General Sans Medium*.)
- **Accent:** hand-drawn marker font. Used for Sharpie annotations, pull-quote signatures, Thai phrases, prices being circled. (Placeholder: *Caveat Bold* or a custom hand-set.)

Type scale (desktop):
- Display XL: 96/96 — hero headline only
- Display L: 64/64 — section openers
- Display M: 40/44 — page H1
- Headline: 28/32 — card titles
- Body L: 18/28 — lead paragraphs
- Body: 16/26 — default
- Body S: 14/22 — meta, captions
- Mono: 14/22 — numbers, receipts, prices

### 2.3 Signature motif system

- **The Doi Suthep mark** — a 3-peak silhouette. Used as: stamp next to wordmark, scroll indicator, section divider ornament, faint watermark on building photos, verification stamp. One mark, used everywhere, becomes the recognizable signature.
- **Textile pattern strips** — 16–32px tall horizontal bands (Karen-stripe or Hmong-diamond) used between sections instead of generic dividers.
- **Sharpie annotation layer** — a reusable visual system: red circles, arrows, ✓, ✗, scrawled handwritten notes — overlaid on photos, prices, key numbers. *This is the brand voice made visual.*

### 2.4 Component primitives

- **Buttons** — chunky, 8px radius, heavy weight, 2–3px offset drop-shadow (risograph print feel). No pills. Three variants: primary (saffron), secondary (outlined indigo), ghost (text + Sharpie underline on hover).
- **Cards** — paper-feel surface, soft shadow, occasional rotation (-1° to +1°) so the page feels *placed* not *grid-locked.*
- **Tags / chips** — textile-stripe background for category, solid color for status.
- **Photos** — occasionally break their container (full-bleed-into-text). May carry one Sharpie annotation. Real photos only for buildings/units; illustrations only for atmosphere/maps.
- **Inputs** — chunky 8px radius, 2px border in indigo, focus state shifts to saffron border.

### 2.5 Motion (restrained)

- Hand-drawn underlines that draw themselves in on scroll-into-view
- Tiny scooter that zips across the screen on primary CTA click
- Drifting cloud behind Doi Suthep on the home hero
- Hover tilt on building cards (max 2°)
- Sharpie annotations fade-stroke-in on photo hover (desktop) / always-on (mobile)

### 2.6 Illustration style

A coherent illustration system, generated via image models (Gemini, ChatGPT, Midjourney, Ideogram) referencing a fixed style sheet. The Pencil file includes a dedicated **Illustration Style Sheet** page with prompt scaffolding, palette swatches, and reference frames. Maps are sketched-by-hand for layout accuracy and AI-rendered for style.

---

## 3. Home Page

Goal: in 3 seconds, convey *honest local friend, opinionated, alive.*

### 3.1 Composition (top to bottom)

1. **Hero** — full-bleed Nimman golden-hour photo. Doi Suthep mark + cnx wordmark top-left. Display-italic headline *"Your honest friend\nin Chiang Mai"* with a hand-drawn underline that animates under "honest." Two chunky offset-shadow CTAs (Saffron primary "Browse Cribs", outlined "New here? Start with the playbook"). Sharpie corner-note: *"updated weekly. by people who actually live here."*
2. **Live "What's happening now" strip** — replaces the static trust bar. Textile-pattern band with: current month + season tag (`MAY · BURNING SEASON ⚠️`), today's AQI, current temp, one rotating live stat (e.g., *"low-floor units 8% cheaper this month"*). Re-visit-worthy.
3. **Voice moment** — oversized pull-quote in display italic, Sharpie underline on the punchline phrase, hand-scrawled signature attribution.
4. **Recommended Cribs** — 4 cards in an *asymmetric* grid (not 2×2). Each card slightly rotated (-1° to +1°), photo with one Sharpie annotation, mini trust scorecard bars under price. Hover straightens the rotation to 0°.
5. **"New to Chiang Mai?" zine spread** — dark Naga-Indigo full-bleed section. 6 guide tiles styled as torn-paper hand-numbered chapters (01, 02, 03…) with textile-stripe accents.
6. **Explore by Area — illustrated map** — replaces the current 2-up area grid. Stylized illustrated map of Chiang Mai with neighborhoods marked as pins. Tap/hover pin → area card pops with "*this area is for you if… / skip this area if…*" copy + price range. The map *is* the navigation. **Highest-effort element on the page; biggest impression-driver.** Fallback if map illustration is delayed: textured area-card grid where each card has a small hand-drawn vignette.
7. **Receipts (stats)** — same data as today's stats (buildings, cheapest, guides, no-fees) but framed as a hand-stamped receipt: monospace numbers, Sticky Rice background, Doi Suthep stamp top-right.
8. **Latest Guides + Directory** — collapsed into one editorial section, magazine-style 1-big-2-small layout.
9. **Footer** — textile pattern strip, mountain mark + wordmark, nav columns, hand-drawn "send us a tip" arrow CTA.

### 3.2 Interactive "wow" moments baked in

- **Sharpie overlays on building photos** (#4)
- **Trust scorecard bars on cards** (#4) — 4 axes: Value · Build · Noise · Mgmt
- **Live what's-happening strip** (#2)
- **Neighborhood-as-character** — area cards open with for-you-if / skip-if copy (#6)
- **Doi Suthep mark** as recurring stamp (throughout)
- **Cursor/hover personality** — card tilt, Sharpie underline draw-in, scooter zip on CTA click

---

## 4. Building Detail Page

Goal: this is where someone decides whether to message a landlord. Density + trust.

### 4.1 Composition

1. **Sticky mini-nav on scroll** — building name + price + Contact CTA. Doi Suthep mark as scroll progress indicator.
2. **Hero — split (60/40)** — large lead photo with one bold Sharpie annotation on the left. Right side: name in heavy condensed display, area pill (textile pattern), price range as headline-size saffron number, opinionated one-line tagline in display italic. Photo strip below opens full gallery.
3. **Trust Scorecard** — full-width Sticky-Rice panel. 4 bars (Value · Build Quality · Noise · Management), each with a 0–10 saffron fill and one-line *handwritten* explanation. AC-bill-estimate callout on the right with a Sharpie circle. "Last verified: April 2026" tag with Doi Suthep stamp. **The page's signature element.**
4. **The Honest Take** — torn-paper card. Hand-written heading ("*What I'd actually tell a friend*"), 3–5 lines of opinion, contributor signature + small portrait.
5. **Quick Facts strip** — textile-pattern band: Floors · Year built · Pool · Gym · Pet policy · Walk score. Icons restrained, monospace numbers.
6. **Units & Pricing** — chunky tabs (Studio / 1BR / 2BR). Each row: floorplan thumb, size, price range, real all-in estimate (if available). Sharpie note for unit quirks.
7. **Photo Gallery — magazine layout** — varying tile sizes, occasional rotation, occasional Sharpie annotation. Optional "before you book" callout overlay on problem photos.
8. **Location & Nearby** — hand-drawn neighborhood vignette (image-model generated, ~500m radius). Pins for 7-Eleven, best coffee, gym, fastest scooter route. Walk-times in handwritten accent.
9. **Contact card** — sticky on desktop, expanding bar on mobile (evolves the existing `MobileContactBar.tsx`). Landlord name, languages, response-time stat, "Mention cnx for no-agent-fee" Sharpie note. Saffron primary CTA: "Message on LINE / WhatsApp."
10. **Verified stamp** — small but loud, near the trust scorecard. ("VERIFIED · cnx · 2026")
11. **Nearby Buildings (compare)** — 3 cards with same scorecard visible, framed as *"if this one isn't right…"*
12. **Footer** — same as home.

### 4.2 Mobile

- Hero stacks; photo on top, text below
- Trust Scorecard becomes vertical bars
- Contact card becomes a bottom-fixed expanding bar (evolution of existing component)
- Cards lose rotation (-1°/+1°) on mobile to preserve scannability

---

## 5. Content Model Implications

These design choices imply small content-model additions. The design degrades cleanly when fields are missing — they're not blockers for shipping the visual revamp.

### 5.1 Per-building (new fields, optional)

- `trust_scorecard`:
  - `value` (0–10) + `value_note` (string, ≤100 chars)
  - `build` (0–10) + `build_note`
  - `noise` (0–10) + `noise_note`
  - `management` (0–10) + `management_note`
- `ac_bill_estimate_thb` (number, monthly THB estimate)
- `last_verified` (ISO date)
- `honest_take`: { `body`: string, `contributor`: slug ref }
- `sharpie_annotations`: array of `{ photo: ref, label: string, type: "good" | "warn" | "bad" }`
- `landlord_languages`: array of strings (e.g., `["Thai","English"]`)
- `landlord_response_time_hours` (number, optional)

### 5.2 Site-wide (new)

- `live_strip` config: rotating stats source (manually edited monthly is fine for v1; AQI can be live API later)
- Per-area: `for_you_if` (string[]) + `skip_if` (string[]) for the area-card popovers

If any of the above is absent on a given record, the corresponding UI element is hidden. No "N/A" placeholders.

---

## 6. Pencil File Structure

The Pencil file (`cnx-revamp.pen`) will contain these pages, in this order:

1. **Cover** — title, date, scope summary
2. **Design System** — palette, type scale, motifs, component primitives, motion notes
3. **Illustration Style Sheet** — 6–8 reference frames, prompt scaffolding, do/dont notes
4. **Home — Desktop**
5. **Home — Mobile**
6. **Building Detail — Desktop**
7. **Building Detail — Mobile**
8. **Component Library** — buttons, cards, tags, inputs, scorecard, sharpie-annotation kit, doi-suthep mark variants
9. **Annotations** — flow notes, interaction specs, mobile breakpoint behavior

Real photos are mocked from `/public` where available; illustrations are placeholder rectangles labeled with the prompt direction (e.g., *"Hand-drawn isometric Nimman district, golden-hour palette, Lanna roof accents"*).

---

## 7. Out of Scope (Explicitly)

- Cribs index, Area, Playbook, Guides, Directory page redesigns — follow-up round, will inherit the design system
- Real illustration generation — separate workstream after design approval
- Custom font licensing decisions — placeholders during design; final licensing during implementation
- Live data integrations (AQI, weather) — v1 of the live strip can be manually edited monthly
- A/B testing or rollout strategy — implementation-plan concern
- Dark mode

---

## 8. Risks & Open Questions

- **Trust Scorecard data availability.** If we don't have all 4 axes for most buildings, we ship with the 2 we have and expand. Need to confirm existing content coverage before content-modeling sprint.
- **Illustration style consistency.** Mitigated by the Illustration Style Sheet + style-locked prompt scaffolding. Still requires editorial discipline when generating new assets.
- **The illustrated area map.** If commissioning vs. AI-generating is a budget/timeline question, the textured-grid fallback is fully designed.
- **"Bold & playful" vs. SEO/scan-ability.** Display-heavy headlines and rotated cards are visual wins but need testing for accessibility and reading speed. Will validate during implementation, not design.
- **Mobile complexity.** Sharpie overlays + rotation + textile patterns can feel busy at 375px. Mobile mocks will be more restrained than desktop by design.
