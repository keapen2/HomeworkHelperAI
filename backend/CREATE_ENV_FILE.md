# How to Create .env File

## The Problem

Your `.env` file exists but is **empty** (0 bytes). That's why MongoDB can't connect.

## Quick Fix

### Step 1: Open the .env file

```bash
cd backend
nano .env
```

Or open it in your text editor.

### Step 2: Add this content

**For MVP (without MongoDB - uses mock data):**
```env
PORT=8000
```

**For real data (with MongoDB Atlas):**
```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/homeworkhelper?retryWrites=true&w=majority
PORT=8000
```

**Replace**:
- `username` with your MongoDB Atlas username
- `password` with your MongoDB Atlas password
- `cluster0.xxxxx.mongodb.net` with your actual cluster URL

### Step 3: Save the file

- In nano: Press `Ctrl+X`, then `Y`, then `Enter`
- In VS Code: Just save (Cmd+S)

## Example .env File

Here's what a complete `.env` file should look like:

```env
# MongoDB Connection (get from MongoDB Atlas)
MONGO_URI=mongodb+srv://admin:admin123@cluster0.abc123.mongodb.net/homeworkhelper?retryWrites=true&w=majority

# Server Port
PORT=8000

# Firebase Admin SDK (Optional - only if you want full auth)
# FIREBASE_ADMIN_SDK_KEY_PATH=./config/firebase-service-account.json
```

## For MVP Demo (No MongoDB Needed)

If you just want to demo the app, you can use this minimal `.env`:

```env
PORT=8000
```

The app will work perfectly with mock data!

## Verify It Works

After creating the `.env` file:

1. **Test backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **You should see**:
   - If MONGO_URI is set: `MongoDB connected successfully`
   - If MONGO_URI is not set: `MongoDB connection error` (but server still runs and uses mock data)

3. **Test health endpoint**:
   ```bash
   curl http://localhost:8000/health
   ```

## File Location

The `.env` file should be here:
```
/Users/kiraneapen/HomeworkHelper-AI/HomeworkHelperAI/backend/.env
```

✅ **Your file is in the correct location!** It just needs content.

## Quick Command to Create It

Run this command to create a basic `.env` file:

```bash
cd backend
echo "PORT=8000" > .env
```

Then edit it to add MONGO_URI if you have MongoDB Atlas set up.

