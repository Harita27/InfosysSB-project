# 🚀 Supabase Setup Guide for Medical Dashboard

This guide will walk you through setting up Supabase for the Medical Dashboard project.

## Step 1: Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **Start your project** and sign up (GitHub, Google, or email)
3. Once logged in, click **New Project**
4. Fill in the project details:
   - **Name:** `medical-dashboard`
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your location
   - **Pricing Plan:** Free (sufficient for development)
5. Click **Create new project** and wait 2-3 minutes for setup

## Step 2: Run Database Schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the `supabase-schema.sql` file from your project folder
4. Copy **ALL** the SQL code from that file
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see: "Success. No rows returned"

### ✅ Verify Tables Created

Click **Table Editor** in the left sidebar. You should see these tables:
- users
- doctors
- patients
- doctor_patients
- appointments
- medical_records

## Step 3: Get Your API Credentials

1. Click **Settings** (gear icon) in the left sidebar
2. Click **API** under Project Settings
3. You'll see two important values:

### Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```
Copy this - you'll need it for `SUPABASE_URL`

### Project API Keys
Find the **anon/public** key (starts with `eyJ...`)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Copy this - you'll need it for `SUPABASE_KEY`

⚠️ **Important:** Use the **anon** key, NOT the service_role key in your `.env` file

## Step 4: Configure Environment Variables

1. In your project root, create a `.env` file (copy from `.env.example`)
2. Add your Supabase credentials:

```env
PORT=5000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-public-key-here
JWT_SECRET=change_this_to_a_random_string_for_security
NODE_ENV=development
```

### Generate a secure JWT_SECRET:
You can use this command in PowerShell:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

## Step 5: Install Dependencies & Run

```powershell
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..

# Run backend (Terminal 1)
npm run dev

# Run frontend (Terminal 2)
cd client
npm start
```

## 🎯 Testing Your Setup

### 1. Check Backend Connection
Open: http://localhost:5000/api/health
You should see: `{"status":"OK","message":"Medical Dashboard API is running"}`

### 2. Check Supabase Connection
Look at your backend terminal. You should see:
```
✅ Supabase Connected
🚀 Server running on port 5000
```

### 3. Register a Test User
1. Open http://localhost:3000
2. Click **Register here**
3. Create a test account as a Doctor or Patient
4. After registration, you should be redirected to the dashboard

### 4. Verify in Supabase
1. Go to your Supabase dashboard
2. Click **Table Editor** > **users**
3. You should see your newly created user!

## 🔍 Viewing Your Data

### Using Supabase Dashboard
- Go to **Table Editor** to browse tables
- Click on any table to see its data
- You can manually add, edit, or delete records

### Using SQL Editor
Run queries like:
```sql
-- View all users
SELECT * FROM users;

-- View doctors with their user info
SELECT d.*, u.first_name, u.last_name, u.email 
FROM doctors d
JOIN users u ON d.user_id = u.id;

-- View appointments with patient and doctor names
SELECT 
  a.appointment_date,
  a.reason,
  a.status,
  p_user.first_name || ' ' || p_user.last_name as patient_name,
  d_user.first_name || ' ' || d_user.last_name as doctor_name
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN users p_user ON p.user_id = p_user.id
JOIN doctors d ON a.doctor_id = d.id
JOIN users d_user ON d.user_id = d_user.id;
```

## 🛡️ Security Notes

1. **Never commit your `.env` file** - It's in `.gitignore` for safety
2. **Use the anon key** - The service_role key bypasses all security
3. **Row Level Security (RLS)** - Already enabled on all tables
4. **API policies** - Configured to allow backend operations

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure your `.env` file exists in the root directory
- Check that `SUPABASE_URL` and `SUPABASE_KEY` are set correctly
- Restart the backend server after changing `.env`

### "PGRST116 error" or "relation does not exist"
- The SQL schema wasn't run properly
- Go back to SQL Editor and run the `supabase-schema.sql` again
- Make sure you copied ALL the code

### "Invalid API key"
- Double-check you copied the correct anon/public key
- Make sure there are no extra spaces or line breaks
- The key should start with `eyJ`

### Connection timeout
- Check your internet connection
- Verify the SUPABASE_URL is correct
- Make sure your Supabase project is active (not paused)

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🎉 Next Steps

Once everything is working:
1. Create test doctor and patient accounts
2. Book an appointment
3. Create a medical record
4. Explore all dashboard features
5. Check the data in Supabase Table Editor

Happy coding! 🏥💻
