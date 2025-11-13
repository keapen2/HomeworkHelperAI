# Quick Fixes for Current Issues

## Issues Found

1. ✅ **AsyncStorage version mismatch** - FIXED
   - Updated to version 2.2.0 (matches Expo SDK 54)

2. ⚠️ **iOS Simulator not available**
   - Error: "No iOS devices available in Simulator.app"
   - Solution: Open iOS Simulator manually first

3. ⚠️ **Web bundling errors**
   - These can be ignored - we're focusing on iOS Simulator
   - Web support requires additional setup (not needed for MVP)

## How to Run on iOS Simulator

### Option 1: Open Simulator First (Recommended)

1. **Open iOS Simulator manually**:
   ```bash
   open -a Simulator
   ```
   
   Or open Xcode → Open Developer Tool → Simulator

2. **Wait for simulator to fully load**

3. **Start Expo**:
   ```bash
   cd admin-app
   npm start
   ```

4. **Press `i` in the Expo CLI** to run on iOS Simulator

### Option 2: Use Expo Go on Physical Device

1. **Make sure backend is running**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Find your machine's IP address**:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Example output: inet 192.168.1.147
   ```

3. **Update API URL** in `admin-app/config/api.js`:
   ```javascript
   export const API_URL = 'http://192.168.1.147:8000'; // Use your IP address
   ```

4. **Start Expo**:
   ```bash
   cd admin-app
   npm start
   ```

5. **Scan QR code with Expo Go app** on your phone

6. **Make sure your phone and computer are on the same Wi-Fi network**

## Troubleshooting

### iOS Simulator Not Opening

1. **Check if Xcode is installed**:
   ```bash
   xcode-select --version
   ```

2. **Install Xcode Command Line Tools if needed**:
   ```bash
   xcode-select --install
   ```

3. **Open Simulator manually**:
   - Open Xcode
   - Go to Xcode → Open Developer Tool → Simulator
   - Or use: `open -a Simulator`

### QR Code Not Working

1. **Make sure Expo Go is installed** on your phone
   - iOS: Download from App Store
   - Android: Download from Play Store

2. **Make sure phone and computer are on same network**

3. **Check firewall settings** - allow connections on port 8082 (or 8081)

4. **Try using your machine's IP address** in the Expo URL instead of scanning QR code

### Backend Connection Issues

1. **Verify backend is running**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **For physical device, update API URL**:
   - Change `localhost` to your machine's IP address
   - Example: `http://192.168.1.147:8000`

3. **Check CORS settings** in backend/server.js (should already be enabled)

## Next Steps

1. **Open iOS Simulator** manually first
2. **Start Expo** with `npm start`
3. **Press `i`** to run on iOS Simulator
4. **Test the app**:
   - Login screen should appear
   - Login with: `admin@homework.com` / `admin123`
   - Dashboard should appear after login

## Testing Checklist

- [ ] iOS Simulator is open
- [ ] Backend server is running on port 8000
- [ ] Expo server is running
- [ ] App loads in iOS Simulator
- [ ] Login screen appears
- [ ] Can login with admin credentials
- [ ] Dashboard appears after login
- [ ] Usage Trends tab shows data
- [ ] System Dashboard tab shows chart and questions

