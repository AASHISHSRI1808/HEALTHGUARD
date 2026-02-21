# 🏥 Health Guard — AI-Powered Disease Prediction Platform

A full-stack healthcare web application with AI-based disease prediction, appointment booking, PDF reports, payment integration, and role-based dashboards.

---

## 🎯 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (React Router, Axios, Framer Motion) |
| Backend | Node.js + Express.js |
| ML Service | Python FastAPI |
| Database | MongoDB (Mongoose) |
| Payment | Razorpay |
| Email | Nodemailer (Gmail SMTP) |
| Auth | JWT (JSON Web Tokens) |
| PDF | PDFKit |

---

## 📁 Project Structure

```
healthguard/
├── frontend/               # React App
│   ├── public/
│   └── src/
│       ├── pages/          # All page components
│       ├── components/     # Shared components (Navbar)
│       ├── context/        # Auth Context
│       └── utils/          # API utility
│
├── backend/                # Node.js API Server
│   ├── models/             # MongoDB Models
│   ├── routes/             # API Routes
│   ├── middleware/         # Auth Middleware
│   └── services/           # PDF & Email Services
│
└── ml-service/             # Python FastAPI ML Service
    ├── main.py             # FastAPI app
    ├── train_models.py     # Model training script
    ├── saved_models/       # Trained .pkl files (auto-created)
    └── datasets/           # Place your CSV datasets here
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- Python 3.9+
- MongoDB (local or Atlas)
- Gmail account (for email)
- Razorpay account (for payments)

---

### 1️⃣ Clone & Setup Backend

```bash
cd healthguard/backend
npm install

# Copy and edit environment variables
cp .env.example .env
# Edit .env with your credentials (see below)

npm run dev
# Runs on http://localhost:5000
```

### 2️⃣ Setup ML Service

```bash
cd healthguard/ml-service

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Train models — place CSV datasets in ./datasets/
# Datasets: heart.csv, liver.csv, parkinson.csv (from UCI/Kaggle)
python train_models.py

# Start FastAPI server
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

> ⚠️ If models are not found, the ML service uses demo random predictions so you can still test the full flow.

### 3️⃣ Setup Frontend

```bash
cd healthguard/frontend
npm install

# Start React app
npm start
# Runs on http://localhost:3000
```

---

## 🔐 Environment Variables (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthguard
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d

# HARDCODED ADMIN
ADMIN_EMAIL=admin@healthguard.com
ADMIN_PASSWORD=Admin@123

# Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password     # Gmail App Password (not regular password)
EMAIL_FROM=Health Guard <noreply@healthguard.com>

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX

# Python ML Service
ML_SERVICE_URL=http://localhost:8000

