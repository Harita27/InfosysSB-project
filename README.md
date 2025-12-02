# 💊 Online Medication & Prescription Tracker

> **A comprehensive healthcare management system for medication tracking, prescription management, and pharmacy inventory control**

Managing medication schedules, doctor prescriptions, and pharmacy stock can be challenging. This platform connects doctors, patients, pharmacists, and administrators to ensure patients never miss a dose and pharmacies maintain proper inventory.

---

## 🎯 Key Features

### 🔐 **Multi-Role Authentication**
- **4 User Roles**: Patient, Doctor, Pharmacist, Admin
- JWT-based secure authentication
- Role-based dashboards and permissions

### 💊 **Prescription Management**
- Doctors issue digital prescriptions
- Patients view and track prescriptions
- Prescription lifecycle (pending → approved → expired)
- Download prescriptions as PDF

### ⏰ **Medication Reminders**
- Set custom reminder schedules
- Track medication adherence
- Mark doses as taken/missed/snoozed
- Real-time adherence statistics

### 🏥 **Pharmacy Inventory**
- Stock level management
- Low-stock automated alerts
- Expiry date tracking
- Batch management and pricing

### 📊 **Analytics Dashboard**
- Patient: Adherence rates and active prescriptions
- Doctor: Patient stats and prescription tracking
- Pharmacist: Inventory analytics and alerts
- Admin: System-wide statistics

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, Supabase (PostgreSQL), JWT  
**Frontend:** React 18, React Router, Axios, Modern Dark UI  
**Database:** PostgreSQL with 9 interconnected tables

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Harita27/InfosysSB-project.git
cd InfosysSB-project
npm install
cd client && npm install && cd ..
```

### 2. Setup Supabase
- Create project at [supabase.com](https://supabase.com)
- Run `supabase-schema-updated.sql` in SQL Editor
- Get URL and anon key from Settings → API

### 3. Configure Environment
Create `.env` file:
```env
PORT=5000
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 4. Run Application
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

**Access:** http://localhost:3000

---

## 📱 User Roles

| Role | Key Features |
|------|-------------|
| 👨‍⚕️ **Doctor** | Issue prescriptions, track patient adherence, manage patient list |
| 🧑‍🦱 **Patient** | View prescriptions, set reminders, track adherence, download PDFs |
| 💊 **Pharmacist** | Manage inventory, stock alerts, expiry tracking, batch management |
| 👨‍💼 **Admin** | System analytics, user management, system health monitoring |

---

## 🗄️ Database Schema

**Core Tables:**
- `users` → Role-based user management
- `doctors`, `patients`, `pharmacists` → Profile extensions
- `prescriptions` → Doctor-patient prescription records
- `medicines` → Medication details per prescription
- `reminders` → Patient medication reminders
- `inventory` → Pharmacy stock management
- `reports` → Analytics and tracking data

---

## 📚 API Endpoints

### Authentication
```http
POST /api/auth/register  # Register new user
POST /api/auth/login     # User login
```

### Prescriptions
```http
GET    /api/prescriptions              # Get prescriptions (filtered by role)
POST   /api/prescriptions              # Create new prescription (doctor)
PATCH  /api/prescriptions/:id/status   # Update status
DELETE /api/prescriptions/:id          # Delete prescription
```

### Reminders & Adherence
```http
GET    /api/medicines/reminders        # Get user reminders
POST   /api/medicines/reminders        # Create reminder
PATCH  /api/medicines/reminders/:id    # Update status (taken/missed)
GET    /api/medicines/adherence        # Get adherence stats
```

### Inventory Management
```http
GET    /api/inventory         # Get inventory items
POST   /api/inventory         # Add drug to stock
PATCH  /api/inventory/:id     # Update stock item
DELETE /api/inventory/:id     # Remove item
GET    /api/inventory/alerts  # Low stock alerts
GET    /api/inventory/expired # Expired medicines
```

### Analytics
```http
GET  /api/analytics/dashboard            # Role-based dashboard stats
GET  /api/analytics/adherence/:patientId # Patient adherence report
POST /api/analytics/save                 # Save custom report
```

---

## 📅 Project Milestones

| Week | Milestone | Status |
|------|-----------|--------|
| 1-2 | Authentication & Role Setup | ✅ Complete |
| 3-4 | Prescription Management | ✅ Complete |
| 5 | Medication Tracker & Reminders | ✅ Complete |
| 6-7 | Pharmacy Inventory Management | ✅ Complete |
| 8 | Analytics & Reporting | ✅ Complete |

---

## 🎨 UI Features

- 🌑 **Modern Dark Theme** with neon green accents
- 📱 **Fully Responsive** design
- 🔔 **Real-time Notifications** for reminders
- 📊 **Data Visualization** with statistics cards
- 🎯 **Role-based Navigation** menus

---

## 🔒 Security

✅ bcrypt password encryption  
✅ JWT token authentication  
✅ Role-based access control (RBAC)  
✅ Row Level Security (RLS) policies  
✅ Input validation & sanitization

---

## 📖 Documentation

- `SUPABASE_SETUP.md` - Complete Supabase guide
- `QUICKSTART.md` - 5-minute setup guide
- `DATABASE_SCHEMA.md` - Schema visualization
- `MIGRATION_SUMMARY.md` - Migration guide

---

## 🚧 Future Enhancements

- [ ] Email/SMS notifications
- [ ] PDF prescription generation
- [ ] Drug interaction API integration
- [ ] Mobile app (React Native)
- [ ] Telemedicine video calls
- [ ] Insurance integration
- [ ] Multi-language support

---

## 👥 Team

**Project Owner:** [Harita27](https://github.com/Harita27)  
**Contributors:** [Divyesh-1306](https://github.com/Divyesh-1306)

---

## 📄 License

MIT License - See LICENSE for details

---

## 🆘 Support

**Issues:** [GitHub Issues](https://github.com/Harita27/InfosysSB-project/issues)  
**Docs:** Check `/docs` folder

---

**Built with ❤️ for better healthcare management**

🌟 **Star this repo** if you found it helpful!
