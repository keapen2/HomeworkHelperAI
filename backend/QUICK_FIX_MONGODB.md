# Quick Fix: MongoDB Connection Error

## The Problem

You're getting: `connect ECONNREFUSED ::1:27017` because:
- The `.env` file is empty (no `MONGO_URI` set)
- The script is trying to connect to `localhost:27017` (no local MongoDB)

## Solution: Set Up MongoDB Atlas (5 minutes)

### Option 1: Quick Setup (Recommended)

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** (free account)
3. **Create a free cluster** (M0 - Free tier)
4. **Create database user**:
   - Go to Database Access → Add New Database User
   - Username: `admin`
   - Password: `admin123` (or your choice)
   - Click Add User
5. **Whitelist IP**:
   - Go to Network Access → Add IP Address
   - Click "Add Current IP Address"
   - Click Confirm
6. **Get connection string**:
   - Go to Database → Connect → Connect your application
   - Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
7. **Update .env file**:
   ```bash
   cd backend
   ```
   Open `.env` file and add:
   ```env
   MONGO_URI=mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/homeworkhelper?retryWrites=true&w=majority
   PORT=8000
   ```
   **Replace**:
   - `admin` with your database username
   - `admin123` with your database password  
   - `cluster0.xxxxx.mongodb.net` with your actual cluster URL
8. **Test connection**:
   ```bash
   npm run seed
   ```

### Option 2: Skip MongoDB (For MVP Demo)

**You don't need MongoDB for the demo!** The app works perfectly with mock data:

- ✅ App shows data (mock data)
- ✅ No errors shown
- ✅ Ready for demo

**To skip MongoDB**:
1. Just don't run `npm run seed`
2. The app will automatically use mock data
3. Everything works perfectly!

## What I Fixed

✅ **Better error messages** - Now shows helpful instructions
✅ **Connection options** - Same as server.js for consistency
✅ **Helpful tips** - Reminds you that mock data works for MVP

## Test It Now

Run the seed script again:
```bash
cd backend
npm run seed
```

You'll now see helpful error messages with instructions!

## Example .env File

Create `backend/.env` with:

```env
MONGO_URI=mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/homeworkhelper?retryWrites=true&w=majority
PORT=8000
```

**Important**: Replace the values with your actual MongoDB Atlas connection string!

## Need Help?

See `SETUP_MONGODB.md` for detailed step-by-step instructions.

