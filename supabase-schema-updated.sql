-- Online Medication & Prescription Tracker - Complete Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if recreating
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctor_patients CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS pharmacists CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (Updated with address and medical_history)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('doctor', 'patient', 'pharmacist', 'admin')),
  phone VARCHAR(20),
  address TEXT,
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors table (keeping existing structure)
CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  description TEXT,
  qualifications TEXT[],
  experience INTEGER DEFAULT 0,
  availability VARCHAR(50) DEFAULT 'Available',
  consultation_fee DECIMAL(10, 2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table (keeping existing structure)
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
  blood_group VARCHAR(10),
  allergies TEXT[],
  assigned_doctor_id INTEGER REFERENCES doctors(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NEW: Pharmacists table
CREATE TABLE pharmacists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  pharmacy_name VARCHAR(255) NOT NULL,
  pharmacy_address TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NEW: Prescriptions table
CREATE TABLE prescriptions (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  file_url VARCHAR(500),
  issued_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NEW: Medicines table (linked to prescriptions)
CREATE TABLE medicines (
  id SERIAL PRIMARY KEY,
  prescription_id INTEGER REFERENCES prescriptions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  reminder_time TIME,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NEW: Reminders table
CREATE TABLE reminders (
  id SERIAL PRIMARY KEY,
  medicine_id INTEGER REFERENCES medicines(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed', 'snoozed')),
  reminder_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NEW: Inventory table (pharmacy stock management)
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  pharmacist_id INTEGER REFERENCES pharmacists(id) ON DELETE CASCADE,
  drug_name VARCHAR(255) NOT NULL,
  batch_no VARCHAR(100) NOT NULL,
  expiry_date DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  threshold INTEGER DEFAULT 10,
  price DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NEW: Reports table (analytics and tracking)
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('adherence', 'prescription', 'inventory', 'sales')),
  data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_pharmacists_user_id ON pharmacists(user_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_medicines_prescription ON medicines(prescription_id);
CREATE INDEX idx_reminders_medicine ON reminders(medicine_id);
CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_inventory_pharmacist ON inventory(pharmacist_id);
CREATE INDEX idx_inventory_expiry ON inventory(expiry_date);
CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_type ON reports(report_type);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacists ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow service role full access for backend operations)
CREATE POLICY "Allow service role full access to users" ON users FOR ALL USING (true);
CREATE POLICY "Allow service role full access to doctors" ON doctors FOR ALL USING (true);
CREATE POLICY "Allow service role full access to patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow service role full access to pharmacists" ON pharmacists FOR ALL USING (true);
CREATE POLICY "Allow service role full access to prescriptions" ON prescriptions FOR ALL USING (true);
CREATE POLICY "Allow service role full access to medicines" ON medicines FOR ALL USING (true);
CREATE POLICY "Allow service role full access to reminders" ON reminders FOR ALL USING (true);
CREATE POLICY "Allow service role full access to inventory" ON inventory FOR ALL USING (true);
CREATE POLICY "Allow service role full access to reports" ON reports FOR ALL USING (true);
