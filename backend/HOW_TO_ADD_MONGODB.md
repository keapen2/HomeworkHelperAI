# How to Add MongoDB URI to .env File

## Current Status

Your `.env` file currently has:
```env
PORT=8000
```

**Missing**: `MONGO_URI` - that's why MongoDB can't connect!

## Quick Fix

### Option 1: Add MongoDB Atlas Connection (For Real Data)

1. **Get your MongoDB Atlas connection string**:
   - Go to MongoDB Atlas → Database → Connect → Connect your application
   - Copy the connection string

2. **Edit `backend/.env` file** and add:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/homeworkhelper?retryWrites=true&w=majority
   PORT=8000
   ```

3. **Replace**:
   - `username` → your MongoDB Atlas username
   - `password` → your MongoDB Atlas password
   - `cluster0.xxxxx.mongodb.net` → your actual cluster URL

### Option 2: Keep Using Mock Data (For MVP Demo)

**You don't need to add MONGO_URI!** The app works perfectly with mock data.

Just keep your `.env` file as:
```env
PORT=8000
```

The MongoDB connection errors are expected and won't affect the app - it will use mock data automatically.

## Example .env File

Here's what a complete `.env` file should look like:

```env
# MongoDB Connection (from MongoDB Atlas)
MONGO_URI=mongodb+srv://admin:admin123@cluster0.abc123.mongodb.net/homeworkhelper?retryWrites=true&w=majority

# Server Port
PORT=8000
```

## Verify It's Working

After adding MONGO_URI:

1. **Restart backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **You should see**:
   ```
   MongoDB connected successfully
   Database: homeworkhelper
   Server is running on port 8000
   ```

3. **If you see connection errors**, check:
   - MongoDB Atlas cluster is running
   - IP address is whitelisted
   - Username/password are correct
   - Connection string format is correct

## For MVP Demo

**You can skip MongoDB setup entirely!** The app works with mock data:
- ✅ No errors shown to users
- ✅ Data displays correctly
- ✅ Ready for demo

Just keep `PORT=8000` in your `.env` file and you're good to go!

