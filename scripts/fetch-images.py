#!/usr/bin/env python3
"""
Fetch hero images for CNX Cribs buildings from listing sites.
Downloads one exterior/hero image per building into public/buildings/{slug}/hero.jpg

Strategy: Search FazWaz for the property page, then grab the main gallery image
which is much higher resolution than search thumbnails.
"""

import os
import re
import sys
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, quote_plus

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(BASE_DIR, "public", "buildings")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

MIN_IMAGE_SIZE = 50000  # 50KB minimum to filter out thumbnails

BUILDINGS = {
    "punna-nimman": "Punna Residence Nimman Chiang Mai",
    "yantarasri-nimman": "Yantarasri at Nimman Chiang Mai",
    "d-condo-nim": "dcondo nim Chiang Mai",
    "hillside-3": "Hillside 3 Condominium Chiang Mai",
    "hillside-4": "Hillside 4 Condominium Chiang Mai",
    "hillside-2": "Hillside 2 Condominium Nimman",
    "the-nimmana": "The Nimmana Condominium Chiang Mai",
    "the-unique-nimman": "The Unique at Nimman Chiang Mai",
    "the-unique-nimman-2": "The Unique at Nimman 2 Chiang Mai",
    "liv-nimman": "Liv@Nimman Condominium Chiang Mai",
    "my-hip": "My Hip Condo Chiang Mai",
    "s-condominium": "S Condominium Nimman Chiang Mai",
    "the-siri": "The Siri Condominium Chiang Mai",
    "palm-springs-nimman": "Palm Springs Nimman Condominium",
    "the-empire-nimman": "The Empire Nimman Chiang Mai",
    "nivas-chiangmai": "Nivas Chiangmai serviced apartment",
    "green-hill-place": "Green Hill Place Chiang Mai",
    "the-bliss": "The Bliss Chiang Mai apartment",
    "the-mirror": "The Mirror Chiang Mai apartment",
    "mountain-view": "Mountain View Condominium Chiang Mai",
    "trams-1": "Trams 1 Condominium Chiang Mai",
    "one-plus-huay-kaew": "One Plus Huay Kaew Chiang Mai",
    "the-cosy-hk": "The Cosy Huay Kaew Chiang Mai",
    "galare-thong-tower": "Galare Thong Tower Chiang Mai",
    "viengping-mansion": "Viengping Mansion Chiang Mai",
    "smith-residence": "Smith Residence Chiang Mai",
    "smith-suites": "Smith Suites Chiang Mai",
    "view-doi-mansion": "View Doi Mansion Chiang Mai",
    "dvieng-santitham": "dVieng Santitham Chiang Mai",
    "nakornping-condo": "Nakornping Condominium Chiang Mai",
    "huay-kaew-residence": "Huay Kaew Residence Chiang Mai",
    "srithana-condo": "Srithana Condominium 2 Chiang Mai",
    "supalai-monte-2": "Supalai Monte 2 Chiang Mai",
    "promt-condo": "Promt Condominium Chiang Mai",
    "doi-ping-mansion": "Doi Ping Mansion Chiang Mai",
    "serene-teak": "Serene Teak Apartment Chiang Mai",
    "pansook-condo": "Pansook Condo Chiang Mai",
    "the-51-hometel": "The 51 Hometel Chiang Mai",
    "baan-thai-condo": "Baan Thai Condominium Chiang Mai",
}


