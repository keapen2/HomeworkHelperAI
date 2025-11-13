# Troubleshooting Guide - Fixed Issues

## Issues Fixed

### 1. Firebase Auth Persistence Warning
**Issue**: Firebase Auth was not persisting between sessions
**Fix**: 
- Installed `@react-native-async-storage/async-storage`
- Updated Firebase initialization to use `initializeAuth` with `getReactNativePersistence(ReactNativeAsyncStorage)`

### 2. Package Version Mismatches
**Issue**: Package versions didn't match Expo's expected versions
**Fix**: Updated packages to match Expo SDK 54:
- `react-native-gesture-handler@~2.28.0`
- `react-native-screens@~4.16.0`
- `react-native-svg@15.12.1`

### 3. Type Error in PieChart
**Issue**: `TypeError: expected dynamic type 'boolean', but had type 'string'`
**Fix**: Changed `paddingLeft="15"` to `paddingLeft={15}` in SystemDashboardScreen

### 4. Firebase Initialization
**Issue**: Firebase might fail to initialize if already initialized
**Fix**: Added check for existing Firebase app instance before initializing

### 5. Navigation Loading
**Issue**: No loading screen while checking auth state
**Fix**: Added loading screen with ActivityIndicator in AppNavigator

### 6. New Architecture Compatibility
**Issue**: `newArchEnabled: true` might cause compatibility issues
**Fix**: Removed `newArchEnabled` from app.json

## Next Steps

1. **Clear Cache and Restart**:
   ```bash
   cd admin-app
   npm start -- --clear
   ```

2. **If issues persist, reinstall dependencies**:
   ```bash
   rm -rf node_modules
   npm install
   npm start -- --clear
   ```

3. **For iOS Simulator**:
   - Press `i` in the Expo CLI terminal
   - Or run: `npm run ios`

4. **Verify Firebase Configuration**:
   - Make sure Firebase config in `config/firebase.js` is correct
   - Verify Email/Password authentication is enabled in Firebase Console
   - Create admin user in Firebase Console if not already created

5. **Verify Backend is Running**:
   - Make sure backend server is running on `http://localhost:8000`
   - Test with: `curl http://localhost:8000/health`

## Common Issues

### White Screen on Web
- Web support is not fully configured for this MVP
- Focus on iOS Simulator for testing
- Web errors can be ignored if testing on iOS Simulator

### Firebase Auth Errors
- Verify Firebase config is correct
- Check that Email/Password authentication is enabled
- Verify admin user exists in Firebase Console

### API Connection Errors
- For iOS Simulator: Use `http://localhost:8000`
- For physical device: Use your machine's IP address
- Update `config/api.js` if needed

## Testing

1. Start backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start frontend:
   ```bash
   cd admin-app
   npm start
   ```

3. Run on iOS Simulator:
   - Press `i` in Expo CLI
   - Or run: `npm run ios`

4. Login with:
   - Email: `admin@homework.com`
   - Password: `admin123`

5. Verify:
   - Login screen appears
   - After login, dashboard appears
   - Usage Trends tab shows data
   - System Dashboard tab shows chart and questions

