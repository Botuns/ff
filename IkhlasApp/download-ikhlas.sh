#!/bin/bash
# ============================================================
#  Ikhlas APK Downloader & Assembler — Mac/Linux
#  Usage:  bash download-ikhlas.sh
# ============================================================

REPO="botuns/ff"
BRANCH="claude/donation-tracker-android-Z2fGH"
BASE_URL="https://raw.githubusercontent.com/$REPO/$BRANCH/IkhlasApp"
PARTS=("ikhlas-part-aa" "ikhlas-part-ab" "ikhlas-part-ac")
OUTPUT="$HOME/Downloads/ikhlas.apk"
TMP_DIR=$(mktemp -d)

echo ""
echo "  ┌────────────────────────────────────┐"
echo "  │  Ikhlas APK Downloader             │"
echo "  │  Jama'at Donation Tracker          │"
echo "  └────────────────────────────────────┘"
echo ""

# GitHub token if repo is private
if [ -z "$GITHUB_TOKEN" ]; then
  echo "  If your repo is private, enter your GitHub token."
  echo "  (Press Enter to skip — works if repo is public)"
  read -p "  GitHub Token: " GITHUB_TOKEN
fi

AUTH_HEADER=""
[ -n "$GITHUB_TOKEN" ] && AUTH_HEADER="-H \"Authorization: token $GITHUB_TOKEN\""

# Download parts
TOTAL=${#PARTS[@]}
for i in "${!PARTS[@]}"; do
  PART="${PARTS[$i]}"
  URL="$BASE_URL/$PART"
  DEST="$TMP_DIR/$PART"
  echo "  [$((i+1))/$TOTAL] Downloading $PART ..."

  if [ -n "$GITHUB_TOKEN" ]; then
    curl -fL -H "Authorization: token $GITHUB_TOKEN" "$URL" -o "$DEST"
  else
    curl -fL "$URL" -o "$DEST"
  fi

  if [ $? -ne 0 ]; then
    echo "  ERROR: Failed to download $PART"
    echo "  Check your token or make sure the repo is public."
    rm -rf "$TMP_DIR"
    exit 1
  fi

  SIZE=$(du -sh "$DEST" | cut -f1)
  echo "  ✓ $SIZE"
done

# Assemble
echo ""
echo "  Assembling APK ..."
cat "$TMP_DIR/ikhlas-part-aa" \
    "$TMP_DIR/ikhlas-part-ab" \
    "$TMP_DIR/ikhlas-part-ac" > "$OUTPUT"

rm -rf "$TMP_DIR"

SIZE=$(du -sh "$OUTPUT" | cut -f1)
echo "  ✓ ikhlas.apk ready ($SIZE)"
echo ""
echo "  Saved to: $OUTPUT"
echo ""
echo "  To install on your Android phone:"
echo "   1. Connect phone via USB"
echo "   2. Copy ikhlas.apk to your phone"
echo "   3. Settings > Install unknown apps > Allow"
echo "   4. Tap the APK to install"
echo ""

# Open Downloads folder
open "$HOME/Downloads"
