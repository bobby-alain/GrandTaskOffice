#!/bin/bash
# Start the Expo frontend

echo "========================================="
echo "Starting Grand Task Office — Expo Frontend"
echo "========================================="
echo ""
echo "Frontend will run on: http://localhost:8081"
echo "Press Ctrl+C to stop"
echo ""

cd "$(dirname "$0")/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start Expo web dev server
npx expo start --web
