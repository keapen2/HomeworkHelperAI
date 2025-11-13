// routes/student.routes.js
// These are stub endpoints for context with other team members' features

const express = require('express');
const router = express.Router();

// CONTEXT: Oluwakunmi's feature will use this
router.post('/question', (req, res) => {
  res.status(201).json({ message: 'STUB: AI question submitted' });
  // TODO: This endpoint will eventually:
  // 1. Take `text` and `subject` from req.body
  // 2. Call OpenAI API
  // 3. Save to MongoDB 'questions' collection, which feeds the admin dashboards
});

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

