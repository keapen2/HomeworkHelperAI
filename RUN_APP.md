# How to Run the HomeworkHelper AI App

## Quick Start (Step-by-Step)

### Prerequisites Checklist
- [ ] Node.js (v16 or higher) installed
- [ ] MongoDB Atlas account (free) - [Sign up here](https://www.mongodb.com/cloud/atlas/register)
- [ ] Firebase account (free) - [Sign up here](https://console.firebase.google.com/)
- [ ] OpenAI API key (for AI Question feature) - [Get one here](https://platform.openai.com/api-keys)

---

## Step 1: Backend Setup

### 1.1 Install Backend Dependencies

```bash
cd backend
npm install
```

### 1.2 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Copy the template
cp ENV_TEMPLATE.txt .env
```

Edit `.env` and add your configuration:

```env
PORT=8000

# MongoDB Atlas connection string (required for real data)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/homeworkhelper?retryWrites=true&w=majority

# OpenAI API Key (required for AI Question feature)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Firebase Admin SDK (optional - only if using full authentication)
# FIREBASE_ADMIN_SDK_KEY_PATH=./config/firebase-service-account.json
```

**How to get MongoDB Atlas URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free cluster
3. Create a database user (username/password)
4. Whitelist your IP (or use `0.0.0.0/0` for development)
5. Click "Connect" → "Connect your application"
6. Copy the connection string and replace `<password>` with your password

**How to get OpenAI API Key:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### 1.3 Seed the Database (Optional but Recommended)

```bash
npm run seed
```

This populates the database with sample data for testing.

### 1.4 Start the Backend Server

```bash
npm run dev
```

The server should start on `http://localhost:8000`

You should see:
```
Server is running on port 8000
MongoDB connected successfully
```

**Verify backend is running:**
```bash
curl http://localhost:8000/health
```

Should return: `{"status":"OK","message":"HomeworkHelper AI API is running"}`

---

## Step 2: Firebase Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2.2 Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Email/Password**
3. Enable it and click "Save"

### 2.3 Create Admin User

1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Enter:
   - Email: `admin@homework.com`
   - Password: `admin123`
4. Click **Add user**

### 2.4 Get Firebase Web App Configuration

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to **Your apps** → Click the web icon (`</>`)
3. Register app if you haven't already
4. Copy the Firebase configuration object

---

## Step 3: Frontend Setup

### 3.1 Install Frontend Dependencies

Open a **new terminal window** (keep backend running):

```bash
cd admin-app
npm install
```

### 3.2 Configure Firebase

Edit `admin-app/config/firebase.js` and replace with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3.3 Configure API URL

Edit `admin-app/config/api.js`:

**For iOS Simulator (Mac):**
```javascript
const USE_LOCALHOST = true; // Keep this true
export const API_URL = 'http://localhost:8000';
```

**For Physical Device (Expo Go):**
1. Find your computer's IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Example output: `inet 192.168.1.147`

2. Update `admin-app/config/api.js`:
   ```javascript
   const USE_LOCALHOST = false;
   const YOUR_IP = '192.168.1.147'; // Use your IP
   export const API_URL = `http://${YOUR_IP}:8000`;
   ```

---

## Step 4: Run the App

### Option A: iOS Simulator (Mac - Recommended)

1. **Open iOS Simulator**:
   ```bash
   open -a Simulator
   ```

2. **Start Expo** (in the `admin-app` directory):
   ```bash
   cd admin-app
   npm start
   ```

3. **Press `i`** in the Expo CLI terminal to launch on iOS Simulator

   **OR** use the convenience script:
   ```bash
   npm run ios:open
   ```

### Option B: Android Emulator

```bash
cd admin-app
npm start
# Press 'a' in the Expo CLI terminal
```

### Option C: Physical Device (Expo Go)

1. **Install Expo Go** app on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Make sure your phone and computer are on the same Wi-Fi network**

3. **Start Expo**:
   ```bash
   cd admin-app
   npm start
   ```

4. **Scan the QR code** with:
   - iOS: Camera app
   - Android: Expo Go app

---

## Step 5: Login and Use the App

1. **Login Screen** should appear
2. **Enter credentials**:
   - Email: `admin@homework.com`
   - Password: `admin123`

3. **After login**, you'll see three tabs:
   - **Usage Trends**: View active students, average accuracy, common struggles
   - **System Dashboard**: View category distribution charts and top questions
   - **Ask Question**: 🆕 Use AI to ask homework questions and get instant answers

4. **Test the AI Question Feature**:
   - Tap on the **"Ask Question"** tab
   - Enter a question (e.g., "What is the derivative of x^2?")
   - Select a subject
   - (Optional) Add a topic
   - Tap **"Get AI Response"**
   - View the AI-generated answer!

---

## Troubleshooting

### Backend Issues

**"MongoDB connection error"**
- Check your MongoDB Atlas connection string in `.env`
- Verify your IP is whitelisted in MongoDB Atlas
- Make sure your database user credentials are correct

**"OpenAI API key is not configured"**
- Make sure `OPENAI_API_KEY` is set in `backend/.env`
- Verify the API key is valid and starts with `sk-`
- Restart the backend server after adding the key

**"Port 8000 already in use"**
- Change `PORT=8000` to `PORT=8001` in `backend/.env`
- Update `API_URL` in `admin-app/config/api.js` to match

### Frontend Issues

**"Firebase Auth Error"**
- Verify Firebase configuration in `admin-app/config/firebase.js`
- Check Email/Password authentication is enabled in Firebase Console
- Verify admin user exists: `admin@homework.com`

**"Network Error" or "Connection Refused"**
- Make sure backend is running: `cd backend && npm run dev`
- For iOS Simulator: Use `http://localhost:8000`
- For physical device: Use your machine's IP address
- Check firewall settings (allow port 8000)

**"No iOS devices available"**
```bash
# Fix: Open Simulator manually first
open -a Simulator
# Wait for it to load, then run npm start
```

---

## Running Both Servers

You need **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd admin-app
npm start
# Then press 'i' for iOS Simulator
```

---

## Quick Commands Reference

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm run seed         # Seed database with sample data

# Frontend
cd admin-app
npm install          # Install dependencies
npm start            # Start Expo
npm run ios          # Run on iOS Simulator
npm run ios:open     # Open Simulator and run app
npm run android      # Run on Android Emulator

# Health Check
curl http://localhost:8000/health
```

---

## What's New: AI Question Feature

The app now includes an **AI Question** feature that allows users to:
- Ask homework questions
- Get instant AI-powered answers (200 words max)
- Select from 5 subjects (Math, Science, English, History, Other)
- Optionally specify topics
- View formatted responses with word count

This feature uses OpenAI's GPT-3.5-turbo model and requires the `OPENAI_API_KEY` to be configured in your backend `.env` file.

---

## Next Steps

- Customize the Firebase configuration for production
- Set up Firebase Admin SDK for full authentication
- Deploy backend to a cloud service (AWS, Heroku, etc.)
- Configure environment-specific settings

For more details, see `README.md` or `QUICKSTART.md`.

