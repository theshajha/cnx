#!/bin/bash
set -euo pipefail

BASE_DIR="/Users/shashankjha/Sites/theshajha/cnx"
PUBLIC_DIR="$BASE_DIR/public/buildings"
TMP_DIR="/tmp/building-photos"
UA="User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
RESULTS_FILE="$TMP_DIR/results.txt"

mkdir -p "$TMP_DIR"
> "$RESULTS_FILE"

download_and_verify() {
  local url="$1"
  local output="$2"
  local tmp_file="${output}.tmp"

  curl -sL -H "$UA" "$url" -o "$tmp_file" 2>/dev/null

  local ftype
  ftype=$(file -b "$tmp_file" 2>/dev/null || echo "unknown")

  if echo "$ftype" | grep -qi "web/p\|webp"; then
    sips -s format jpeg "$tmp_file" --out "$output" >/dev/null 2>&1
    rm -f "$tmp_file"
  elif echo "$ftype" | grep -qi "jpeg\|jpg\|JFIF"; then
    mv "$tmp_file" "$output"
  elif echo "$ftype" | grep -qi "png"; then
    sips -s format jpeg "$tmp_file" --out "$output" >/dev/null 2>&1
    rm -f "$tmp_file"
  else
    rm -f "$tmp_file"
    return 1
  fi

  ftype=$(file -b "$output" 2>/dev/null || echo "unknown")
  if echo "$ftype" | grep -qi "jpeg\|jpg\|JFIF"; then
    local size
    size=$(stat -f%z "$output" 2>/dev/null || echo "0")
    if [ "$size" -gt 5000 ]; then
      return 0
    fi
  fi
  rm -f "$output"
  return 1
}

