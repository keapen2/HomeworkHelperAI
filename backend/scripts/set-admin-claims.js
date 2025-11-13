// scripts/set-admin-claims.js
// Script to set custom admin claims on a Firebase user
// Run this once after creating an admin user in Firebase Console

const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
if (!process.env.FIREBASE_ADMIN_SDK_KEY_PATH) {
  console.error('FIREBASE_ADMIN_SDK_KEY_PATH not set in .env');
  console.error('Please add FIREBASE_ADMIN_SDK_KEY_PATH=./config/firebase-service-account.json to your .env file');
  process.exit(1);
}

try {
  const serviceAccount = require(process.env.FIREBASE_ADMIN_SDK_KEY_PATH);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  process.exit(1);
}

// Set custom claims on admin user
// Replace 'USER_UID' with the actual UID of the admin user from Firebase Console
const adminUserUid = process.argv[2];

if (!adminUserUid) {
  console.error('Usage: node scripts/set-admin-claims.js <USER_UID>');
  console.error('Get the USER_UID from Firebase Console → Authentication → Users');
  process.exit(1);
}

admin.auth().setCustomUserClaims(adminUserUid, { admin: true })
  .then(() => {
    console.log(`Custom claims set successfully for user: ${adminUserUid}`);
    console.log('The user now has admin privileges');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting custom claims:', error.message);
    process.exit(1);
  });

