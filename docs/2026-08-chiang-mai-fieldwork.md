# Chiang Mai fieldwork — August 2026

**Trip:** ~early August 2026 (planned 2026-07-26)
**Goal:** close the gaps the site cannot close from a desk, and reset every `last_verified` to a date that means something.

Run `npm run audit:content` before you fly — it regenerates this worklist from live data.
Follow `.claude/skills/monthly-data-refresh/` for the rules. The one that matters:

> **Only bump `last_verified` for buildings you actually stood in front of.**
> A stale date renders honestly. A wrong one is the only unrecoverable mistake here.

---

## Priority 1 — the 22 buildings with no contact method

Half the inventory currently cannot convert. A page with no LINE ID is a dead end no
matter how good the write-up is. **This is the highest-value hour of the whole trip.**

Ask reception for the building's LINE Official Account, or the manager's line. Failing
that, photograph the "for rent" board in the lobby — those numbers are usually owners
who will talk.

Add to the file as:

```yaml
contact:
  phone: "+66 XX XXX XXXX"
  line: "@buildingname"
  email: null
  website: null
```

| Building | Where | Also needs |
|---|---|---|
| D Condo Nim | Nimmanhaemin Road | — |
| Hillside 2 | 2 Nimmanhaemin Road | score, wifi |
| Hillside 3 | Nimman Soi 8 | — |
| Hillside 4 | 50/20 Huay Kaew Road | score, note |
| Liv@Nimman | Nimman Soi 2 | — |
| Mountain View | Soi Khiang Doi 2 | score |
| My Hip 2/3/4 | 135 CBP Soi 1-2, Nong Pa Khrang | score |
| One Plus Huay Kaew | Huay Kaew Road | score, wifi |
| Palm Springs Areca | Nimman Soi 5 | score |
| Palm Springs Fountain | Nimman Soi 5 | score |
| Palm Springs Parlor | Nimman Soi 5 | score |
| Palm Springs Phoenix | Huay Kaew Rd, nr Soi 5 | score |
| Palm Springs Royal | Nimman Soi 5 | score |
| Punna Nimman | Nimman Soi 7-9 | score, note, wifi |
| S Condominium | Sirimangklajarn Soi 1 | — |
| The Nimmana | Nimman Soi 6 | score, note |
| The Siri | Sirimangklajarn Soi 1 | score, note |
| The Unique at Nimman | 1 Choi Suk Kasem | wifi |
| The Unique at Nimman 2 | 11 Nimman Rd, Soi Sukkasem | score |
| Trams 1 | Jed Yod-Chang Khian Rd | score, wifi |
| Supalai Monte 2 | Chiang Mai–Doi Saket Rd | score |
| Viengping Mansion | 52/112 Moo 5, CM–Lampang Rd | score |

**Five of these are the Palm Springs cluster on Soi 5** — one visit, five records. Start there.

---

## Priority 2 — score the 33 unscored buildings

`recommendation_score` (1–10) drives the default ordering on `/cribs`. Unscored buildings
currently fall back to ฿/sqm, which is honest but blunt — it cannot tell you that a cheap
building is cheap because the lift is broken.

The question to answer at each one: **would I actually live here, and who for?**

Don't score from the lobby. If you didn't get past reception, leave it unscored — the
fallback ordering handles it, and an invented score is worse than none.

Unscored, by cluster:

- **Nimman core:** Palm Springs ×5, Punna Nimman, The Nimmana, The Siri, The Empire Nimman, Yantarasri@Nimman, The Unique at Nimman 2, Hillside 2
- **Huay Kaew / Santitham:** Hillside 4, One Plus Huay Kaew, The Bliss, Huay Kaew Residence, Srithana Condominium, d'VIENG Santitham, View Doi Mansion, Pansook High Quality Condo, Nakornping Condominium, Promt Condo, Serene Teak
- **Chang Phueak / north:** Mountain View, Trams 1, Viengping Mansion
- **Needs a ride:** Green Hill Place, My Hip 2/3/4, Supalai Monte 2, Doi Ping Mansion, Galare Thong Tower, Smith Residence, Baan Thai Condominium

