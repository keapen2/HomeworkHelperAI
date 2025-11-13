# HomeworkHelper AI - Admin Dashboard MVP

## Overview

HomeworkHelper AI is an intelligent mobile application designed to assist students with their homework. This repository contains the **Admin Dashboard MVP**, which allows administrators to view real-time student activity, common study struggles, and system analytics.

## Project Structure

```
HomeworkHelperAI/
├── backend/                 # Node.js/Express API
│   ├── models/             # Mongoose models (Question, User)
│   ├── routes/             # API routes (analytics, student stubs)
│   ├── controllers/        # Business logic (analytics controllers)
│   ├── middleware/         # Auth middleware (Firebase Admin)
│   ├── scripts/            # Seed data script
│   ├── server.js           # Express server entry point
│   └── package.json        # Backend dependencies
├── admin-app/              # React Native admin mobile app (Expo)
│   ├── screens/            # Login, Usage Trends, System Dashboard
│   ├── navigation/         # Navigation setup
│   ├── config/             # Firebase and API configuration
│   └── App.js              # Main app component
└── README.md               # This file
```

## Features

### Admin Dashboard
- **Secure Login**: Firebase Authentication with admin-only access
- **Usage Trends**: View active students, average accuracy, and common study struggles
- **System Dashboard**: Visual analytics with category distribution charts and top questions

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB Atlas account** (free tier is sufficient)
- **Firebase account** (free tier is sufficient)
- **Expo CLI** (will be installed with the project)
- **iOS Simulator** (for Mac) or **Android Emulator** (for Windows/Linux)

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account and cluster
3. Create a database user with username and password
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/homeworkhelper?retryWrites=true&w=majority`)
6. Copy the connection string for use in the backend `.env` file

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Authentication** → **Sign-in method** → **Email/Password**
4. Create an admin user:
   - Go to Authentication → Users → Add user
   - Email: `admin@homework.com` (or your preferred email)
   - Password: `admin123` (or your preferred password)
5. Get your Firebase Web App configuration:
   - Go to Project Settings → General → Your apps → Web app
   - Copy the Firebase configuration object
6. For Firebase Admin SDK (optional for MVP):
   - Go to Project Settings → Service Accounts
   - Generate a new private key
   - Save the JSON file as `backend/config/firebase-service-account.json`

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/homeworkhelper?retryWrites=true&w=majority
   PORT=8000
   # Optional: Uncomment if you have Firebase Admin SDK key
   # FIREBASE_ADMIN_SDK_KEY_PATH=./config/firebase-service-account.json
   ```

4. Replace `MONGO_URI` with your MongoDB Atlas connection string

5. Seed the database with mock data:
   ```bash
   npm run seed
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

   The server should now be running on `http://localhost:8000`

7. Test the health endpoint:
   ```bash
   curl http://localhost:8000/health
   ```

### 4. Frontend Setup (React Native Expo App)

1. Navigate to the admin-app directory:
   ```bash
   cd admin-app
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Open `admin-app/config/firebase.js`
   - Replace the Firebase configuration values with your Firebase project settings:
     ```javascript
     const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-auth-domain",
       projectId: "your-project-id",
       storageBucket: "your-storage-bucket",
       messagingSenderId: "your-messaging-sender-id",
       appId: "your-app-id"
     };
     ```

4. Configure API URL:
   - Open `admin-app/config/api.js`
   - For iOS Simulator, use `http://localhost:8000`
   - For physical device, use your machine's IP address (e.g., `http://192.168.1.5:8000`)
   - To find your IP address:
     - Mac/Linux: `ifconfig | grep "inet "`
     - Windows: `ipconfig`

5. Start the Expo development server:
   ```bash
   npm start
   ```

6. Run on iOS Simulator (Mac):
   ```bash
   npm run ios
   ```

   Or press `i` in the Expo CLI terminal

7. Run on Android Emulator:
   ```bash
   npm run android
   ```

   Or press `a` in the Expo CLI terminal

## Running the Application

### Backend

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. The server will run on `http://localhost:8000`

### Frontend

1. Start the Expo development server:
   ```bash
   cd admin-app
   npm start
   ```

2. Open the app in iOS Simulator (Mac) or Android Emulator

3. Login with your admin credentials:
   - Email: `admin@homework.com` (or the email you created in Firebase)
   - Password: `admin123` (or the password you set)

## Testing

### Backend API Endpoints

1. **Health Check**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Usage Trends** (requires authentication):
   ```bash
   curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" http://localhost:8000/api/analytics/usage-trends
   ```

3. **System Dashboard** (requires authentication):
   ```bash
   curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" http://localhost:8000/api/analytics/system-dashboard
   ```

### Frontend Testing

1. Login with admin credentials
2. Navigate to "Usage Trends" tab to see:
   - Active students count
   - Average accuracy
   - Common study struggles
3. Navigate to "System Dashboard" tab to see:
   - Category distribution pie chart
   - Top 5 most asked questions

## Environment Variables

### Backend (.env)

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/homeworkhelper?retryWrites=true&w=majority
PORT=8000
FIREBASE_ADMIN_SDK_KEY_PATH=./config/firebase-service-account.json
```

### Frontend (config/firebase.js)

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**:
   - Check your MongoDB Atlas connection string
   - Verify your IP address is whitelisted
   - Check your database user credentials

2. **Firebase Admin Not Initialized**:
   - This is OK for MVP testing without authentication
   - To enable authentication, add Firebase Admin SDK key path to `.env`
   - Make sure the service account key file exists

3. **Port Already in Use**:
   - Change the PORT in `.env` to a different port (e.g., 8001)
   - Update the API_URL in `admin-app/config/api.js` accordingly

### Frontend Issues

1. **Firebase Authentication Error**:
   - Verify Firebase configuration in `config/firebase.js`
   - Check that Email/Password authentication is enabled in Firebase Console
   - Verify the admin user exists in Firebase Authentication

2. **API Connection Error**:
   - For iOS Simulator, use `http://localhost:8000`
   - For physical device, use your machine's IP address
   - Make sure the backend server is running
   - Check firewall settings

3. **Chart Not Rendering**:
   - Verify `react-native-svg` is installed
   - Check that data is being fetched from the API
   - Check console for error messages

## Firebase Admin Setup (Optional for MVP)

For production or to enable full authentication, you need to set up Firebase Admin SDK:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `backend/config/firebase-service-account.json`
4. Add to `.env`:
   ```env
   FIREBASE_ADMIN_SDK_KEY_PATH=./config/firebase-service-account.json
   ```
5. Set custom claims on admin user (run this script once):
   ```javascript
   const admin = require('firebase-admin');
   const serviceAccount = require('./config/firebase-service-account.json');
   
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount)
   });
   
   admin.auth().setCustomUserClaims('USER_UID', { admin: true });
   ```

## Future Enhancements

- Two-factor authentication (TOTP/SMS)
- AWS EC2 deployment
- Real-time updates using WebSockets
- Advanced filtering and date range selection
- Export functionality (CSV/PDF)
- Push notifications
- Offline mode support

## License

This project is part of a CS course project.

## Contributors

- **Kiran Eapen** - Admin Dashboard, System Dashboard, & Question Insights Integration

## Support

For issues or questions, please contact the development team.
