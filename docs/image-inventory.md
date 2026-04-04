# Image Inventory — cnx

Generated: 2026-04-04

## Summary

| Asset type | Total | Real image | Placeholder / missing |
|---|---|---|---|
| Guide spots | 96 | **96** | 0 |
| Building hero photos | 39 | **39** | 0 |
| Building unit photos | 0 | 0 | 0 (all unit `photos: []` arrays are empty) |

**All guide spots and all buildings now have real venue images.**

---

## Guide Spots — All 96 with Real Images

### coffee (8 spots)
| Slug | Photo | Source |
|---|---|---|
| `ristr8to-lab` | `ristr8to-lab.jpg` | worldcoffeebeans.com |
| `graph-cafe` | `graph-cafe.jpg` | simplychiangmai.com |
| `camp-maya` | `camp-maya.jpg` | Wikimedia Commons (CC BY 3.0) |
| `hillkoff` | `hillkoff.jpg` | hillkoff.shop (official) |
| `akha-ama-coffee` | `akha-ama-coffee.jpg` | Wikimedia Commons (CC BY-SA 4.0, Takeaway) |
| `woo-cafe` | `woo-cafe.jpg` | simplychiangmai.com |
| `ss1254372-cafe` | `ss1254372-cafe.jpg` | simplychiangmai.com |
| `the-baristro-asian-style` | `the-baristro-asian-style.jpg` | kant.co.th |

### coworking (8 spots)
| Slug | Photo | Source |
|---|---|---|
| `camp-maya` | `camp-maya.jpg` | chiangmailocator.com |
| `punspace-nimman` | `punspace-nimman.jpg` | chiangmailocator.com |
| `punspace-tha-phae` | `punspace-tha-phae.jpg` | chiangmaimaster.com |
| `mana-coworking` | `mana-coworking.jpg` | chiangmailocator.com |
| `yellow-coworking` | `yellow-coworking.jpg` | yellowincubator.com (official) |
| `heartwork-coworking` | `heartwork-coworking.jpg` | chiangmailocator.com |
| `alt-chiangmai` | `alt-chiangmai.jpg` | freakingnomads.com |
| `hub-chiang-mai` | `hub-chiang-mai.jpg` | hub53.com (official) |

### dentists (8 spots)
All sourced from chiangmailocator.com — storefront/building photos for each clinic.

### gyms (8 spots)
| Slug | Source |
|---|---|
| `virgin-active-central-festival` | virginactive.co.th (official) |
| Others | chiangmailocator.com |

### international-schools (8 spots)
| Slug | Source |
|---|---|
| `lanna-international-school` | lannaist.ac.th (official) |
| `chiang-mai-international-school` | campus.cmis.ac.th (official) |
| `grace-international-school` | Wikimedia Commons (CC BY-SA 4.0) |
| `nakorn-payap-international-school` | nis.ac.th (official) |
| `panyaden-international-school` | Wikimedia Commons (CC BY-SA 3.0, Takeaway) |
| `prem-international-school` | Wikimedia Commons (CC BY-SA 4.0, Nuj Nirun) |
| `varee-chiangmai-school` | vcis.ac.th (official) |
| `unity-concord-international-school` | ucis.ac.th (official) |

### language-schools (8 spots)
All sourced from chiangmailocator.com.

### laundry (8 spots)
All sourced from chiangmailocator.com.

### local-eats (8 spots)
| Slug | Source |
|---|---|
| `saturday-walking-street-wua-lai` | Unsplash (Yiquan Zhang) |
| `chiang-mai-gate-market` | Unsplash (Retno Dwinika) |
| `khao-soi-khun-yai` | Unsplash (Kittitep Khotchalee) |
| `khao-soi-lam-duan-fa-ham` | Wikimedia Commons (CC BY-SA 3.0, Takeaway) |
| `tong-tem-toh` | Unsplash (PHEAP MOEU) |
| `sompetch-kitchen` | Unsplash (Vicky Ng) |
| `cowboy-hat-lady-khao-kha-moo` | Flickr (killerturnip) |
| `coconut-shell-thai-food` | Unsplash (Christopher Yiu Chung) |

### massage (8 spots)
| Slug | Source |
|---|---|
| `fah-lanna-spa` | fahlanna.com (official) |
| `oasis-spa-chiang-mai` | thethaipass.com |
| Others | chiangmailocator.com, trip.com, natgeo |

### motorbikes (8 spots)
All sourced from chiangmailocator.com (except Mike's Motorbike — official website logo).

### supermarkets (8 spots)
| Slug | Source |
|---|---|
| `rimping-kad-farang` | rimping.com (official) |
| `warorot-market` | Wikimedia Commons (CC BY-SA 3.0, Manop) |
| Others | chiangmailocator.com |

### visa-legal (8 spots)
All sourced from chiangmailocator.com.

---

## Buildings — All 39 with Real Hero Images

### Nimman (23 buildings)
| Slug | Source |
|---|---|
| `yantarasri-nimman` | yantarasriatnimman.com (official) |
| `the-mirror` | themirrorchiangmai.com (official) |
| `nivas-chiangmai` | nivas-chiangmai.com (official) |
| `the-nimmana` | planetrowoo.com |
| `the-siri`, `liv-nimman`, `d-condo-nim`, `the-unique-nimman-2` | fazwaz.co.th |
| `hillside-4` | condo-chiang-mai.com |
| `s-condominium` | baania.com |
| Others | chiangmailocator.com |

### Old City (16 buildings)
| Slug | Source |
|---|---|
| `smith-suites` | smithsuites-chiangmai.com (official) |
| `the-51-hometel` | rentforlong.com |
| `serene-teak` | renthub.in.th |
| `dvieng-santitham`, `promt-condo`, `galare-thong-tower`, `nakornping-condo`, `srithana-condo` | fazwaz.co.th |
| Others | chiangmailocator.com |

---

## Photo Credit Handling

The `photo_credit` field on `GuideSpot` is rendered as a **translucent overlay** at the bottom-left of the image (inside the 4:3 frame), styled with `bg-black/50 backdrop-blur-sm text-white/90`. This avoids breaking the card layout that a separate credit row would cause.

Buildings do not have a `photo_credit` mechanism in the current schema.

---

## Tooling

| Script | Purpose |
|---|---|
| `yarn check:guide-photos` | Fails build if any spot's `photo` file is missing |
| `yarn check:building-photos` | Fails build if any building's `photos` or unit `photos` files are missing |
| `yarn generate:guide-placeholder` | Regenerates guide placeholder PNG |
| `yarn generate:building-placeholder` | Regenerates building placeholder and distributes to all slug directories |

Both checks are wired into `yarn build`.
