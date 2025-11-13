# Setup Instructions - HomeworkHelper AI Admin MVP

## Step-by-Step Setup

### Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for a free account
   - Create a free cluster (M0)

2. **Create Database User**
   - Go to Database Access → Add New Database User
   - Username: `admin` (or your choice)
   - Password: `admin123` (or your choice)
   - Database User Privileges: Read and write to any database

3. **Whitelist IP Address**
   - Go to Network Access → Add IP Address
   - Click "Add Current IP Address" or use `0.0.0.0/0` for development (not recommended for production)

4. **Get Connection String**
   - Go to Database → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `homeworkhelper` (or your choice)
   - Example: `mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/homeworkhelper?retryWrites=true&w=majority`

### Step 2: Firebase Setup

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Project name: `homeworkhelper-ai` (or your choice)
   - Disable Google Analytics (optional for MVP)
   - Click "Create project"

2. **Enable Authentication**
   - Go to Authentication → Get Started
   - Click "Sign-in method" tab
   - Click "Email/Password"
   - Enable "Email/Password" provider
   - Click "Save"

3. **Create Admin User**
   - Go to Authentication → Users → Add user
   - Email: `admin@homework.com`
   - Password: `admin123`
   - Click "Add user"
   - Copy the User UID (you'll need this for setting custom claims)

4. **Get Firebase Web App Configuration**
   - Go to Project Settings → General
   - Scroll down to "Your apps"
   - Click the Web icon (</>) to create a new web app
   - App nickname: `Admin Dashboard`
   - Click "Register app"
   - Copy the Firebase configuration object

5. **Firebase Admin SDK Setup (Optional for MVP)**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `backend/config/firebase-service-account.json`
   - Add to `.env`: `FIREBASE_ADMIN_SDK_KEY_PATH=./config/firebase-service-account.json`
   - Set custom claims (run once):
     ```bash
     cd backend
     npm run set-admin-claims <USER_UID>
     ```

### Step 3: Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create .env File**
   ```bash
   # Create .env file in backend directory
   touch .env
   ```

4. **Add Environment Variables**
   ```env
   MONGO_URI=mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/homeworkhelper?retryWrites=true&w=majority
   PORT=8000
   # Optional: Uncomment if you have Firebase Admin SDK key
   # FIREBASE_ADMIN_SDK_KEY_PATH=./config/firebase-service-account.json
   ```

5. **Seed Database**
   ```bash
   npm run seed
   ```

6. **Start Backend Server**
   ```bash
   npm run dev
   ```

7. **Verify Backend is Running**
   ```bash
   curl http://localhost:8000/health
   ```

   Expected response:
   ```json
   {
     "status": "OK",
     "message": "HomeworkHelper AI API is running"
   }
   ```

### Step 4: Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd admin-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Open `admin-app/config/firebase.js`
   - Replace the Firebase configuration with your Firebase project settings:
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

4. **Configure API URL**
   - Open `admin-app/config/api.js`
   - For iOS Simulator (Mac): Use `http://localhost:8000`
   - For Android Emulator: Use `http://10.0.2.2:8000`
   - For physical device: Use your machine's IP address (e.g., `http://192.168.1.5:8000`)
   - To find your IP address:
     - Mac/Linux: `ifconfig | grep "inet "`
     - Windows: `ipconfig`

5. **Start Expo Development Server**
   ```bash
   npm start
   ```

6. **Run on iOS Simulator (Mac)**
   ```bash
   npm run ios
   ```

   Or press `i` in the Expo CLI terminal

7. **Run on Android Emulator**
   ```bash
   npm run android
   ```

   Or press `a` in the Expo CLI terminal

### Step 5: Testing

1. **Login**
   - Email: `admin@homework.com`
   - Password: `admin123`

2. **View Usage Trends**
   - Navigate to "Usage Trends" tab
   - Verify you see:
     - Active students count
     - Average accuracy
     - Common study struggles list

3. **View System Dashboard**
   - Navigate to "System Dashboard" tab
   - Verify you see:
     - Category distribution pie chart
     - Top 5 most asked questions

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**
   - Check your MongoDB Atlas connection string
   - Verify your IP address is whitelisted
   - Check your database user credentials
   - Verify the database name is correct

2. **Firebase Admin Not Initialized**
   - This is OK for MVP testing without authentication
   - To enable authentication, add Firebase Admin SDK key path to `.env`
   - Make sure the service account key file exists
   - Verify the file path is correct

3. **Port Already in Use**
   - Change the PORT in `.env` to a different port (e.g., 8001)
   - Update the API_URL in `admin-app/config/api.js` accordingly

### Frontend Issues

1. **Firebase Authentication Error**
   - Verify Firebase configuration in `config/firebase.js`
   - Check that Email/Password authentication is enabled in Firebase Console
   - Verify the admin user exists in Firebase Authentication
   - Check the Firebase project ID is correct

2. **API Connection Error**
   - For iOS Simulator: Use `http://localhost:8000`
   - For Android Emulator: Use `http://10.0.2.2:8000`
   - For physical device: Use your machine's IP address
   - Make sure the backend server is running
   - Check firewall settings
   - Verify CORS is enabled in backend

3. **Chart Not Rendering**
   - Verify `react-native-svg` is installed
   - Check that data is being fetched from the API
   - Check console for error messages
   - Verify the chart data format is correct

4. **Navigation Not Working**
   - Verify navigation dependencies are installed
   - Check that screens are properly imported
   - Verify the navigation structure is correct

## Next Steps

- See README.md for detailed documentation
- See QUICKSTART.md for quick setup guide
- For production deployment, see AWS deployment instructions in README.md

