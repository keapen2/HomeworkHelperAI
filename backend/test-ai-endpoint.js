// test-ai-endpoint.js
// Simple test script to verify the AI endpoint is working
// Run this after starting your server: node test-ai-endpoint.js

const axios = require('axios');

const API_URL = 'http://localhost:8000';

async function testAIEndpoint() {
  console.log('Testing AI Question Generation Endpoint...\n');

  const testQuestion = {
    text: 'What is the derivative of x squared?',
    subject: 'Math',
    topic: 'Calculus'
  };

  try {
    console.log('Sending request:', testQuestion);
    console.log('Waiting for AI response...\n');

    const response = await axios.post(`${API_URL}/api/student/question`, testQuestion, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout for AI generation
    });

    console.log('✅ Success! Response received:\n');
    console.log('Question ID:', response.data.data.questionId);
    console.log('Subject:', response.data.data.subject);
    console.log('Word Count:', response.data.data.wordCount);
    console.log('\nAI Response:');
    console.log('─'.repeat(60));
    console.log(response.data.data.aiResponse);
    console.log('─'.repeat(60));
    console.log(`\n✅ Response is ${response.data.data.wordCount} words (limit: 200 words)`);

    if (response.data.data.wordCount <= 200) {
      console.log('✅ Word limit check passed!');
    } else {
      console.log('⚠️  Warning: Response exceeds 200 words');
    }

  } catch (error) {
    console.error('❌ Error testing endpoint:');
    
    if (error.response) {
      // Server responded with error status
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response from server. Is the server running?');
      console.error('Make sure to start the server with: npm run dev');
    } else {
      // Error setting up the request
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

// Check if server is running first
axios.get(`${API_URL}/health`)
  .then(() => {
    console.log('✅ Server is running\n');
    return testAIEndpoint();
  })
  .catch(() => {
    console.error('❌ Server is not running!');
    console.error('Please start the server first:');
    console.error('  cd backend');
    console.error('  npm run dev');
    process.exit(1);
  });

