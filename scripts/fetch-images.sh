#!/bin/bash
# Fetch hero images for CNX Cribs buildings
# Uses curl to download from known listing site URLs and Google Places

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC_DIR="$BASE_DIR/public/buildings"
MIN_SIZE=30000  # 30KB minimum

download_if_good() {
    local url="$1"
    local dest="$2"
    local tmp="${dest}.tmp"

    curl -sL -o "$tmp" -H "User-Agent: Mozilla/5.0" --max-time 10 "$url" 2>/dev/null

    if [ -f "$tmp" ]; then
        size=$(wc -c < "$tmp" | tr -d ' ')
        if [ "$size" -gt "$MIN_SIZE" ]; then
            mv "$tmp" "$dest"
            echo "  ✓ $(basename $(dirname $dest)): $(( size / 1024 ))KB from $3"
            return 0
        fi
        rm -f "$tmp"
    fi
    return 1
}

fetch_from_perfecthomes() {
    local slug="$1"
    local name="$2"
    local dest="$PUBLIC_DIR/$slug/hero.jpg"

    # Skip if already have good image
    if [ -f "$dest" ] && [ "$(wc -c < "$dest" | tr -d ' ')" -gt "$MIN_SIZE" ]; then
        echo "  ✓ $slug: already has image"
        return 0
    fi

    mkdir -p "$PUBLIC_DIR/$slug"

    # Try perfecthomes.co.th project pages (they have good images)
    local ph_slug=$(echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')
    local ph_url="https://perfecthomes.co.th/wp-content/uploads/"

    # Try Booking.com search for og:image
    local booking_html=$(curl -sL -H "User-Agent: Mozilla/5.0" \
        "https://www.booking.com/searchresults.en-gb.html?ss=$(echo "$name" | sed 's/ /+/g')" \
        --max-time 10 2>/dev/null)

    local og_img=$(echo "$booking_html" | grep -o 'property="og:image" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
    if [ -n "$og_img" ]; then
        download_if_good "$og_img" "$dest" "Booking.com" && return 0
    fi

    # Try Agoda
    local agoda_html=$(curl -sL -H "User-Agent: Mozilla/5.0" \
        "https://www.agoda.com/search?searchText=$(echo "$name" | sed 's/ /+/g')" \
        --max-time 10 2>/dev/null)

    og_img=$(echo "$agoda_html" | grep -o 'property="og:image" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
    if [ -n "$og_img" ]; then
        download_if_good "$og_img" "$dest" "Agoda" && return 0
    fi

    # Try Google Places photo via search
    local google_html=$(curl -sL -H "User-Agent: Mozilla/5.0" \
        "https://www.google.com/search?q=$(echo "$name exterior building" | sed 's/ /+/g')&tbm=isch&tbs=isz:l" \
        --max-time 10 2>/dev/null)

    # Extract first non-google image URL
    local img_url=$(echo "$google_html" | grep -oE 'https?://[^"'"'"'\\]+\.(jpg|jpeg|png|webp)' | \
        grep -v 'google\|gstatic\|googleapis\|favicon\|icon\|logo' | head -1)

    if [ -n "$img_url" ]; then
        download_if_good "$img_url" "$dest" "Google" && return 0
    fi

    echo "  ✗ $slug: no image found"
    return 1
}

echo "Fetching hero images for CNX Cribs buildings..."
echo ""

SUCCESS=0
FAILED=0

# Clear small placeholder images first
for dir in "$PUBLIC_DIR"/*/; do
    slug=$(basename "$dir")
    hero="$dir/hero.jpg"
    if [ -f "$hero" ]; then
        size=$(wc -c < "$hero" | tr -d ' ')
        if [ "$size" -lt "$MIN_SIZE" ]; then
            rm "$hero"
        fi
    fi
done

# Building list: slug|search name
BUILDINGS=(
    "punna-nimman|Punna Residence Nimman Chiang Mai"
    "yantarasri-nimman|Yantarasri at Nimman Chiang Mai"
    "d-condo-nim|dcondo nim Chiang Mai"
    "hillside-3|Hillside 3 Condominium Chiang Mai"
    "hillside-4|Hillside 4 Condominium Chiang Mai"
    "hillside-2|Hillside 2 Condominium Chiang Mai"
    "the-nimmana|The Nimmana Condominium Chiang Mai"
    "the-unique-nimman|The Unique at Nimman Chiang Mai"
    "the-unique-nimman-2|The Unique at Nimman 2 Chiang Mai"
    "liv-nimman|Liv Nimman Condominium Chiang Mai"
    "my-hip|My Hip Condo Chiang Mai"
    "s-condominium|S Condominium Nimman Chiang Mai"
    "the-siri|The Siri Condominium Chiang Mai"
    "palm-springs-nimman|Palm Springs Nimman Condominium Chiang Mai"
    "the-empire-nimman|The Empire Nimman Chiang Mai"
    "nivas-chiangmai|Nivas Chiangmai"
    "green-hill-place|Green Hill Place Chiang Mai"
    "the-bliss|The Bliss Chiang Mai"
    "the-mirror|The Mirror Chiang Mai apartment"
    "mountain-view|Mountain View Condominium Chiang Mai"
    "trams-1|Trams 1 Condominium Chiang Mai"
    "one-plus-huay-kaew|One Plus Huay Kaew Chiang Mai"
    "the-cosy-hk|The Cosy Huay Kaew Chiang Mai"
    "galare-thong-tower|Galare Thong Tower Chiang Mai"
    "viengping-mansion|Viengping Mansion Chiang Mai"
    "smith-residence|Smith Residence Chiang Mai"
    "smith-suites|Smith Suites Chiang Mai"
    "view-doi-mansion|View Doi Mansion Chiang Mai"
    "dvieng-santitham|dVieng Santitham Chiang Mai"
    "nakornping-condo|Nakornping Condominium Chiang Mai"
    "huay-kaew-residence|Huay Kaew Residence Chiang Mai"
    "srithana-condo|Srithana Condominium Chiang Mai"
    "supalai-monte-2|Supalai Monte 2 Chiang Mai"
    "promt-condo|Promt Condominium Chiang Mai"
    "doi-ping-mansion|Doi Ping Mansion Chiang Mai"
    "serene-teak|Serene Teak Apartment Chiang Mai"
    "pansook-condo|Pansook Condo Chiang Mai"
    "the-51-hometel|The 51 Hometel Chiang Mai"
    "baan-thai-condo|Baan Thai Condominium Chiang Mai"
)

for entry in "${BUILDINGS[@]}"; do
    IFS='|' read -r slug name <<< "$entry"
    fetch_from_perfecthomes "$slug" "$name"
    sleep 1
done

echo ""
echo "Done. Check public/buildings/*/hero.jpg for results."
