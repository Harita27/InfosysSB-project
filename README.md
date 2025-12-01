# 🏥 Medical Dashboard - Healthcare Management System

A comprehensive role-based healthcare platform connecting doctors and patients through secure, feature-rich dashboards.

## 📋 Project Overview

The Medical Dashboard is a full-stack web application designed to streamline healthcare management by providing role-specific interfaces for doctors and patients. The system automatically identifies user roles upon login and redirects them to customized dashboards with relevant features and data access.

## ✨ Features

### 🔐 Authentication System
- Secure user registration and login
- Role-based access control (Doctor/Patient)
- JWT token-based authentication
- Automatic dashboard redirection based on role

### 👨‍⚕️ Doctor Dashboard
- **Profile Management**
  - View and update license information
  - Add/edit professional description
  - Set consultation fees and availability
  - Manage qualifications and experience

- **Patient Management**
  - View assigned patients
  - Access patient medical history
  - Track patient symptoms and conditions

- **Medical Records**
  - Create detailed medical records
  - Write prescriptions with multiple medications
  - Add diagnosis and doctor notes
  - Schedule follow-up appointments

- **Appointments**
  - View all scheduled appointments
  - Update appointment status
  - Manage appointment notes

### 👤 Patient Dashboard
- **Profile Management**
  - Update personal information
  - Set blood group and date of birth
  - Manage allergy information

- **Symptoms Tracking**
  - Add new symptoms with severity levels
  - View symptom history
  - Track symptom progression

- **Medical History**
  - Maintain comprehensive medical history
  - Record past conditions and diagnoses
  - Add important medical notes

- **Doctor Communication**
  - Browse available doctors
  - View doctor specializations and fees
  - Book appointments with preferred doctors

- **Medical Records Access**
  - View prescriptions from doctors
  - Access diagnosis and treatment plans
  - Check follow-up appointments
  - Review lab reports and doctor suggestions

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **Supabase (PostgreSQL)** for database
- **Supabase JS Client** for database operations
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** 18.x
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** for styling

## 📁 Project Structure

```
Medical Dashboard/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Patient.js
│   │   ├── Appointment.js
│   │   └── MedicalRecord.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── doctors.js
│   │   ├── patients.js
│   │   ├── appointments.js
│   │   └── medicalRecords.js
│   ├── middleware/
│   │   └── auth.js
│   └── server.js
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── Navbar.css
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── DoctorDashboard.js
│   │   │   ├── PatientDashboard.js
│   │   │   ├── Auth.css
│   │   │   └── Dashboard.css
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Supabase account (free tier available at https://supabase.com)
- npm or yarn

### Step 1: Clone the Repository
```bash
cd "Medical Dashboard"
```

### Step 2: Install Dependencies

#### Backend Dependencies
```powershell
npm install
```

#### Frontend Dependencies
```powershell
cd client
npm install
cd ..
```

### Step 3: Set Up Supabase Database

1. **Create a Supabase Project:**
   - Go to https://supabase.com
   - Sign up / Log in
   - Create a new project
   - Wait for the project to be set up

2. **Run the Database Schema:**
   - Go to your Supabase Dashboard
   - Navigate to **SQL Editor**
   - Open the `supabase-schema.sql` file from the project root
   - Copy the entire content and paste it into the SQL Editor
   - Click **Run** to create all tables and relationships

3. **Get Your Supabase Credentials:**
   - Go to **Project Settings** > **API**
   - Copy the **Project URL** (SUPABASE_URL)
   - Copy the **anon/public key** (SUPABASE_KEY)

### Step 4: Environment Configuration

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` file with your Supabase credentials:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
JWT_SECRET=your_secure_jwt_secret_key_change_this
NODE_ENV=development
```

### Step 5: Run the Application

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```powershell
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd client
npm start
```
### Step 6: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health
- **Supabase Dashboard:** https://app.supabase.com (to view your data)

# Start both servers (you may need to set this up with concurrently)
npm run dev
```

### Step 6: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## 👥 Usage Guide

### For Patients

1. **Register** as a patient with your email and password
2. **Complete your profile** with personal information
3. **Add symptoms** to track your health
4. **Maintain medical history** for doctor reference
5. **Browse doctors** and book appointments
6. **View prescriptions** and medical records from doctors

### For Doctors

1. **Register** as a doctor with license number and specialization
2. **Update your profile** with professional information
3. **View assigned patients** and their medical history
4. **Manage appointments** with patients
5. **Create medical records** with diagnoses and prescriptions
6. **Track patient progress** and schedule follow-ups

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Protected API routes
- Secure password validation (minimum 6 characters)
## 📊 Database Schema (PostgreSQL via Supabase)

### Tables
- **users** - Authentication and basic user info
- **doctors** - Doctor-specific profiles and details
- **patients** - Patient-specific profiles and health data
- **doctor_patients** - Many-to-many relationship between doctors and patients
- **appointments** - Scheduled consultations
- **medical_records** - Diagnoses, prescriptions, and reports

### Key Features:
- UUID primary keys for all tables
- Foreign key relationships with cascade deletes
- JSONB fields for flexible data (symptoms, prescriptions, lab reports)
- Indexed columns for optimized queries
- Row Level Security (RLS) enabled
- Timestamp tracking (created_at, updated_at)
- Professional gradient theme
- User-friendly forms with validation

## 📊 Database Schema

### Collections
- **users** - Authentication and basic user info
- **doctors** - Doctor-specific profiles and details
- **patients** - Patient-specific profiles and health data
- **appointments** - Scheduled consultations
- **medicalrecords** - Diagnoses, prescriptions, and reports

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Doctor Routes
- `GET /api/doctors/profile` - Get doctor profile
- `PUT /api/doctors/profile` - Update doctor profile
- `GET /api/doctors/patients` - Get assigned patients
- `POST /api/doctors/patients/:id` - Add patient

### Patient Routes
- `GET /api/patients/profile` - Get patient profile
- `PUT /api/patients/profile` - Update patient profile
- `POST /api/patients/symptoms` - Add symptom
- `POST /api/patients/medical-history` - Add medical history
- `GET /api/patients/doctors` - Get all doctors

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get appointments
- `PUT /api/appointments/:id` - Update appointment

### Medical Records
- `POST /api/medical-records` - Create record (Doctor only)
- `GET /api/medical-records` - Get records
- `GET /api/medical-records/:id` - Get single record

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Support

For support, please open an issue in the repository or contact the development team.

## 🎯 Future Enhancements

- Video consultation feature
- File upload for lab reports
- SMS/Email notifications
- Payment integration
- Advanced analytics dashboard
- Multi-language support
- Mobile application
- Real-time chat between doctors and patients

---

**Built with ❤️ for better healthcare management**