fetch_propertyscout() {
  local slug="$1"
  local ps_slug="$2"
  local dest_dir="$PUBLIC_DIR/$slug"
  local page_file="$TMP_DIR/ps-${slug}.html"

  echo "  [PropertyScout] Fetching $ps_slug..."
  curl -sL -H "$UA" "https://propertyscout.co.th/en/chiang-mai/condo/${ps_slug}/" -o "$page_file" 2>/dev/null

  local urls
  urls=$(grep -oE 'https://img2\.propertyscout\.co\.th/[^"'\'']*rs:fit:1920[^"'\'']*\.(webp|jpg|jpeg)' "$page_file" 2>/dev/null | sort -u | head -6)

  if [ -z "$urls" ]; then
    urls=$(grep -oE 'https://img2\.propertyscout\.co\.th/[^"'\'']*rs:fit:1[024][0-9][0-9][^"'\'']*\.(webp|jpg|jpeg)' "$page_file" 2>/dev/null | sort -u | head -6)
  fi

  echo "$urls"
}

fetch_fazwaz() {
  local slug="$1"
  local faz_path="$2"
  local page_file="$TMP_DIR/faz-${slug}.html"

  echo "  [FazWaz] Fetching $faz_path..."
  curl -sL -H "$UA" "https://www.fazwaz.co.th/en/projects/thailand/chiang-mai/${faz_path}" -o "$page_file" 2>/dev/null

  grep -oE 'https://cdn\.fazwaz\.com/[^"'\'']*\.(jpg|jpeg|png|webp)' "$page_file" 2>/dev/null | grep -v 'logo\|icon\|region\|location\|sub-place\|sub-district' | sort -u | head -8
}

fetch_chiangmailocator() {
  local slug="$1"
  local loc_path="$2"
  local page_file="$TMP_DIR/cml-${slug}.html"

  echo "  [CMLocator] Fetching $loc_path..."
  curl -sL -H "$UA" "https://www.chiangmailocator.com/${loc_path}" -o "$page_file" 2>/dev/null

  grep -oE 'https://[^"'\'']*chiangmailocator[^"'\'']*\.(jpg|jpeg|png|webp)' "$page_file" 2>/dev/null | grep -v 'logo\|icon\|thumb' | sort -u | head -8
}

PHOTO_NAMES=("pool" "lobby" "gym" "interior-1" "common-area" "exterior" "garden" "interior-2" "fitness" "entrance")

process_building() {
  local slug="$1"
  local name="$2"
  shift 2
  local dest_dir="$PUBLIC_DIR/$slug"
  mkdir -p "$dest_dir"

  echo "=== Processing: $name ($slug) ==="

  local all_urls=""
  local count=0

  for source_func_and_args in "$@"; do
    local urls
    urls=$(eval "$source_func_and_args" 2>/dev/null || true)
    if [ -n "$urls" ]; then
      all_urls="$all_urls
$urls"
    fi
  done

  all_urls=$(echo "$all_urls" | grep -v '^$' | sort -u)

  if [ -z "$all_urls" ]; then
    echo "  WARNING: No image URLs found for $name"
    echo "$slug: 0 photos (no URLs found)" >> "$RESULTS_FILE"
    return
  fi

  local downloaded_files=""
  local idx=0

  while IFS= read -r url; do
    [ -z "$url" ] && continue
    [ "$count" -ge 4 ] && break

    local photo_name="${PHOTO_NAMES[$idx]}"
    local output="$dest_dir/${photo_name}.jpg"

    if [ -f "$output" ]; then
      idx=$((idx + 1))
      photo_name="${PHOTO_NAMES[$idx]}"
      output="$dest_dir/${photo_name}.jpg"
    fi

    echo "  Downloading ${photo_name}.jpg..."
    if download_and_verify "$url" "$output"; then
      count=$((count + 1))
      downloaded_files="$downloaded_files ${photo_name}.jpg"
      echo "    OK: ${photo_name}.jpg ($(stat -f%z "$output") bytes)"
    else
      echo "    FAILED: ${photo_name}.jpg"
    fi
    idx=$((idx + 1))
  done <<< "$all_urls"

  echo "  Total downloaded: $count photos"
  echo "$slug: $count photos -$downloaded_files" >> "$RESULTS_FILE"
}

echo "Starting photo downloads for 16 Old City buildings..."
echo ""

# 1. Viengping Mansion
process_building "viengping-mansion" "Viengping Mansion" \
  "fetch_propertyscout viengping-mansion viengping-mansion"

# 2. Huay Kaew Residence
process_building "huay-kaew-residence" "Huay Kaew Residence" \
  "fetch_propertyscout huay-kaew-residence huay-kaew-residence"

# 3. D'Vieng Santitham
process_building "dvieng-santitham" "D'Vieng Santitham" \
  "fetch_propertyscout dvieng-santitham dvieng-santitham"

# 4. Promt Condo
process_building "promt-condo" "Promt Condo" \
  "fetch_propertyscout promt-condo promt-condo"

# 5. Baan Thai Condo
process_building "baan-thai-condo" "Baan Thai Condo" \
  "fetch_propertyscout baan-thai-condo baan-thai-condo"

# 6. Galare Thong Tower
process_building "galare-thong-tower" "Galare Thong Tower" \
  "fetch_propertyscout galare-thong-tower galare-thong-tower-chiang-mai"

# 7. View Doi Mansion
process_building "view-doi-mansion" "View Doi Mansion" \
  "fetch_propertyscout view-doi-mansion view-doi-mansion"

# 8. Smith Residence
process_building "smith-residence" "Smith Residence" \
  "fetch_propertyscout smith-residence smith-residence"

# 9. The 51 Hometel
process_building "the-51-hometel" "The 51 Hometel" \
  "fetch_propertyscout the-51-hometel the-51-hometel"

# 10. Nakornping Condo
process_building "nakornping-condo" "Nakornping Condo" \
  "fetch_propertyscout nakornping-condo nakornping-condo"

# 11. Serene Teak
process_building "serene-teak" "Serene Teak" \
  "fetch_propertyscout serene-teak serene-teak"

# 12. Srithana Condo
process_building "srithana-condo" "Srithana Condo" \
  "fetch_propertyscout srithana-condo srithana-condo"

# 13. Doi Ping Mansion
process_building "doi-ping-mansion" "Doi Ping Mansion" \
  "fetch_propertyscout doi-ping-mansion doi-ping-mansion"

# 14. Pansook Condo
process_building "pansook-condo" "Pansook Condo" \
  "fetch_propertyscout pansook-condo pansook-condo"

# 15. Supalai Monte 2
process_building "supalai-monte-2" "Supalai Monte 2" \
  "fetch_propertyscout supalai-monte-2 supalai-monte-2"

# 16. Smith Suites
process_building "smith-suites" "Smith Suites" \
  "fetch_propertyscout smith-suites smith-suites"

echo ""
echo "=== SUMMARY ==="
cat "$RESULTS_FILE"
