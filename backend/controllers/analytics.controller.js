const Question = require('../models/question.model');
const User = require('../models/user.model');

// Controller for "Usage Trends" Screen
exports.getUsageTrends = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected, returning mock data');
      return res.json({
        activeStudents: 3,
        avgAccuracy: 85,
        commonStruggles: [
          { topic: 'Calculus Derivatives', studentCount: 250 },
          { topic: 'Biology', studentCount: 200 },
          { topic: 'Algebra', studentCount: 150 },
          { topic: 'World War I', studentCount: 180 },
          { topic: 'Grammar', studentCount: 120 }
        ]
      });
    }

    // 1. Get Active Students (e.g., active in the last 24 hours)
    const activeStudentCount = await User.countDocuments({
      role: 'student',
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).maxTimeMS(5000); // 5 second timeout

    // 2. Get Average Accuracy
    const avgAccuracyResult = await Question.aggregate([
      { $match: { accuracyRating: { $exists: true, $ne: null } } },
      { $group: { _id: null, average: { $avg: '$accuracyRating' } } }
    ], { maxTimeMS: 5000 }); // 5 second timeout
    const avgAccuracy = avgAccuracyResult.length > 0 ? avgAccuracyResult[0].average : 0;

    // 3. Get Common Study Struggles (Top 5 topics by ask count)
    const commonStruggles = await Question.aggregate([
      { 
        $match: { topic: { $exists: true, $ne: null } } 
      },
      { 
        $group: { 
          _id: '$topic', 
          studentCount: { $sum: 1 } 
        } 
      },
      { 
        $sort: { studentCount: -1 } 
      },
      { 
        $limit: 5 
      },
      { 
        $project: { 
          topic: '$_id', 
          studentCount: 1, 
          _id: 0 
        } 
      }
    ], { maxTimeMS: 5000 }); // 5 second timeout

    res.json({
      activeStudents: activeStudentCount,
      avgAccuracy: Math.round(avgAccuracy),
      commonStruggles: commonStruggles
    });
  } catch (error) {
    console.error('Error fetching usage trends:', error);
    // Return mock data if database query fails
    res.json({
      activeStudents: 3,
      avgAccuracy: 85,
      commonStruggles: [
        { topic: 'Calculus Derivatives', studentCount: 250 },
        { topic: 'Biology', studentCount: 200 },
        { topic: 'Algebra', studentCount: 150 },
        { topic: 'World War I', studentCount: 180 },
        { topic: 'Grammar', studentCount: 120 }
      ]
    });
  }
};

// Controller for "System Dashboard" Screen
exports.getSystemDashboard = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected, returning mock data');
      const mockChartData = [
        { name: 'Math', count: 560 },
        { name: 'Science', count: 515 },
        { name: 'English', count: 250 },
        { name: 'History', count: 340 }
      ];
      return res.json({
        categoryDistribution: mockChartData,
        topQuestions: [
          { _id: '1', text: 'What are Calculus Derivatives?', askCount: 250 },
          { _id: '2', text: 'What is the powerhouse of the cell?', askCount: 200 },
          { _id: '3', text: 'Explain the main causes of WWI', askCount: 180 },
          { _id: '4', text: 'How do I solve quadratic equations?', askCount: 150 },
          { _id: '5', text: 'What is a verb?', askCount: 120 }
        ]
      });
    }

    // 1. Get Category Distribution
    const categoryDistribution = await Question.aggregate([
      { 
        $group: { 
          _id: '$subject', 
          count: { $sum: 1 } 
        } 
      },
      { 
        $project: { 
          name: '$_id', 
          count: 1, 
          _id: 0 
        } 
      }
    ], { maxTimeMS: 5000 }); // 5 second timeout

    // 2. Get Top Questions (Top 5 by askCount/upvotes)
    const topQuestions = await Question.find()
      .sort({ askCount: -1 })
      .limit(5)
      .select('text askCount upvotes')
      .maxTimeMS(5000); // 5 second timeout

    res.json({
      categoryDistribution: categoryDistribution,
      topQuestions: topQuestions
    });
  } catch (error) {
    console.error('Error fetching system dashboard:', error);
    // Return mock data if database query fails
    const mockChartData = [
      { name: 'Math', count: 560 },
      { name: 'Science', count: 515 },
      { name: 'English', count: 250 },
      { name: 'History', count: 340 }
    ];
    res.json({
      categoryDistribution: mockChartData,
      topQuestions: [
        { _id: '1', text: 'What are Calculus Derivatives?', askCount: 250 },
        { _id: '2', text: 'What is the powerhouse of the cell?', askCount: 200 },
        { _id: '3', text: 'Explain the main causes of WWI', askCount: 180 },
        { _id: '4', text: 'How do I solve quadratic equations?', askCount: 150 },
        { _id: '5', text: 'What is a verb?', askCount: 120 }
      ]
    });
  }
};

