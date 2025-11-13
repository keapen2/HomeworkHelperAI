const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/homeworkhelper';

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  connectTimeoutMS: 30000, // 30 seconds
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
};

mongoose.connect(MONGO_URI, mongooseOptions)
  .then(() => {
    console.log('MongoDB connected successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    console.error('Please check your MONGO_URI in .env file');
    console.error('Make sure MongoDB Atlas is accessible and IP is whitelisted');
  });

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Firebase Admin Setup (will be initialized if service account key is provided)
// Initialize Firebase Admin (shared instance)
require('./config/firebase-admin');

// Routes
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/student', require('./routes/student.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'HomeworkHelper AI API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

