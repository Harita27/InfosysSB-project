# 🗄️ Database Schema Visualization

## Entity Relationship Diagram

```
┌─────────────────────┐
│       USERS         │
├─────────────────────┤
│ id (PK)            │ ← UUID Primary Key
│ email (unique)     │
│ password (hashed)  │
│ role               │ ← 'doctor' or 'patient'
│ first_name         │
│ last_name          │
│ phone              │
│ created_at         │
└──────┬──────────────┘
       │
       ├─────────────────────────────┐
       │                             │
       ▼                             ▼
┌─────────────────┐          ┌──────────────────┐
│    DOCTORS      │          │    PATIENTS      │
├─────────────────┤          ├──────────────────┤
│ id (PK)        │◄─────┐   │ id (PK)         │
│ user_id (FK)   │      │   │ user_id (FK)    │
│ license_number │      │   │ date_of_birth   │
│ specialization │      │   │ gender          │
│ description    │      │   │ blood_group     │
│ qualifications │      │   │ symptoms (JSON) │
│ experience     │      │   │ medical_history │
│ availability   │      │   │ allergies       │
│ consultation_fee│     │   │ assigned_doctor │─┐
│ updated_at     │      │   │ updated_at      │ │
└────────┬────────┘      │   └────────┬─────────┘ │
         │               │            │           │
         │               │            │           │
         │    ┌──────────┴──────┐     │           │
         │    │ DOCTOR_PATIENTS │     │           │
         └───►│ (Junction Table)│◄────┘           │
              ├─────────────────┤                 │
              │ id (PK)         │                 │
              │ doctor_id (FK)  │                 │
              │ patient_id (FK) │                 │
              │ created_at      │                 │
              └─────────────────┘                 │
                                                  │
         ┌────────────────────────────────────────┘
         │
         │
    ┌────▼──────────────┐
    │   APPOINTMENTS    │
    ├───────────────────┤
    │ id (PK)          │
    │ patient_id (FK)  │
    │ doctor_id (FK)   │
    │ appointment_date │
    │ reason           │
    │ status           │ ← 'scheduled', 'completed', 'cancelled'
    │ notes            │
    │ created_at       │
    └───────────────────┘
         │
         │
    ┌────▼──────────────┐
    │ MEDICAL_RECORDS   │
    ├───────────────────┤
    │ id (PK)          │
    │ patient_id (FK)  │
    │ doctor_id (FK)   │
    │ diagnosis        │
    │ prescription     │ ← JSON array of medicines
    │ lab_reports      │ ← JSON array of reports
    │ doctor_notes     │
    │ follow_up_date   │
    │ created_at       │
    └───────────────────┘
```

## Relationships Explained

### 1. Users → Doctors/Patients (1:1)
- Each user has ONE role (doctor or patient)
- One user record creates one doctor OR one patient profile
- `user_id` in doctors/patients links back to users table

### 2. Doctors ↔ Patients (Many:Many)
- One doctor can have many patients
- One patient can see multiple doctors
- Junction table `doctor_patients` handles the relationship
- Patient also has `assigned_doctor_id` for primary doctor

### 3. Appointments (Many:One:One)
- Many appointments per doctor
- Many appointments per patient
- Links both doctor and patient for each consultation

### 4. Medical Records (Many:One:One)
- Many records per patient (health history)
- Many records created by each doctor
- Contains diagnosis, prescriptions, and notes

## Field Details

### JSON/JSONB Fields

These fields store structured data as JSON:

#### `patients.symptoms`
```json
[
  {
    "description": "Fever and headache",
    "severity": "moderate",
    "date": "2025-12-01T10:00:00Z"
  }
]
```

#### `patients.medical_history`
```json
[
  {
    "condition": "Type 2 Diabetes",
    "diagnosedDate": "2020-05-15",
    "notes": "Controlled with medication"
  }
]
```

#### `medical_records.prescription`
```json
[
  {
    "medicine": "Amoxicillin",
    "dosage": "500mg",
    "duration": "7 days",
    "instructions": "Take with food"
  }
]
```

