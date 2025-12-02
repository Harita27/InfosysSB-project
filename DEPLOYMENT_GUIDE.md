# Backend Deployment Guide

## The Problem You're Facing

Your Netlify frontend is trying to connect to `localhost:5000`, which **doesn't exist** in production. Localhost only works on your local machine.

## Solution: Deploy Your Backend

You have 3 options:

### Option 1: Render (Recommended - Free Tier)

1. **Go to**: https://render.com
2. **Sign up** with GitHub
3. **Create New** → **Web Service**
4. **Connect** your `InfosysSB-project` repository
5. **Configure**:
   - **Name**: `medical-dashboard-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. **Add Environment Variables**:
   ```
   PORT=5000
   SUPABASE_URL=https://werksfoxavxgdoedgzkt.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=production
   ```
7. **Deploy** - You'll get a URL like: `https://medical-dashboard-backend.onrender.com`

### Option 2: Railway (Also Free Tier)

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select** `InfosysSB-project`
5. **Add variables** (same as above)
6. **Settings** → Set **Root Directory**: `/backend`
7. Deploy automatically

### Option 3: Heroku (Requires Credit Card)

```bash
# Install Heroku CLI first
cd backend
heroku create medical-dashboard-api
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_KEY=your_key
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

## After Backend is Deployed

1. **Copy your backend URL** (e.g., `https://medical-dashboard-backend.onrender.com`)

2. **Update** `client/.env.production`:
   ```env
   REACT_APP_API_URL=https://medical-dashboard-backend.onrender.com/api
   ```

3. **Commit and push**:
   ```bash
   git add client/.env.production
   git commit -m "fix: Update production API URL"
   git push
   ```

4. **Netlify will auto-redeploy** with the correct backend URL

## Important: Update Database Schema

Your database tables might not exist yet! Run this in Supabase SQL Editor:

```sql
-- Go to: https://supabase.com/dashboard/project/werksfoxavxgdoedgzkt/sql/new
-- Copy and paste the entire content of: supabase-schema-updated.sql
-- Click "Run"
```

## Testing Locally

To test locally, you need to run BOTH:

**Terminal 1 (Backend)**:
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend)**:
```bash
cd client
npm start
```

Then visit: http://localhost:3000

## Why This Error Happened

❌ **Wrong**: Netlify frontend → localhost:5000 (doesn't exist in cloud)
✅ **Right**: Netlify frontend → Deployed backend URL

The browser blocks `localhost` access from deployed sites for security reasons (CORS policy).

## Quick Checklist

- [ ] Backend deployed to Render/Railway/Heroku
- [ ] Environment variables set on backend host
- [ ] Database schema run in Supabase
- [ ] `client/.env.production` updated with backend URL
- [ ] Changes committed and pushed to GitHub
- [ ] Netlify redeployed with new env variable
