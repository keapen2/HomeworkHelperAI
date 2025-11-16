// controllers/ai.controller.js
const OpenAI = require('openai');
const Question = require('../models/question.model');
const User = require('../models/user.model');

// Check if OpenAI API key is configured
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI client
let openai = null;
if (OPENAI_API_KEY && OPENAI_API_KEY.trim() !== '') {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
}

/**
 * Generate AI response for a homework question
 * POST /api/student/question
 */
exports.generateAIResponse = async (req, res) => {
  try {
    const { question, subject, topic } = req.body;
    const userId = req.user?.uid || req.user?.sub; // Firebase UID

    // Check if OpenAI is configured
    if (!openai) {
      console.error('OpenAI API key not configured in .env file');
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'The OpenAI API key is missing. Please add OPENAI_API_KEY to your backend .env file.'
      });
    }

    // Validation
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Question is required',
        message: 'Please provide a question' 
      });
    }

    if (question.length > 2000) {
      return res.status(400).json({ 
        error: 'Question too long',
        message: 'Question must be 2000 characters or less' 
      });
    }

    // Prepare OpenAI prompt
    const systemPrompt = `You are a helpful homework assistant. Provide clear, concise, and accurate answers to student questions. Keep responses educational and easy to understand. If the question is unclear, ask for clarification.`;
    
    const userPrompt = subject || topic 
      ? `Subject: ${subject || ''}${topic ? `, Topic: ${topic}` : ''}\n\nQuestion: ${question}`
      : question;

    // Call OpenAI API
    let aiResponse;
    try {
      // Determine which model to use
      const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
      
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      console.error('Error details:', {
        status: openaiError.status,
        statusText: openaiError.statusText,
        message: openaiError.message,
        code: openaiError.code,
        type: openaiError.type
      });
      
      // Return error if API key is missing or invalid
      if (openaiError.status === 401 || openaiError.code === 'invalid_api_key') {
        return res.status(500).json({
          error: 'OpenAI API key invalid',
          message: 'The OpenAI API key is invalid or expired. Please check your OPENAI_API_KEY in the backend .env file.'
        });
      }

      // Return error for quota exceeded (429 with insufficient_quota code)
      if (openaiError.status === 429 && (openaiError.code === 'insufficient_quota' || openaiError.error?.code === 'insufficient_quota')) {
        return res.status(429).json({
          error: 'OpenAI quota exceeded',
          message: 'You have exceeded your OpenAI API quota. Please:\n1. Add payment method to your OpenAI account at https://platform.openai.com/account/billing\n2. Check your usage limits at https://platform.openai.com/usage\n3. Upgrade your plan if needed.',
          code: 'QUOTA_EXCEEDED'
        });
      }

      // Return error for access/permission issues (403)
      if (openaiError.status === 403 || openaiError.message?.includes('does not have access') || openaiError.code === 'model_not_found') {
        const modelName = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
        return res.status(403).json({
          error: 'OpenAI model access denied',
          message: `Your OpenAI project does not have access to the model "${modelName}". Please either:\n1. Check which models you have access to at https://platform.openai.com/playground\n2. Try using "gpt-4" or contact OpenAI support to enable model access\n3. Update OPENAI_MODEL in your .env file with a model you have access to`,
          code: 'MODEL_ACCESS_DENIED',
          attemptedModel: modelName
        });
      }

      // Return error for rate limits (429 without quota issue)
      if (openaiError.status === 429 || openaiError.code === 'rate_limit_exceeded') {
        // Try to extract retry-after header or use default
        const retryAfter = openaiError.headers?.['retry-after'] || openaiError.response?.headers?.['retry-after'] || 60;
        
        return res.status(429).json({
          error: 'OpenAI rate limit exceeded',
          message: `Too many requests to OpenAI. Please wait ${retryAfter} seconds before trying again.`,
          retryAfter: parseInt(retryAfter),
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }

      // Return a helpful error message
      return res.status(500).json({
        error: 'AI service error',
        message: openaiError.message || 'Failed to generate AI response. Please try again later.'
      });
    }

    // Store question and answer in MongoDB (if connected)
    let savedQuestion = null;
    try {
      const questionData = {
        text: question.trim(),
        subject: subject || 'Other',
        topic: topic || null,
        answer: aiResponse,
        aiResponse: aiResponse, // Store in both fields for compatibility
        askedBy: userId || null,
        askedAt: new Date(),
        askCount: 1,
        upvotes: 0,
      };

      // Try to find existing question or create new one
      if (userId) {
        // Check if this exact question exists
        const existingQuestion = await Question.findOne({ 
          text: question.trim(),
          askedBy: userId 
        });

        if (existingQuestion) {
          // Update existing question
          existingQuestion.answer = aiResponse;
          existingQuestion.askedAt = new Date();
          existingQuestion.askCount = (existingQuestion.askCount || 0) + 1;
          savedQuestion = await existingQuestion.save();
        } else {
          // Create new question
          savedQuestion = await Question.create(questionData);
        }
      } else {
        // Create question without user ID (guest mode)
        savedQuestion = await Question.create(questionData);
      }
    } catch (dbError) {
      console.warn('Failed to save question to database:', dbError.message);
      // Continue even if database save fails - still return the AI response
    }

    // Return response
    res.status(200).json({
      success: true,
      question: question.trim(),
      answer: aiResponse,
      subject: subject || 'General',
      topic: topic || null,
      questionId: savedQuestion?._id || null,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error generating AI response:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