def download_image(url, dest_path):
    """Download image, return True if successful and large enough."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15, stream=True)
        resp.raise_for_status()

        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        with open(dest_path, 'wb') as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)

        file_size = os.path.getsize(dest_path)
        if file_size < MIN_IMAGE_SIZE:
            os.remove(dest_path)
            return False
        return True
    except:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        return False


def try_fazwaz_detail(name):
    """Search FazWaz, follow to property detail page, get large gallery image."""
    try:
        search_url = f"https://www.fazwaz.com/condo-for-rent/thailand/chiang-mai?q={quote_plus(name)}"
        resp = requests.get(search_url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, 'html.parser')

        # Find property detail links
        for a in soup.find_all('a', href=True):
            href = a['href']
            if '/condo/' in href or '/apartment/' in href or '/property/' in href:
                detail_url = href if href.startswith('http') else urljoin(search_url, href)
                # Visit detail page for larger images
                try:
                    detail_resp = requests.get(detail_url, headers=HEADERS, timeout=10)
                    detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')

                    # Look for og:image first (usually high quality)
                    og = detail_soup.find('meta', property='og:image')
                    if og and og.get('content'):
                        return og['content']

                    # Look for large images in gallery
                    for img in detail_soup.find_all('img'):
                        src = img.get('src') or img.get('data-src') or ''
                        if src and ('large' in src or 'original' in src or 'gallery' in src):
                            return src if src.startswith('http') else urljoin(detail_url, src)
                except:
                    pass
                break

        # Fallback: og:image from search page
        og = soup.find('meta', property='og:image')
        if og and og.get('content'):
            return og['content']

    except:
        pass
    return None


def try_booking(name):
    """Search Booking.com for property image (good for serviced apartments)."""
    try:
        search_url = f"https://www.booking.com/searchresults.en-gb.html?ss={quote_plus(name)}"
        resp = requests.get(search_url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, 'html.parser')

        # Booking uses data-testid for property cards
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src') or ''
            if src and 'bstatic.com' in src:
                # Replace thumbnail size with larger version
                large_src = re.sub(r'/max\d+/', '/max800/', src)
                large_src = re.sub(r'/square\d+/', '/square800/', large_src)
                if large_src != src:
                    return large_src
                return src
    except:
        pass
    return None


def try_google_direct(name):
    """Use Google search to find property images from any source."""
    try:
        query = quote_plus(f"{name} exterior building")
        url = f"https://www.google.com/search?q={query}&tbm=isch&tbs=isz:l"
        resp = requests.get(url, headers=HEADERS, timeout=10)

        # Extract image URLs from Google's response
        # Google embeds base64 thumbnails and source URLs in script tags
        matches = re.findall(
            r'https?://[^"\'\\]+\.(?:jpg|jpeg|png|webp)',
            resp.text
        )
        seen = set()
        for match in matches:
            if match in seen:
                continue
            seen.add(match)
            lower = match.lower()
            # Skip Google's own assets
            if any(x in lower for x in ['google', 'gstatic', 'googleapis', 'favicon', 'icon', 'logo', 'thumb']):
                continue
            # Skip tiny images
            if any(x in lower for x in ['50x', '100x', '150x', 'small', 'tiny']):
                continue
            return match
    except:
        pass
    return None


def try_renthub(name):
    """Search RentHub for property image."""
    try:
        clean_name = name.replace(' Chiang Mai', '').replace(' Condominium', '').strip()
        search_url = f"https://www.renthub.in.th/en/search?q={quote_plus(clean_name)}"
        resp = requests.get(search_url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, 'html.parser')

        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src') or ''
            if src and ('renthub' in src or 'rh-cdn' in src):
                if not any(x in src.lower() for x in ['logo', 'icon', 'avatar', 'banner']):
                    # Try to get larger version
                    large = re.sub(r'_\d+x\d+', '_800x600', src)
                    return large if large.startswith('http') else urljoin(search_url, large)
    except:
        pass
    return None


def fetch_image_for_building(slug, name):
    """Try multiple sources to find and download a hero image."""
    dest = os.path.join(PUBLIC_DIR, slug, "hero.jpg")

    # Skip if we already have a good image (> 20KB)
    if os.path.exists(dest) and os.path.getsize(dest) > MIN_IMAGE_SIZE:
        size_kb = os.path.getsize(dest) // 1024
        print(f"  ✓ {slug}: already has image ({size_kb}KB)")
        return True

    sources = [
        ("Google", lambda: try_google_direct(name)),
        ("FazWaz Detail", lambda: try_fazwaz_detail(name)),
        ("Booking.com", lambda: try_booking(name)),
        ("RentHub", lambda: try_renthub(name)),
    ]

    for source_name, search_fn in sources:
        try:
            img_url = search_fn()
            if img_url:
                print(f"  → {slug}: trying {source_name}... ", end="", flush=True)
                if download_image(img_url, dest):
                    size_kb = os.path.getsize(dest) // 1024
                    print(f"✓ ({size_kb}KB)")
                    return True
                else:
                    print("✗ (too small or failed)")
        except Exception as e:
            continue
        time.sleep(0.3)

    print(f"  ✗ {slug}: no image found")
    return False


def main():
    # Clear existing small placeholder images first
    print("Clearing placeholder images...\n")
    for slug in BUILDINGS:
        dest = os.path.join(PUBLIC_DIR, slug, "hero.jpg")
        if os.path.exists(dest) and os.path.getsize(dest) < MIN_IMAGE_SIZE:
            os.remove(dest)

    print(f"Fetching hero images for {len(BUILDINGS)} buildings...\n")

    success = 0
    failed = 0
    failed_slugs = []

    for slug, name in BUILDINGS.items():
        result = fetch_image_for_building(slug, name)
        if result:
            success += 1
        else:
            failed += 1
            failed_slugs.append(slug)
        time.sleep(1)

    print(f"\n{'='*50}")
    print(f"Done: {success} images downloaded, {failed} missing")
    if failed_slugs:
        print(f"\nMissing: {', '.join(failed_slugs)}")
        print("Add these manually to public/buildings/{slug}/hero.jpg")


if __name__ == "__main__":
    main()
