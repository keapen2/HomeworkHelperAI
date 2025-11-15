# AI Question Generation API Usage

## Endpoint

**POST** `/api/student/question`

## Description

Submits a student question and generates an AI-powered response using OpenAI. The response is limited to 200 words maximum.

## Request Body

```json
{
  "text": "What is the derivative of x^2?",
  "subject": "Math",
  "topic": "Calculus Derivatives",  // Optional
  "studentId": "507f1f77bcf86cd799439011"  // Optional
}
```

### Required Fields
- `text` (string): The question text
- `subject` (string): One of: `Math`, `Science`, `English`, `History`, `Other`

### Optional Fields
- `topic` (string): The specific topic or category (e.g., "Calculus Derivatives", "Physics Mechanics")
- `studentId` (string): MongoDB ObjectId of the student asking the question

## Response

### Success (201 Created)

```json
{
  "success": true,
  "message": "Question submitted and AI response generated",
  "data": {
    "questionId": "507f1f77bcf86cd799439011",
    "question": "What is the derivative of x^2?",
    "subject": "Math",
    "aiResponse": "The derivative of x^2 is 2x. This follows from the power rule of differentiation...",
    "wordCount": 187,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

**400 Bad Request** - Missing or invalid fields
```json
{
  "error": "Question text is required"
}
```

**500 Internal Server Error** - OpenAI API error or missing API key
```json
{
  "error": "OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file."
}
```

## Example Usage

### Using cURL

```bash
curl -X POST http://localhost:8000/api/student/question \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Explain photosynthesis in simple terms",
    "subject": "Science",
    "topic": "Biology"
  }'
```

### Using JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:8000/api/student/question', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'What is the derivative of x^2?',
    subject: 'Math',
    topic: 'Calculus Derivatives'
  })
});

const data = await response.json();
console.log(data.data.aiResponse);
```

### Using Axios (React Native)

```javascript
import axios from 'axios';
import { API_URL } from '../config/api';

const submitQuestion = async (questionText, subject, topic) => {
  try {
    const response = await axios.post(`${API_URL}/api/student/question`, {
      text: questionText,
      subject: subject,
      topic: topic
    });
    
    return response.data.data.aiResponse;
  } catch (error) {
    console.error('Error submitting question:', error.response?.data || error.message);
    throw error;
  }
};
```

## Setup

1. **Get OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key

2. **Add to .env file**:
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   ```

3. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

## Notes

- The AI response is automatically limited to 200 words
- Questions are saved to MongoDB and will appear in the admin dashboard
- The endpoint uses GPT-3.5-turbo model for cost efficiency
- Word count is calculated and returned in the response

