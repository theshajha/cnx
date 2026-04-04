#!/bin/bash
cd /Users/shashankjha/Sites/theshajha/cnx

UA="User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
PUBLIC="public/buildings"
TMP="/tmp/building-photos-v2"
mkdir -p "$TMP"

NAMES=(pool lobby gym interior-1 common-area exterior)
RESULTS=""

download_verify() {
  local url="$1" output="$2"
  local tmp="${output}.tmp"
  curl -sL -H "$UA" "$url" -o "$tmp" 2>/dev/null
  if [ ! -f "$tmp" ] || [ ! -s "$tmp" ]; then
    rm -f "$tmp"; return 1
  fi
  local ftype=$(file -b "$tmp" 2>/dev/null)
  if echo "$ftype" | grep -qi "web/p\|webp"; then
    sips -s format jpeg "$tmp" --out "$output" >/dev/null 2>&1 && rm -f "$tmp"
  elif echo "$ftype" | grep -qi "jpeg\|JFIF"; then
    mv "$tmp" "$output"
  elif echo "$ftype" | grep -qi "png"; then
    sips -s format jpeg "$tmp" --out "$output" >/dev/null 2>&1 && rm -f "$tmp"
  else
    rm -f "$tmp"; return 1
  fi
  [ -f "$output" ] || return 1
  local sz=$(stat -f%z "$output" 2>/dev/null)
  [ "$sz" -gt 5000 ] && return 0
  rm -f "$output"; return 1
}

get_fazwaz_images() {
  local html="$1"
  grep -oE 'https://cdn\.fazwaz\.com/[^"'\'' ]+\.(jpg|jpeg|png|webp)' "$html" 2>/dev/null \
    | grep -i 'project/' \
    | grep -iv 'streetview\|logo\|icon\|map' \
    | sed 's|/[0-9]*x[0-9]*/|/0x0/|g' \
    | sort -u \
    | head -6
}

get_fazwaz_unit_images() {
  local html="$1"
  grep -oE 'https://cdn\.fazwaz\.com/[^"'\'' ]+\.(jpg|jpeg|png|webp)' "$html" 2>/dev/null \
    | grep -i 'unit/' \
    | grep -iv 'logo\|icon\|map' \
    | sed 's|/[0-9]*x[0-9]*/|/0x0/|g' \
    | sort -u \
    | head -4
}

get_ps_images() {
  local html="$1"
  grep -oE 'https://img2\.propertyscout\.co\.th/[^"'\'' ]*rs:fit:1920[^"'\'' ]*\.(webp|jpg)' "$html" 2>/dev/null \
    | sort -u \
    | head -6
}

process() {
  local slug="$1" name="$2"
  shift 2
  local dest="$PUBLIC/$slug"
  mkdir -p "$dest"
  echo "=== $name ($slug) ==="

  local all_urls=""
  for src in "$@"; do
    local f="/tmp/building-photos-v2/${src}"
    if [ -f "$f" ]; then
      local urls=""
      if echo "$src" | grep -q "^faz-"; then
        urls=$(get_fazwaz_images "$f")
        if [ -z "$urls" ] || [ "$(echo "$urls" | wc -l | tr -d ' ')" -lt 2 ]; then
          urls="$urls
$(get_fazwaz_unit_images "$f")"
        fi
      elif echo "$src" | grep -q "^ps-"; then
        urls=$(get_ps_images "$f")
      fi
      all_urls="$all_urls
$urls"
    fi
  done
  all_urls=$(echo "$all_urls" | grep -v '^$' | sort -u)
  
  local count=0 idx=0 files=""
  while IFS= read -r url; do
    [ -z "$url" ] && continue
    [ "$count" -ge 4 ] && break
    local pname="${NAMES[$idx]}"
    local out="$dest/${pname}.jpg"
    if download_verify "$url" "$out"; then
      count=$((count+1))
      files="$files ${pname}.jpg"
      echo "  OK: ${pname}.jpg"
    fi
    idx=$((idx+1))
  done <<< "$all_urls"
  echo "  Total: $count"
  RESULTS="$RESULTS
$slug|$count|$files"
}

echo "=== Fetching source pages ==="

# FazWaz pages
echo "Fetching FazWaz pages..."
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/chang-phueak/viengping-mansion" -o "$TMP/faz-viengping-mansion.html"
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/chang-phueak/huay-kaew-residence" -o "$TMP/faz-huay-kaew-residence.html"
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/chang-phueak/d-vieng-santitham" -o "$TMP/faz-dvieng-santitham.html"
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/chang-phueak/promt-condo" -o "$TMP/faz-promt-condo.html"
echo "  4/13..."
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/suthep/baan-thai-condo" -o "$TMP/faz-baan-thai-condo.html"
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/pa-daet/galae-thong-tower" -o "$TMP/faz-galare-thong-tower.html"
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/chang-phueak/view-doi-mansion" -o "$TMP/faz-view-doi-mansion.html"
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/haiya/smith-residence" -o "$TMP/faz-smith-residence.html"
echo "  8/13..."
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/chang-phueak/the-51-hometel" -o "$TMP/faz-the-51-hometel.html"
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/chang-phueak/nakornping-condo" -o "$TMP/faz-nakornping-condo.html"
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/pa-tan/serene-teak" -o "$TMP/faz-serene-teak.html"
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/suthep/srithana-condominium-2" -o "$TMP/faz-srithana-condo.html"
echo "  12/13..."
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/pa-daet/doi-ping-mansion" -o "$TMP/faz-doi-ping-mansion.html"
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/chang-phueak/pansook-the-urbania" -o "$TMP/faz-pansook-condo.html"
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/nong-pa-khrang/supalai-monte-2" -o "$TMP/faz-supalai-monte-2.html"
curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/mueang-chiang-mai/haiya/smith-suites" -o "$TMP/faz-smith-suites.html"
echo "All FazWaz pages fetched"

