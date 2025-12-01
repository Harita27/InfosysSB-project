# 🚀 Quick Start Guide - Medical Dashboard with Supabase

## What Changed?
The project now uses **Supabase (PostgreSQL)** instead of MongoDB for better scalability, built-in authentication features, and real-time capabilities.

## 📋 Prerequisites Checklist
- ✅ Node.js installed (v14+)
- ✅ npm installed
- ✅ Supabase account (free at https://supabase.com)

## ⚡ Quick Setup (5 minutes)

### 1️⃣ Create Supabase Project
```
1. Go to https://supabase.com → Sign up
2. Create new project → Wait 2-3 minutes
3. Go to SQL Editor → Paste content from supabase-schema.sql → Run
4. Go to Settings → API → Copy URL and anon key
```

### 2️⃣ Configure Environment
Create `.env` file in root directory:
```env
PORT=5000
SUPABASE_URL=your_project_url_here
SUPABASE_KEY=your_anon_key_here
JWT_SECRET=generate_a_random_string_here
NODE_ENV=development
```

### 3️⃣ Install & Run
```powershell
# Install all dependencies
npm install
cd client
npm install
cd ..

# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend  
cd client
npm start
```

### 4️⃣ Test It
- Backend: http://localhost:5000/api/health
- Frontend: http://localhost:3000
- Register as Doctor or Patient and explore!

## 📁 Key Files

| File | Purpose |
|------|---------|
| `supabase-schema.sql` | Database schema (run this in Supabase SQL Editor) |
| `SUPABASE_SETUP.md` | Detailed setup instructions |
| `backend/config/supabase.js` | Supabase connection configuration |
| `.env.example` | Template for environment variables |

## 🔄 Migration from MongoDB

### What's Different?
- ✅ No local database needed
- ✅ Tables instead of collections
- ✅ SQL instead of MongoDB queries
- ✅ Built-in admin dashboard at Supabase
- ✅ Real-time subscriptions available
- ✅ Automatic backups

### Database Structure
```
users (authentication & basic info)
  ↓
doctors ← → patients (via doctor_patients junction table)
  ↓           ↓
appointments ← →
  ↓           ↓
medical_records
```

## 🎯 Test Accounts to Create

### Doctor Account
```
Role: Doctor
Email: doctor@test.com
Password: doctor123
License: DOC-12345
Specialization: General Medicine
```

### Patient Account
```
Role: Patient
Email: patient@test.com
Password: patient123
```

## 🔍 View Your Data

### Option 1: Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Click "Table Editor"
4. Browse/edit any table

### Option 2: SQL Queries
Use SQL Editor in Supabase:
```sql
-- View all users
SELECT * FROM users;

-- View doctors with user details
SELECT d.*, u.email, u.first_name, u.last_name 
FROM doctors d
JOIN users u ON d.user_id = u.id;
```

## 🛠️ Common Tasks

### Add Test Data
Use Supabase Table Editor or SQL Editor to insert test data directly.

### Reset Database
```sql
-- Warning: This deletes all data!
TRUNCATE users, doctors, patients, doctor_patients, 
         appointments, medical_records CASCADE;
```

### View Logs
Check your backend terminal for API logs and Supabase connection status.

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing Supabase environment variables" | Check your `.env` file exists and has correct values |
| "PGRST116 error" | Run the SQL schema in Supabase SQL Editor |
| "Invalid API key" | Use the **anon** key, not service_role |
| Connection timeout | Check internet connection and Supabase project status |

## 📚 Learn More

- **Supabase Docs:** https://supabase.com/docs
- **SQL Tutorial:** https://www.postgresql.org/docs/current/tutorial.html
- **Project README:** See `README.md` for full documentation
- **Detailed Setup:** See `SUPABASE_SETUP.md`

## 🎉 Success Indicators

You're all set when you see:
- ✅ `✅ Supabase Connected` in backend terminal
- ✅ `🚀 Server running on port 5000` in backend terminal
- ✅ `Compiled successfully!` in frontend terminal
- ✅ Login page loads at http://localhost:3000
- ✅ Can register and login as doctor/patient

---

**Need Help?** Check `SUPABASE_SETUP.md` for detailed instructions!
