// routes/student.routes.js
// Student endpoints for question submission and AI generation

const express = require('express');
const router = express.Router();
const { generateAIResponse } = require('../controllers/ai.controller');

// AI question submission endpoint
// POST /api/student/question
// Body: { text: string, subject: string, topic?: string, studentId?: string }
router.post('/question', generateAIResponse);

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

