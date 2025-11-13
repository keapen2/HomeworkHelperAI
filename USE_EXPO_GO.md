# Using Expo Go on Physical Device (Easiest Method!)

## ✅ Your Setup is Ready!

Your IP address is: **192.168.1.147**

The API URL has been configured to use your IP address for Expo Go.

## Step-by-Step Instructions

### Step 1: Install Expo Go on Your iPhone

1. Open the **App Store** on your iPhone
2. Search for **"Expo Go"**
3. Install the app

### Step 2: Start Backend Server

Open a terminal and run:

```bash
cd backend
npm run dev
```

You should see:
```
Server is running on port 8000
MongoDB connected successfully
```

### Step 3: Start Expo

Open another terminal and run:

```bash
cd admin-app
npm start
```

You should see a QR code in the terminal.

### Step 4: Connect Your Phone

1. Make sure your **iPhone and computer are on the same Wi-Fi network**
2. Open **Expo Go** app on your iPhone
3. Tap **"Scan QR Code"**
4. Scan the QR code from the terminal

### Step 5: Test the App

1. The app should load on your iPhone
2. You should see the login screen
3. Login with:
   - Email: `admin@homework.com`
   - Password: `admin123`

## Troubleshooting

### "Unable to connect to server"

1. **Check backend is running**:
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"OK","message":"HomeworkHelper AI API is running"}`

2. **Verify IP address**:
   - Check your IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Make sure it matches the IP in `admin-app/config/api.js`

3. **Check firewall**:
   - Make sure your firewall allows connections on port 8000
   - On Mac: System Settings → Network → Firewall

4. **Verify same Wi-Fi network**:
   - Both your computer and iPhone must be on the same Wi-Fi network

### "Network Error" or "Connection Refused"

1. **Backend not running**: Make sure backend server is running
2. **Wrong IP address**: Update IP in `admin-app/config/api.js`
3. **Firewall blocking**: Check firewall settings
4. **Wrong network**: Make sure phone and computer are on same Wi-Fi

### App loads but shows errors

1. **Check backend logs**: Look for errors in backend terminal
2. **Check MongoDB**: Make sure MongoDB is connected
3. **Check Firebase**: Verify Firebase config is correct
4. **Check console**: Look at Expo CLI logs for errors

## Switching Between Simulator and Physical Device

### For iOS Simulator:
Edit `admin-app/config/api.js`:
```javascript
const USE_LOCALHOST = true; // Use localhost for simulator
```

### For Expo Go on Physical Device:
Edit `admin-app/config/api.js`:
```javascript
const USE_LOCALHOST = false; // Use IP address for physical device
const YOUR_IP = '192.168.1.147'; // Your machine's IP
```

## Testing Checklist

- [ ] Expo Go installed on iPhone
- [ ] Backend server is running
- [ ] Expo server is running
- [ ] Phone and computer on same Wi-Fi network
- [ ] API URL is set to your IP address (192.168.1.147)
- [ ] QR code scanned successfully
- [ ] App loads on iPhone
- [ ] Login screen appears
- [ ] Can login with admin credentials
- [ ] Dashboard appears after login

## Why Use Expo Go?

✅ **Easier setup** - No need to install iOS Simulators
✅ **Better performance** - Runs on actual device
✅ **Real mobile experience** - Test on actual iPhone
✅ **Faster** - No need to wait for simulator to boot
✅ **More accurate** - Real device behavior

## Next Steps

1. **Start backend**: `cd backend && npm run dev`
2. **Start Expo**: `cd admin-app && npm start`
3. **Scan QR code** with Expo Go on your iPhone
4. **Test the app** - login and verify dashboard works

Enjoy testing your app on your iPhone! 🎉

