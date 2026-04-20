#!/bin/bash
# ============================================================
#  Ikhlas APK Downloader — Mac/Linux
#  Usage:  bash download-ikhlas.sh
# ============================================================

REPO="botuns/ff"
BRANCH="claude/donation-tracker-android-Z2fGH"
URL="https://raw.githubusercontent.com/$REPO/$BRANCH/IkhlasApp/ikhlas.apk"
OUTPUT="$HOME/Downloads/ikhlas.apk"

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

echo "  Downloading ikhlas.apk (~73MB) ..."

if [ -n "$GITHUB_TOKEN" ]; then
  curl -fL -H "Authorization: token $GITHUB_TOKEN" "$URL" -o "$OUTPUT" --progress-bar
else
  curl -fL "$URL" -o "$OUTPUT" --progress-bar
fi

if [ $? -ne 0 ]; then
  echo ""
  echo "  ERROR: Download failed."
  echo "  If the repo is private, re-run and enter your GitHub token."
  exit 1
fi

SIZE=$(du -sh "$OUTPUT" | cut -f1)
echo ""
echo "  ✓ ikhlas.apk downloaded ($SIZE)"
echo "  Saved to: $OUTPUT"
echo ""
echo "  To install on your Android phone:"
echo "   1. Connect phone via USB"
echo "   2. Copy ikhlas.apk to your phone"
echo "   3. Settings > Install unknown apps > Allow"
echo "   4. Tap the APK to install"
echo ""

open "$HOME/Downloads"