#### `medical_records.lab_reports`
```json
[
  {
    "testName": "Blood Sugar",
    "result": "110 mg/dL",
    "date": "2025-12-01",
    "fileUrl": "https://..."
  }
]
```

### Array Fields

#### `doctors.qualifications`
```sql
ARRAY['MBBS', 'MD', 'Fellowship in Cardiology']
```

#### `patients.allergies`
```sql
ARRAY['Penicillin', 'Peanuts', 'Latex']
```

## Indexes for Performance

```sql
-- User lookups
idx_users_email ON users(email)
idx_users_role ON users(role)

-- Profile lookups
idx_doctors_user_id ON doctors(user_id)
idx_patients_user_id ON patients(user_id)

-- Relationship queries
idx_doctor_patients_doctor ON doctor_patients(doctor_id)
idx_doctor_patients_patient ON doctor_patients(patient_id)

-- Appointment queries
idx_appointments_patient ON appointments(patient_id)
idx_appointments_doctor ON appointments(doctor_id)
idx_appointments_date ON appointments(appointment_date)

-- Medical record queries
idx_medical_records_patient ON medical_records(patient_id)
idx_medical_records_doctor ON medical_records(doctor_id)
```

## Common Query Patterns

### Get Doctor Profile with User Info
```sql
SELECT d.*, u.first_name, u.last_name, u.email, u.phone
FROM doctors d
JOIN users u ON d.user_id = u.id
WHERE u.id = 'user-uuid-here';
```

### Get All Patients for a Doctor
```sql
SELECT p.*, u.first_name, u.last_name, u.email
FROM doctor_patients dp
JOIN patients p ON dp.patient_id = p.id
JOIN users u ON p.user_id = u.id
WHERE dp.doctor_id = 'doctor-uuid-here';
```

### Get Appointments with Full Details
```sql
SELECT 
  a.*,
  pu.first_name || ' ' || pu.last_name as patient_name,
  du.first_name || ' ' || du.last_name as doctor_name,
  d.specialization
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN users pu ON p.user_id = pu.id
JOIN doctors d ON a.doctor_id = d.id
JOIN users du ON d.user_id = du.id
WHERE a.appointment_date >= NOW()
ORDER BY a.appointment_date;
```

### Get Patient Medical History
```sql
SELECT 
  mr.*,
  du.first_name || ' ' || du.last_name as doctor_name,
  d.specialization
FROM medical_records mr
JOIN doctors d ON mr.doctor_id = d.id
JOIN users du ON d.user_id = du.id
WHERE mr.patient_id = 'patient-uuid-here'
ORDER BY mr.created_at DESC;
```

## Data Types Reference

| Type | Usage | Example |
|------|-------|---------|
| UUID | Primary keys, foreign keys | `550e8400-e29b-41d4-a716-446655440000` |
| VARCHAR(n) | String with max length | `VARCHAR(255)` |
| TEXT | Unlimited text | Long descriptions |
| INTEGER | Whole numbers | Experience years: `5` |
| DECIMAL(10,2) | Prices/money | Consultation fee: `150.00` |
| DATE | Date only | `2025-12-01` |
| TIMESTAMP WITH TIME ZONE | Date and time | `2025-12-01 10:30:00+00` |
| JSONB | Structured data | Arrays of objects |
| TEXT[] | Array of strings | `{'item1', 'item2'}` |

## Security Features

### Row Level Security (RLS)
- Enabled on all tables
- Policies configured for service role access
- Prevents unauthorized data access

### Password Security
- Passwords hashed with bcrypt (10 rounds)
- Never stored in plain text
- Hash strength: `$2a$10$...` format

### JWT Tokens
- 7-day expiration
- Contains userId and role
- Signed with JWT_SECRET

## Backup & Maintenance

### Automatic Backups
Supabase provides:
- Daily automated backups (retained 7 days on free tier)
- Point-in-time recovery
- Database snapshots

### Manual Export
```sql
-- Export all data as SQL
pg_dump -h db.xxxxx.supabase.co -U postgres medical-dashboard > backup.sql
```

---

**Visual Guide Complete!** 🎨
Use this as a reference when working with the database structure.
