// controllers/history.controller.js
const Question = require('../models/question.model');

/**
 * Get user's own questions
 * GET /api/student/questions/my
 */
exports.getMyQuestions = async (req, res) => {
  try {
    const userId = req.user?.uid || req.user?.sub;
    const { subject, limit = 50, skip = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID required to fetch personal questions'
      });
    }

    // Build query
    const query = { askedBy: userId };
    if (subject && subject !== 'all') {
      query.subject = subject;
    }

    // Fetch questions
    const questions = await Question.find(query)
      .sort({ askedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('text subject topic answer aiResponse askedAt askCount upvotes')
      .lean();

    // Map aiResponse to answer for consistency
    const questionsWithAnswer = questions.map(q => ({
      ...q,
      answer: q.answer || q.aiResponse,
    }));

    res.status(200).json({
      success: true,
      questions: questionsWithAnswer || [],
      count: questionsWithAnswer.length,
    });

  } catch (error) {
    console.error('Error fetching user questions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch questions'
    });
  }
};

/**
 * Get community questions (other users' questions)
 * GET /api/student/questions/community
 */
exports.getCommunityQuestions = async (req, res) => {
  try {
    const userId = req.user?.uid || req.user?.sub;
    const { subject, limit = 50, skip = 0 } = req.query;

    // Build query - exclude user's own questions
    const query = {};
    if (userId) {
      query.askedBy = { $ne: userId };
    }
    if (subject && subject !== 'all') {
      query.subject = subject;
    }

    // Fetch questions, sorted by popularity (upvotes) or recency
    const questions = await Question.find(query)
      .sort({ upvotes: -1, askedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('text subject topic answer aiResponse askedAt askCount upvotes askedBy')
      .lean();

    // Anonymize user IDs for privacy and map aiResponse to answer
    const anonymizedQuestions = questions.map(q => ({
      ...q,
      answer: q.answer || q.aiResponse,
      askedBy: q.askedBy ? 'community' : null,
    }));

    res.status(200).json({
      success: true,
      questions: anonymizedQuestions || [],
      count: anonymizedQuestions.length,
    });

  } catch (error) {
    console.error('Error fetching community questions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch community questions'
    });
  }
};

/**
 * Get featured/pre-written questions
 * GET /api/student/questions/featured
 */
exports.getFeaturedQuestions = async (req, res) => {
  try {
    const { subject, limit = 50, skip = 0 } = req.query;

    // Build query - featured questions are those with high upvotes or askCount
    const query = {
      $or: [
        { upvotes: { $gte: 5 } },
        { askCount: { $gte: 3 } },
      ]
    };

    if (subject && subject !== 'all') {
      query.subject = subject;
    }

    // Fetch featured questions
    const questions = await Question.find(query)
      .sort({ upvotes: -1, askCount: -1, askedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('text subject topic answer aiResponse askedAt askCount upvotes')
      .lean();

    // Map aiResponse to answer for consistency
    const questionsWithAnswer = questions.map(q => ({
      ...q,
      answer: q.answer || q.aiResponse,
    }));

    res.status(200).json({
      success: true,
      questions: questionsWithAnswer || [],
      count: questionsWithAnswer.length,
    });

  } catch (error) {
    console.error('Error fetching featured questions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch featured questions'
    });
  }
};

