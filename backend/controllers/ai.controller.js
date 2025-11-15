// controllers/ai.controller.js
// AI controller for generating responses using OpenAI API

const OpenAI = require('openai');
const Question = require('../models/question.model');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate AI response for a student question
 * Limits response to 200 words
 */
const generateAIResponse = async (req, res) => {
  try {
    const { text, subject, topic, studentId } = req.body;

    // Validate required fields
    if (!text || !text.trim()) {
      return res.status(400).json({ 
        error: 'Question text is required' 
      });
    }

    if (!subject) {
      return res.status(400).json({ 
        error: 'Subject is required' 
      });
    }

    // Validate subject enum
    const validSubjects = ['Math', 'Science', 'English', 'History', 'Other'];
    if (!validSubjects.includes(subject)) {
      return res.status(400).json({ 
        error: `Subject must be one of: ${validSubjects.join(', ')}` 
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.' 
      });
    }

    // Create prompt with 200-word limit instruction
    const prompt = `You are a helpful homework assistant. Please provide a clear, concise answer to the following ${subject} question. Keep your response to a maximum of 200 words.

Question: ${text}
${topic ? `Topic: ${topic}` : ''}

Provide a helpful, educational response:`;

    // Call OpenAI API
    let aiResponse;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful homework assistant. Provide clear, concise educational responses. Always limit your responses to 200 words maximum.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300, // Roughly 200 words (1 token ≈ 0.75 words)
        temperature: 0.7
      });

      aiResponse = completion.choices[0].message.content.trim();

      // Additional safety check: truncate to 200 words if needed
      const words = aiResponse.split(/\s+/);
      if (words.length > 200) {
        aiResponse = words.slice(0, 200).join(' ') + '...';
      }
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      return res.status(500).json({ 
        error: 'Failed to generate AI response',
        details: openaiError.message 
      });
    }

    // Save question and AI response to MongoDB
    const questionData = {
      text: text.trim(),
      subject,
      aiResponse,
      askCount: 1,
      upvotes: 0
    };

    if (topic) {
      questionData.topic = topic.trim();
    }

    if (studentId) {
      questionData.studentId = studentId;
    }

    const question = new Question(questionData);
    await question.save();

    // Return response
    res.status(201).json({
      success: true,
      message: 'Question submitted and AI response generated',
      data: {
        questionId: question._id,
        question: question.text,
        subject: question.subject,
        aiResponse: question.aiResponse,
        wordCount: question.aiResponse.split(/\s+/).length,
        createdAt: question.createdAt
      }
    });

  } catch (error) {
    console.error('Error in generateAIResponse:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

module.exports = {
  generateAIResponse
};

