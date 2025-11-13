# Quick Start Guide - Fixing Current Errors

## ✅ Fixed Issues

1. **AsyncStorage version** - Updated to 2.2.0 ✅
2. **Package versions** - All packages now match Expo SDK 54 ✅
3. **Type errors** - Fixed PieChart paddingLeft type error ✅

## ⚠️ Current Issues & Solutions

### Issue 1: iOS Simulator Not Available

**Error**: `CommandError: No iOS devices available in Simulator.app`

**Solution**:
1. Open iOS Simulator manually first:
   ```bash
   open -a Simulator
   ```
2. Wait for simulator to fully load
3. Then start Expo:
   ```bash
   npm start
   ```
4. Press `i` in Expo CLI to run on iOS Simulator

**OR** use the new script:
```bash
npm run ios:open
```
This will automatically open the simulator and start Expo.

### Issue 2: Web Bundling Errors

**Error**: `Unable to resolve "react-native-web/dist/exports/..."`

**Solution**: 
- **IGNORE THESE ERRORS** - They're expected since we haven't configured web support
- Web errors won't affect iOS Simulator or Expo Go
- Focus on iOS Simulator for testing

### Issue 3: Errors When Scanning QR Code

If you're scanning the QR code with Expo Go on a physical device:

1. **Make sure backend is running**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Find your machine's IP address**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Example output: `inet 192.168.1.147`

3. **Update API URL** in `admin-app/config/api.js`:
   ```javascript
   export const API_URL = 'http://192.168.1.147:8000'; // Use your IP
   ```

4. **Make sure phone and computer are on same Wi-Fi network**

5. **Check firewall** - allow connections on port 8000

## Step-by-Step Setup

### For iOS Simulator (Recommended)

1. **Open iOS Simulator**:
   ```bash
   open -a Simulator
   ```

2. **Start backend** (in a separate terminal):
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Expo** (in admin-app directory):
   ```bash
   cd admin-app
   npm start
   ```

4. **Press `i`** in Expo CLI to run on iOS Simulator

5. **Test the app**:
   - Login screen should appear
   - Login with: `admin@homework.com` / `admin123`
   - Dashboard should appear after login

### For Physical Device (Expo Go)

1. **Start backend** (in a separate terminal):
   ```bash
   cd backend
   npm run dev
   ```

2. **Find your IP address**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

3. **Update API URL** in `admin-app/config/api.js`:
   ```javascript
   export const API_URL = 'http://YOUR_IP_ADDRESS:8000';
   ```

4. **Start Expo**:
   ```bash
   cd admin-app
   npm start
   ```

5. **Scan QR code** with Expo Go app on your phone

6. **Make sure phone and computer are on same Wi-Fi network**

## Troubleshooting

### Backend Connection Issues

1. **Verify backend is running**:
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"OK","message":"HomeworkHelper AI API is running"}`

2. **Check if MongoDB is connected**:
   - Look for "MongoDB connected successfully" in backend logs

3. **Check if database is seeded**:
   ```bash
   cd backend
   npm run seed
   ```

### Firebase Authentication Issues

1. **Verify Firebase config** in `admin-app/config/firebase.js`
2. **Check Email/Password authentication is enabled** in Firebase Console
3. **Verify admin user exists** in Firebase Console → Authentication → Users
4. **Create admin user if needed**:
   - Email: `admin@homework.com`
   - Password: `admin123`

### Network Issues

1. **For iOS Simulator**: Use `http://localhost:8000`
2. **For physical device**: Use your machine's IP address (e.g., `http://192.168.1.147:8000`)
3. **Check firewall settings** - allow connections on port 8000
4. **Verify phone and computer are on same Wi-Fi network**

## Testing Checklist

- [ ] iOS Simulator is open (or Expo Go is installed on phone)
- [ ] Backend server is running on port 8000
- [ ] MongoDB is connected and seeded
- [ ] Firebase is configured correctly
- [ ] Admin user exists in Firebase
- [ ] Expo server is running
- [ ] App loads in iOS Simulator (or Expo Go)
- [ ] Login screen appears
- [ ] Can login with admin credentials
- [ ] Dashboard appears after login
- [ ] Usage Trends tab shows data
- [ ] System Dashboard tab shows chart and questions

## Common Errors & Fixes

### "No iOS devices available in Simulator.app"
- **Fix**: Open Simulator manually first: `open -a Simulator`

### "Unable to resolve react-native-web"
- **Fix**: Ignore - this is expected for web support (not configured)

### "Network Error" or "Connection Refused"
- **Fix**: 
  - Verify backend is running
  - Check API URL is correct
  - For physical device, use IP address instead of localhost
  - Check firewall settings

### "Firebase Auth Error"
- **Fix**: 
  - Verify Firebase config is correct
  - Check Email/Password authentication is enabled
  - Verify admin user exists in Firebase Console

### "MongoDB connection error"
- **Fix**: 
  - Check MongoDB Atlas connection string
  - Verify IP is whitelisted in MongoDB Atlas
  - Check database user credentials

## Next Steps

1. **Open iOS Simulator** manually
2. **Start backend server**
3. **Start Expo** and press `i` for iOS Simulator
4. **Test the app** - login and verify dashboard works
5. **If using physical device**, update API URL to your IP address

For more details, see `FIXES.md` or `README.md`.

