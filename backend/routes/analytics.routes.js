const express = require('express');
const router = express.Router();
const controller = require('../controllers/analytics.controller');
const { verifyAdmin } = require('../middleware/auth.middleware');

// For MVP: Auth is optional - middleware will skip auth if Firebase Admin is not configured
// The verifyAdmin middleware will automatically skip auth checks if Firebase Admin is not initialized
// This allows the app to work without Firebase authentication configured
router.get('/usage-trends', verifyAdmin, controller.getUsageTrends);
router.get('/system-dashboard', verifyAdmin, controller.getSystemDashboard);

module.exports = router;

