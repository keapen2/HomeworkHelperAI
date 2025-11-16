# Quick Start Guide - HomeworkHelper AI Admin MVP

## Prerequisites

- Node.js (v16+)
- MongoDB Atlas account (free)
- Firebase account (free)
- Expo CLI (installed automatically)

## Quick Setup (5 minutes)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGO_URI=mongodb+srv://kiraneapen2006_db_user:admin123@cluster0.zpngkg2.mongodb.net/homeworkhelper?retryWrites=true&w=majority

PORT=8000
```

Seed database:
```bash
npm run seed
```

Start server:
```bash
npm run dev
```

### 2. Firebase Setup

1. Create Firebase project at https://console.firebase.google.com
2. Enable Email/Password authentication
3. Create admin user: `admin@homework.com` / `admin123`
4. Copy Firebase config from Project Settings → General → Web app

### 3. Frontend Setup

```bash
cd admin-app
npm install
```

Update `admin-app/config/firebase.js` with your Firebase config:
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

### 4. Run the App

```bash
npm start
```

Press `i` for iOS Simulator (Mac) or `a` for Android Emulator.

### 5. Login

- Email: `admin@homework.com`
- Password: `admin123`

## Troubleshooting

### Backend not connecting?
- Check MongoDB Atlas connection string
- Verify IP is whitelisted in MongoDB Atlas
- Check backend is running on port 8000

### Frontend not connecting to backend?
- For iOS Simulator: Use `http://localhost:8000`
- For physical device: Use your machine's IP address (e.g., `http://192.168.1.5:8000`)
- Update `admin-app/config/api.js` accordingly

### Firebase auth error?
- Verify Firebase config is correct
- Check Email/Password authentication is enabled
- Verify admin user exists in Firebase Console

## Demo Flow

1. Login with admin credentials
2. View "Usage Trends" tab:
   - Active students count
   - Average accuracy
   - Common study struggles
3. View "System Dashboard" tab:
   - Category distribution pie chart
   - Top 5 most asked questions

## Next Steps

See README.md for detailed setup instructions and production deployment.

