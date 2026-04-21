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
