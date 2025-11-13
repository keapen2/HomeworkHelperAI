#!/bin/bash

# Script to start iOS Simulator and Expo

echo "🚀 Starting iOS Simulator and Expo..."

# Check if Xcode is installed
if ! command -v xcrun &> /dev/null; then
    echo "❌ Xcode Command Line Tools not found"
    echo "Please install Xcode from the App Store"
    exit 1
fi

# Check if simulators are available
SIMULATORS=$(xcrun simctl list devices available | grep -i "iphone" | head -1)
if [ -z "$SIMULATORS" ]; then
    echo "⚠️  No iOS simulators found"
    echo ""
    echo "Please install iOS simulators:"
    echo "1. Open Xcode: open -a Xcode"
    echo "2. Go to Xcode → Settings → Platforms"
    echo "3. Download an iOS Simulator"
    echo ""
    echo "Or use Expo Go on your physical device instead!"
    echo ""
    read -p "Press Enter to continue anyway (will try to open Simulator)..."
fi

# Try to open Simulator
echo "📱 Opening iOS Simulator..."
open -a Simulator 2>/dev/null || {
    echo "❌ Could not open Simulator"
    echo "Please open Simulator manually: open -a Simulator"
    exit 1
}

# Wait a bit for Simulator to start
echo "⏳ Waiting for Simulator to start..."
sleep 3

# Start Expo
echo "🎉 Starting Expo..."
npm start