# Frontend
FRONTEND_URL=http://localhost:3000
```

---

## 🧠 ML Models

| Disease | Algorithm | Dataset |
|---------|-----------|---------|
| Heart Disease | Random Forest | UCI Heart Disease Dataset |
| Liver Disease | XGBoost | ILPD (Indian Liver Patient Dataset) |
| Parkinson's | SVM (kernel=rbf, probability=True) | UCI Parkinson's Dataset |

**Get Datasets from Kaggle:**
- Heart: https://www.kaggle.com/datasets/ronitf/heart-disease-uci
- Liver: https://www.kaggle.com/datasets/uciml/indian-liver-patient-records
- Parkinson's: https://www.kaggle.com/datasets/vikasukani/parkinsons-disease-data-set

Place CSV files in `ml-service/datasets/` then run `python train_models.py`

---

## 👥 User Roles

### Patient
- Register & login
- Run disease predictions (Heart / Liver / Parkinson's)
- View detailed prediction reports
- Download PDF reports
- Receive report via email
- Find & book doctor appointments
- Pay via Razorpay
- View all appointments & reports

### Doctor
- Register (requires admin approval)
- Login after approval
- View all patient appointments
- See patient prediction details & PDF
- Update appointment status
- Run predictions for patients directly

### Admin (Hardcoded)
- Email: `admin@healthguard.com`
- Password: `Admin@123`
- Approve / Reject doctor registrations
- View all patients, predictions, doctors
- Platform analytics dashboard

---

## 🔄 Complete User Flow

```
1. Patient registers/logs in
2. Selects disease type (Heart / Liver / Parkinson's)
3. Fills clinical parameter form
4. Data → Node backend → Python ML service
5. ML returns: Prediction, Probability %, Risk Level
6. System auto-generates detailed PDF report
7. PDF sent to patient email
8. Patient views results + recommendations
9. System suggests specialist doctor
10. Patient browses & selects doctor
11. Books appointment date/time
12. Razorpay payment processed
13. Appointment confirmed → Confirmation email sent
14. Doctor Dashboard shows: Patient details, Prediction result, PDF report
15. Doctor can view/download report and update appointment status
```

---

## 🌐 API Endpoints

### Auth
```
POST   /api/auth/register          Patient registration
POST   /api/auth/login             Login (patient/doctor/admin)
POST   /api/auth/doctor-register   Doctor registration
GET    /api/auth/me                Get current user
```

### Predictions
```
POST   /api/predictions            Create prediction
GET    /api/predictions            Get user predictions
GET    /api/predictions/:id        Get single prediction
GET    /api/predictions/:id/pdf    Download PDF report
```

### Doctors
```
GET    /api/doctors                List approved doctors (with filters)
GET    /api/doctors/:id            Doctor details
GET    /api/doctors/dashboard/appointments  Doctor's appointments
GET    /api/doctors/dashboard/stats         Doctor stats
PUT    /api/doctors/appointments/:id/status Update status
```

### Appointments
```
POST   /api/appointments           Book appointment
GET    /api/appointments           Get user appointments
GET    /api/appointments/:id       Single appointment
POST   /api/appointments/:id/confirm  Confirm after payment
DELETE /api/appointments/:id/cancel   Cancel appointment
```

### Payments
```
POST   /api/payments/create-order  Create Razorpay order
POST   /api/payments/verify        Verify payment signature
```

### Admin
```
GET    /api/admin/dashboard        Stats
GET    /api/admin/doctors          All doctors (filter by status)
PUT    /api/admin/doctors/:id/approve  Approve doctor
PUT    /api/admin/doctors/:id/reject   Reject doctor
GET    /api/admin/users            All patients
GET    /api/admin/predictions      All predictions
```

---

## 📧 Email Templates

| Trigger | Email Sent |
|---------|-----------|
| Prediction completed | PDF report to patient |
| Doctor approved | Approval notification to doctor |
| Doctor rejected | Rejection notification with reason |
| Appointment confirmed | Confirmation with details & Google Maps link |

---

## 💳 Razorpay Test Cards

```
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits

UPI: success@razorpay (test)
```

---

## 🐛 Troubleshooting

**ML Service not responding?**
→ The backend falls back to demo predictions automatically. Your app still works.

**Email not sending?**
→ Use Gmail App Password (not your regular Gmail password).
→ Enable 2FA on Gmail, then go to: Google Account → Security → App Passwords

**MongoDB connection failed?**
→ Make sure MongoDB is running: `mongod` or use MongoDB Atlas free tier.

**Razorpay payment not working?**
→ Make sure to use TEST mode keys from Razorpay Dashboard.

---

## 🏗️ Database Schema

```
Users       { name, email, password, mobile, age, gender, bloodGroup, role }
Doctors     { userId, name, email, mciNumber, specialization, experience, hospitalName, city, state, status, rating }
Predictions { userId, diseaseType, inputParameters, result{prediction, probability, riskLevel}, recommendations, reportId }
Appointments{ patientId, doctorId, predictionId, appointmentDate, timeSlot, status, paymentStatus, amount }
```

---

## 📸 Pages Overview

| Page | Route | Access |
|------|-------|--------|
| Landing | / | Public |
| Login | /login | Public |
| Register | /register | Public |
| Doctor Register | /doctor-register | Public |
| Patient Dashboard | /dashboard | Patient |
| Prediction | /predict | Patient + Doctor |
| Prediction Result | /prediction-result/:id | Patient + Doctor |
| Find Doctors | /doctors | Patient |
| Book Appointment | /book-appointment/:id | Patient |
| My Appointments | /appointments | Patient |
| My Reports | /reports | Patient |
| Admin Dashboard | /admin | Admin only |
| Doctor Dashboard | /doctor-dashboard | Doctor only |

---

## ✅ Final Year Project Checklist

- [x] React Frontend with interactive UI
- [x] Node.js + Express Backend
- [x] Python FastAPI ML Microservice
- [x] Heart Disease → Random Forest
- [x] Liver Disease → XGBoost
- [x] Parkinson's → SVM (probability=True)
- [x] JWT Authentication (Patient / Doctor / Admin)
- [x] Hardcoded Admin Login
- [x] Admin Doctor Approval System
- [x] Auto PDF Generation (PDFKit)
- [x] Email Reports (Nodemailer)
- [x] Razorpay Payment Integration
- [x] Doctor Suggestion by Specialization
- [x] Appointment Booking System
- [x] Doctor Dashboard with Patient Reports
- [x] MongoDB Database
- [x] Role-Based Access Control

---

*Built with ❤️ for Final Year Project 2025–26*
