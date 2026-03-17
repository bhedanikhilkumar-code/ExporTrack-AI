# 🚢 ExporTrack AI

**Export Logistics Document Management System**

A modern, enterprise-grade SaaS platform for managing export shipments, tracking documents, and streamlining logistics operations with AI-powered insights.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)
![Vite](https://img.shields.io/badge/Vite-5-646cff)

---

## 📋 Overview

ExporTrack AI is a comprehensive export logistics document management system designed for shipping companies, freight forwarders, and export operations teams. It provides real-time shipment tracking, automated document verification, team collaboration, and analytics dashboard — all in one platform.

**Problem Solved:** Export logistics teams often struggle with fragmented document workflows, manual status updates, and lack of visibility into shipment progress. ExporTrack AI centralizes all export operations with intelligent automation.

---

## ✨ Key Features

### 🔐 Authentication & User Management
- **Google OAuth** integration for seamless sign-in
- **Email authentication** with form-based registration
- **Demo Mode** vs **Real User Mode** — try the app instantly without account creation

### 📦 Shipment Management
- **Create, edit, and track** export shipments
- **Automated status flow**: Draft → Booked → In Transit → Customs Clearance → Delivered
- **Smart automation** — status updates automatically based on documents and dates
- **Container & driver assignment** with real-time tracking

### 📄 Document Management
- **Multi-format upload**: PDF, JPG, PNG support
- **Mobile camera capture** for on-the-go uploads
- **Required document checklist**: Invoice, Packing List, Bill of Lading, Shipping Bill, Certificate of Origin, Insurance Papers, Customs Files
- **Document verification** with status: Pending, Verified, Missing, Rejected

### 🤖 AI-Powered Features
- **OCR Document Extraction** — automatically extract invoice numbers, dates, buyer names, shipment values
- **Delay Prediction** — AI estimates potential delays based on historical data
- **Compliance Copilot** — AI assistant for export regulations

### 👥 Team Collaboration
- **Role-Based Access Control (RBAC)**
  - **Admin**: Full access, user management, analytics
  - **Manager**: Create/edit shipments, invite users, view analytics
  - **Operations**: Create shipments, update tracking, manage documents
  - **Viewer**: Read-only access
- **Team workspace** with member management
- **Internal notes** for private team communication

### 📊 Analytics Dashboard
- **Live KPI Cards**: Total shipments, on-time rate, delayed units, lead time
- **Interactive Charts**:
  - Status Distribution (Pie Chart)
  - Monthly Shipments (Bar Chart)
  - Document Trends (Line Chart)
  - Active vs Completed (Donut Chart)
- **Real-time updates** when data changes

### 🔔 Notification System
- Missing document alerts
- Approval delay warnings
- Deadline reminders
- Shipment status updates

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, React Router v6 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Build Tool** | Vite |
| **State Management** | React Context + useReducer |
| **Data Persistence** | localStorage |
| **Charts** | Recharts |
| **Maps** | Leaflet + React Leaflet |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ExporTrack AI                        │
├─────────────────────────────────────────────────────────┤
│  Authentication Layer                                    │
│  ├── Google OAuth                                       │
│  └── Email/Password                                     │
├─────────────────────────────────────────────────────────┤
│  Core Features                                          │
│  ├── Shipment Management (CRUD)                         │
│  ├── Document Upload & Verification                      │
│  ├── Status Automation Engine                           │
│  ├── RBAC Permission System                             │
│  └── Notification Service                               │
├─────────────────────────────────────────────────────────┤
│  UI Layer                                               │
│  ├── Dashboard (KPIs + Charts)                         │
│  ├── Shipment Details                                   │
│  ├── Team Management                                    │
│  └── Analytics                                          │
├─────────────────────────────────────────────────────────┤
│  Data Layer                                             │
│  └── localStorage (mock backend)                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ExporTrack-AI.git

# Navigate to project directory
cd ExporTrack-AI

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Google OAuth (optional - for production)
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# App Configuration
VITE_APP_NAME=ExporTrack AI
VITE_APP_VERSION=1.0.0
```

> **Note:** The app works fully without Google OAuth. Demo mode provides instant access without authentication.

---

## 📖 Usage Guide

### 1. Login / Demo Mode
- Click **"Continue with Google"** or use email/password
- Select **Demo Mode** to explore without account

### 2. Create a Shipment
- Go to **Dashboard** → Click **"Add Shipment"**
- Fill in shipment details (ID, client, destination, date)
- Status automatically starts as **Draft**

### 3. Upload Documents
- Navigate to shipment details
- Upload required documents (Invoice, Bill of Lading, etc.)
- Documents trigger status automation

### 4. Track Progress
- View **Progress Bar** on shipment details
- Status auto-updates: Draft → Booked → In Transit → Customs → Delivered

### 5. Manage Team
- Go to **Profile & Team**
- Invite members with roles (Admin/Manager/Operations/Viewer)
- Admins can change roles and remove members

### 6. View Analytics
- Dashboard shows live charts and KPIs
- Charts update in real-time as data changes

---

## 🖼 Screenshots

| Dashboard | Shipment Details | Team Management |
|-----------|-----------------|----------------|
| ![Dashboard](https://placehold.co/600x400/1e293b/ffffff?text=Dashboard) | ![Shipment](https://placehold.co/600x400/1e293b/ffffff?text=Shipment+Details) | ![Team](https://placehold.co/600x400/1e293b/ffffff?text=Team+Management) |

---

## 💼 Use Cases

- **Freight Forwarders** — Track multiple shipments across carriers
- **Export Departments** — Manage compliance documents
- **Logistics Teams** — Coordinate with drivers and warehouses
- **Supply Chain Managers** — Monitor delivery performance

---

## ⚠️ Limitations

- **No real backend** — Data stored in browser localStorage only
- **No email delivery** — Notifications are in-app only
- **Demo data resets** — Clearing browser storage removes all data
- **No real shipping integration** — Mock carrier APIs

---

## 🔮 Future Improvements

- [ ] Backend integration (Node.js/PostgreSQL)
- [ ] Real email notifications
- [ ] Carrier API integrations (FedEx, DHL, UPS)
- [ ] PDF export functionality
- [ ] Multi-language support
- [ ] Mobile native apps (React Native)
- [ ] Webhook support for automation

---

## 👨‍💻 Author

**Your Name**
- Full-Stack Developer
- React & TypeScript Specialist
- Building SaaS products 🚀

---

## 📄 License

MIT License — feel free to use this project for learning and portfolio purposes.

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Built with ❤️ using React + TypeScript + Tailwind

</div>
