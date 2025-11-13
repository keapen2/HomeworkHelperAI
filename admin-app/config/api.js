// config/api.js
// API configuration for backend connection

// For iOS Simulator, use localhost
// For physical device (Expo Go), use your machine's IP address
// To find your IP: ifconfig | grep "inet " | grep -v 127.0.0.1

// Change this to 'localhost' if using iOS Simulator, or your IP if using Expo Go on physical device
const USE_LOCALHOST = false; // Set to true for iOS Simulator, false for Expo Go on physical device
const YOUR_IP = '192.168.1.147'; // Your machine's IP address (found via ifconfig)

export const API_URL = USE_LOCALHOST 
  ? 'http://localhost:8000'  // For iOS Simulator
  : `http://${YOUR_IP}:8000`;  // For Expo Go on physical device

export default API_URL;

