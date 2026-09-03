#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Grand Task Office — iOS Simulator"
echo ""

if [ ! -d "/Applications/Xcode.app" ]; then
  echo "Xcode is not installed in /Applications."
  echo "Install Xcode from the Mac App Store, open it once, and install an iOS Simulator runtime."
  exit 1
fi

if ! xcrun --find simctl >/dev/null 2>&1; then
  echo "The full Xcode developer tools are not active."
  echo "In Xcode, open Settings > Locations and select the newest Command Line Tools version."
  exit 1
fi

echo "Starting Flask on http://localhost:5001 ..."
"$PROJECT_DIR/start-backend.sh" &
BACKEND_PID=$!
trap 'kill "$BACKEND_PID" 2>/dev/null || true' EXIT INT TERM

sleep 2
echo "Starting Expo and opening the most recently used iOS Simulator ..."
cd "$PROJECT_DIR/frontend"
EXPO_PUBLIC_API_URL="http://127.0.0.1:5001" npx expo start --ios
