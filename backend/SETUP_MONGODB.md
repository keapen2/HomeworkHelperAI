# Setting Up MongoDB Atlas

## Quick Setup Guide

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a free cluster (M0 - Free tier)

### Step 2: Create Database User

1. Go to **Database Access** → **Add New Database User**
2. Choose **Password** authentication
3. Username: `admin` (or your choice)
4. Password: `admin123` (or your choice - **save this!**)
5. Database User Privileges: **Read and write to any database**
6. Click **Add User**

### Step 3: Whitelist Your IP Address

1. Go to **Network Access** → **Add IP Address**
2. Click **Add Current IP Address** (or use `0.0.0.0/0` for all IPs - less secure but easier for development)
3. Click **Confirm**

### Step 4: Get Connection String

1. Go to **Database** → **Connect** → **Connect your application**
2. Choose **Node.js** and version **5.5 or later**
3. Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
4. Replace `<username>` with your database username
5. Replace `<password>` with your database password
6. Add database name: `?retryWrites=true&w=majority` → `?retryWrites=true&w=majority` (or add `&db=homeworkhelper`)

### Step 5: Add to .env File

1. Open `backend/.env` file
2. Add your connection string:

```env
MONGO_URI=mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/homeworkhelper?retryWrites=true&w=majority
PORT=8000
```

**Important**: Replace:
- `admin` with your database username
- `admin123` with your database password
- `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- `homeworkhelper` with your database name (or remove it to use default)

### Step 6: Test Connection

1. Run the seed script:
   ```bash
   cd backend
   npm run seed
   ```

2. You should see:
   ```
   ✅ Connected to MongoDB
   Cleared old data
   Created 8 student users
   Created 12 questions
   Database seeded successfully!
   ```

## Troubleshooting

### "MONGO_URI not set"
- **Fix**: Make sure `.env` file exists in `backend/` directory
- **Fix**: Make sure `MONGO_URI=...` is in the `.env` file

### "Connection refused" or "ECONNREFUSED"
- **Fix**: Check your IP is whitelisted in MongoDB Atlas
- **Fix**: Verify connection string is correct
- **Fix**: Make sure cluster is running (not paused)

### "Authentication failed"
- **Fix**: Check username and password in connection string
- **Fix**: Make sure database user exists in MongoDB Atlas

### "IP not whitelisted"
- **Fix**: Go to MongoDB Atlas → Network Access → Add your IP
- **Fix**: Or use `0.0.0.0/0` to allow all IPs (development only!)

## Example .env File

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/homeworkhelper?retryWrites=true&w=majority

# Server Port
PORT=8000

# Firebase Admin SDK (Optional for MVP)
# FIREBASE_ADMIN_SDK_KEY_PATH=./config/firebase-service-account.json
```

## For MVP Demo

**You don't need MongoDB!** The app works perfectly with mock data:

- ✅ App shows data (mock data)
- ✅ No errors shown to users
- ✅ Ready for demo

MongoDB is only needed if you want real data instead of mock data.

## Next Steps

1. **Set up MongoDB Atlas** (follow steps above)
2. **Add MONGO_URI to .env file**
3. **Run seed script**: `npm run seed`
4. **Start backend**: `npm run dev`
5. **Test**: App will now use real data from MongoDB!

