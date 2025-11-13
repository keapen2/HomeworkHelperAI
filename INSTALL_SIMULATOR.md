# How to Install iOS Simulator

## Step 1: Open Xcode

```bash
open -a Xcode
```

## Step 2: Install iOS Simulator

1. Wait for Xcode to fully load (first time may take a few minutes)
2. Go to **Xcode → Settings → Platforms** (or **Xcode → Preferences → Components** in older versions)
3. Click the **+** button to add a platform
4. Download **iOS 17.0** or the latest available version
5. Wait for download to complete (this may take 10-20 minutes)

## Step 3: Verify Installation

```bash
xcrun simctl list devices available
```

You should see devices listed.

## Step 4: Open Simulator

```bash
open -a Simulator
```

## Step 5: Start Your App

```bash
cd admin-app
npm start
```

Then press `i` in Expo CLI.

---

## Alternative: Use Expo Go on Physical Device (Easier!)

If installing simulators takes too long, use Expo Go on your iPhone instead:

### Step 1: Install Expo Go on iPhone

Download **Expo Go** from the App Store.

### Step 2: Start Backend

```bash
cd backend
npm run dev
```

### Step 3: Find Your IP Address

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Example output: `inet 192.168.1.147`

### Step 4: Update API URL

Edit `admin-app/config/api.js`:

```javascript
export const API_URL = 'http://192.168.1.147:8000'; // Use your IP
```

### Step 5: Start Expo

```bash
cd admin-app
npm start
```

### Step 6: Scan QR Code

1. Open **Expo Go** on your iPhone
2. Scan the QR code from the terminal
3. Make sure your phone and computer are on the **same Wi-Fi network**

This is actually easier and provides a better mobile experience!

