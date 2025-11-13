// middleware/auth.middleware.js
// This middleware will check for a valid Firebase token and a custom admin: true claim
// Make sure to initialize firebase-admin in server.js

const admin = require('../config/firebase-admin');

exports.verifyAdmin = async (req, res, next) => {
  // Skip auth check if Firebase Admin is not initialized (for development/testing)
  if (!admin.apps || admin.apps.length === 0) {
    console.warn('Firebase Admin not initialized - skipping auth check');
    return next();
  }

  const idToken = req.headers.authorization?.split('Bearer ')[1];
  
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // This 'admin' claim is CRITICAL
    if (decodedToken.admin === true) {
      req.user = decodedToken;
      return next();
    } else {
      return res.status(403).json({ message: 'Forbidden: Not an admin' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

