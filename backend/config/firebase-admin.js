// config/firebase-admin.js
// Shared Firebase Admin initialization

const admin = require('firebase-admin');
require('dotenv').config();

let initialized = false;

const initializeFirebaseAdmin = () => {
  if (initialized) {
    return admin;
  }

  // Check if Firebase Admin is already initialized
  if (admin.apps.length > 0) {
    initialized = true;
    return admin;
  }

  if (process.env.FIREBASE_ADMIN_SDK_KEY_PATH) {
    try {
      const path = require('path');
      const fs = require('fs');
      const serviceAccountPath = path.resolve(process.env.FIREBASE_ADMIN_SDK_KEY_PATH);
      
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        initialized = true;
        console.log('Firebase Admin initialized successfully');
      } else {
        console.warn(`Firebase Admin service account file not found: ${serviceAccountPath}`);
        console.warn('Admin routes will not be protected until Firebase is configured');
      }
    } catch (error) {
      console.warn('Firebase Admin not initialized:', error.message);
      console.warn('Admin routes will not be protected until Firebase is configured');
    }
  } else {
    console.warn('FIREBASE_ADMIN_SDK_KEY_PATH not set in .env');
    console.warn('Admin routes will not be protected until Firebase is configured');
  }

  return admin;
};

module.exports = initializeFirebaseAdmin();

