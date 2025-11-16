// routes/student.routes.js
// Student routes for AI question feature and user functionality

const express = require('express');
const router = express.Router();
const { generateAIResponse } = require('../controllers/ai.controller');
const { getMyQuestions, getCommunityQuestions, getFeaturedQuestions } = require('../controllers/history.controller');
const { verifyUser } = require('../middleware/auth.middleware');

// Apply verifyUser middleware to all routes (allows both authenticated and guest access)
router.use(verifyUser);

// AI Question endpoint - Oluwakunmi's feature
router.post('/question', generateAIResponse);

// History endpoints
router.get('/questions/my', getMyQuestions);
router.get('/questions/community', getCommunityQuestions);
router.get('/questions/featured', getFeaturedQuestions);

// CONTEXT: Kanda's feature will use this
router.post('/question/:id/upvote', (req, res) => {
  res.status(200).json({ message: 'STUB: Question upvoted' });
  // TODO: This endpoint will find a question by ID and increment its `askCount` or `upvotes`
});

// CONTEXT: Kanda's user login
router.post('/auth/login', (req, res) => {
  res.status(200).json({ message: 'STUB: Student login' });
});

module.exports = router;