# Also fetch PropertyScout for buildings that had results
echo "Fetching PropertyScout pages..."
curl -sL -H "$UA" "https://propertyscout.co.th/en/chiang-mai/condo/dvieng-santitham" -o "$TMP/ps-dvieng-santitham.html"
curl -sL -H "$UA" "https://propertyscout.co.th/en/chiang-mai/condo/galare-thong-tower-chiang-mai" -o "$TMP/ps-galare-thong-tower.html"
curl -sL -H "$UA" "https://propertyscout.co.th/en/chiang-mai/condo/supalai-monte-2" -o "$TMP/ps-supalai-monte-2.html"
curl -sL -H "$UA" "https://propertyscout.co.th/en/chiang-mai/condo/srithana-condominium-2" -o "$TMP/ps-srithana-condo.html"
curl -sL -H "$UA" "https://propertyscout.co.th/en/chiang-mai/condo/nakornping-condominium" -o "$TMP/ps-nakornping-condo.html"
curl -sL -H "$UA" "https://propertyscout.co.th/en/chiang-mai/condo/doi-ping-mansion" -o "$TMP/ps-doi-ping-mansion.html"
curl -sL -H "$UA" "https://propertyscout.co.th/en/chiang-mai/condo/pansook-the-urbania" -o "$TMP/ps-pansook-condo.html"
curl -sL -H "$UA" "https://propertyscout.co.th/en/chiang-mai/condo/baan-thai-condo" -o "$TMP/ps-baan-thai-condo.html"
echo "PropertyScout pages fetched"

# Check what's available
echo ""
echo "=== Image counts per source ==="
for f in "$TMP"/faz-*.html; do
  slug=$(basename "$f" .html | sed 's/^faz-//')
  proj=$(grep -oE 'https://cdn\.fazwaz\.com/[^"'\'' ]+\.(jpg|jpeg|png|webp)' "$f" 2>/dev/null | grep -i 'project/' | grep -iv 'streetview\|logo\|icon\|map' | sed 's|/[0-9]*x[0-9]*/|/0x0/|g' | sort -u | wc -l | tr -d ' ')
  unit=$(grep -oE 'https://cdn\.fazwaz\.com/[^"'\'' ]+\.(jpg|jpeg|png|webp)' "$f" 2>/dev/null | grep -i 'unit/' | grep -iv 'logo\|icon\|map' | sed 's|/[0-9]*x[0-9]*/|/0x0/|g' | sort -u | wc -l | tr -d ' ')
  echo "  $slug: $proj project + $unit unit images"
done

echo ""
echo "=== Downloading photos ==="

process viengping-mansion "Viengping Mansion" faz-viengping-mansion.html
process huay-kaew-residence "Huay Kaew Residence" faz-huay-kaew-residence.html
process dvieng-santitham "D'Vieng Santitham" faz-dvieng-santitham.html ps-dvieng-santitham.html
process promt-condo "Promt Condo" faz-promt-condo.html
process baan-thai-condo "Baan Thai Condo" faz-baan-thai-condo.html ps-baan-thai-condo.html
process galare-thong-tower "Galare Thong Tower" faz-galare-thong-tower.html ps-galare-thong-tower.html
process view-doi-mansion "View Doi Mansion" faz-view-doi-mansion.html
process smith-residence "Smith Residence" faz-smith-residence.html
process the-51-hometel "The 51 Hometel" faz-the-51-hometel.html
process nakornping-condo "Nakornping Condo" faz-nakornping-condo.html ps-nakornping-condo.html
process serene-teak "Serene Teak" faz-serene-teak.html
process srithana-condo "Srithana Condo" faz-srithana-condo.html ps-srithana-condo.html
process doi-ping-mansion "Doi Ping Mansion" faz-doi-ping-mansion.html ps-doi-ping-mansion.html
process pansook-condo "Pansook Condo" faz-pansook-condo.html ps-pansook-condo.html
process supalai-monte-2 "Supalai Monte 2" faz-supalai-monte-2.html ps-supalai-monte-2.html
process smith-suites "Smith Suites" faz-smith-suites.html

echo ""
echo "=== FINAL SUMMARY ==="
echo "$RESULTS" | grep -v '^$' | while IFS='|' read slug count files; do
  echo "$slug: $count photos -$files"
done