---

## Priority 3 — smaller fixes

### The 7 `wifi: 0` buildings

`0` currently renders as **"None — arrange your own"**. Confirm that is right at:
Hillside 2, One Plus Huay Kaew, Punna Nimman, The Unique at Nimman, Trams 1,
Doi Ping Mansion, Srithana Condominium.

If the building *does* include wifi, the value is the string `"included"`, not `0`.
Hillside 2's own notes already say "No building WiFi", so that one is probably correct.

### 4 buildings with no first-person take

Hillside 4, Punna Nimman, The Nimmana, The Siri. The `contributor_note` is the reason
someone reads the page rather than a listing portal. Two or three honest sentences beats
a paragraph of description.

### One photo to replace

**Nivas Chiangmai** — the hero image is the brand logo, not the building. Any exterior
shot fixes it. Drop it at `public/buildings/nivas-chiangmai/hero.jpg`.

### Prices

Note anything that has moved more than ~10% since April. Drift is exactly the signal a
long-stay renter wants, and it is worth a line in the note when it happens.

---

## Worth resolving on the ground: the area taxonomy is wrong

This surfaced while building the trip list and is a real content problem, not a design one.

`content/areas.yml` has exactly two areas, **Nimman** and **Old City** — but a good number
of buildings are filed into an area they are not in:

| Building | Filed as | Address actually says |
|---|---|---|
| Baan Thai Condominium | old-city | Su Thep, near Tesco Lotus Nimman |
| d'VIENG Santitham | old-city | Santitham |
| Doi Ping Mansion | old-city | Chang Khlan (Night Bazaar) |
| Galare Thong Tower | old-city | Chang Klan Road |
| Huay Kaew Residence | old-city | Huay Kaew Road |
| Nakornping / Pansook / Promt / Serene Teak | old-city | Chang Phueak / Santitham |
| View Doi Mansion | old-city | Santitham |
| Supalai Monte 2 | old-city | Nong Pa Khrang |
| Viengping Mansion | old-city | Chiang Mai–Lampang Road |
| Green Hill Place | nimman | Super Highway Road, Chang Phueak |
| My Hip 2/3/4 | nimman | Nong Pa Khrang |
| Mountain View / Trams 1 | nimman | Chang Phueak |

Someone filtering "Old City" today gets Santitham and Chang Khlan buildings. Nothing
inside the ancient moat is actually in the set.

**The fix is a taxonomy decision, and you are the only one who can make it well.** The
honest options:

1. **Add the real areas** — Santitham, Chang Phueak, Chang Khlan, Huay Kaew, Nong Pa
   Khrang — and refile. Most accurate; makes the area filter genuinely useful. Only
   `areas.yml` and each building's `area:` field change; directory pages pick it up
   automatically.
2. **Rename the two you have** to what they actually contain — e.g. "Nimman & around"
   and "North & east of the moat". Cheapest, and stops the page lying.

While you are walking these, note which neighbourhood each building genuinely belongs to.
That is data you can only get by being there.

---

## New areas worth scouting

Currently the site covers two nominal areas. The neighbourhoods long-stayers actually end
up in — and which cap the site's usefulness more than any design issue — are:

- **Santitham** — cheapest real option with walkable amenities; several buildings already in
  the set are here and misfiled.
- **Hang Dong / Ban Waen** — where people go when they want a house and a garden.
- **Chang Khlan / Night Bazaar** — riverside, older stock, often overlooked.

Even three buildings each would double the site's coverage of how people really live here.

---

## Before you leave, after you're back

```bash
npm run audit:content     # what still needs a human
npm run compute:nearby    # refresh walk times if areas/spots changed
npm run build             # fails on missing photos or drifted derived data
```

Commit honestly — say what you checked and what you did not:

```
content: August sweep — 18 buildings visited, 22 contacts added

Visited: the-nimmana, the-siri, palm-springs-*, punna-nimman, …
Not re-checked: the remaining 25 keep their April dates.
```
