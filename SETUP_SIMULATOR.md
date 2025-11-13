# Setting Up iOS Simulator

## Problem: No iOS Simulators Available

If you see `== Devices ==` with no devices listed, it means no iOS simulators are installed.

## Solution 1: Install Simulators via Xcode (Recommended)

1. **Open Xcode**:
   ```bash
   open -a Xcode
   ```

2. **Wait for Xcode to fully load** (first time may take a few minutes)

3. **Install Simulators**:
   - Go to **Xcode → Settings → Platforms** (or **Xcode → Preferences → Components**)
   - Download an iOS Simulator (e.g., iOS 17.0 or latest available)
   - This may take several minutes to download

4. **Verify Simulator is installed**:
   ```bash
   xcrun simctl list devices available
   ```
   You should see devices listed

5. **Open Simulator**:
   ```bash
   open -a Simulator
   ```

6. **Start your app**:
   ```bash
   cd admin-app
   npm start
   ```
   Then press `i` in Expo CLI

## Solution 2: Use Expo Go on Physical Device (Alternative)

If you can't install simulators, use Expo Go on your iPhone:

1. **Install Expo Go** on your iPhone from the App Store

2. **Make sure backend is running**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Find your machine's IP address**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Example: `192.168.1.147`

4. **Update API URL** in `admin-app/config/api.js`:
   ```javascript
   export const API_URL = 'http://192.168.1.147:8000'; // Use your IP
   ```

5. **Start Expo**:
   ```bash
   cd admin-app
   npm start
   ```

6. **Scan QR code** with Expo Go app on your iPhone

7. **Make sure phone and computer are on same Wi-Fi network**

## Solution 3: Use Expo Web (Limited)

For quick testing, you can use Expo Web, but it has limited functionality:

1. **Install web dependencies**:
   ```bash
   cd admin-app
   npm install react-native-web
   ```

2. **Start Expo**:
   ```bash
   npm start
   ```

3. **Press `w`** to open in web browser

**Note**: Web support is limited and may not work perfectly. iOS Simulator or Expo Go on physical device is recommended.

## Quick Commands

### Check if simulators are installed:
```bash
xcrun simctl list devices available
```

### Check if Xcode is installed:
```bash
xcode-select -p
```

### Open Xcode:
```bash
open -a Xcode
```

### Open Simulator (after installing):
```bash
open -a Simulator
```

### List all available runtimes:
```bash
xcrun simctl list runtimes
```

## Troubleshooting

### "No iOS devices available in Simulator.app"
- **Cause**: No iOS simulators are installed
- **Fix**: Install simulators via Xcode (Solution 1)

### "Xcode Command Line Tools not installed"
- **Fix**: 
  ```bash
  xcode-select --install
  ```

### "Cannot find Xcode"
- **Fix**: Install Xcode from the App Store

### Simulator opens but app doesn't load
- **Fix**: 
  1. Make sure backend is running
  2. Check API URL in `admin-app/config/api.js`
  3. Verify Expo server is running
  4. Try reloading the app (press `r` in Expo CLI)

## Recommended Setup

1. **Install Xcode** from App Store (if not already installed)
2. **Open Xcode** and wait for it to initialize
3. **Download iOS Simulator** through Xcode → Settings → Platforms
4. **Open Simulator**: `open -a Simulator`
5. **Start backend**: `cd backend && npm run dev`
6. **Start Expo**: `cd admin-app && npm start`
7. **Press `i`** in Expo CLI to run on iOS Simulator

## Alternative: Use Expo Go on Physical Device

If you can't set up simulators:
1. Install Expo Go on your iPhone
2. Update API URL to your machine's IP address
3. Scan QR code with Expo Go
4. Make sure phone and computer are on same Wi-Fi network

This is actually easier for testing and provides a better mobile experience!

