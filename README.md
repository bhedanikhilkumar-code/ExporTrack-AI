# ExporTrack-AI

The Intelligent Export Logistics Ecosystem
Next-generation document management and shipment tracking powered by AI.

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <br>
  <img src="https://img.shields.io/badge/MySQL-Managed-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

## 🌟 Vision

ExporTrack-AI is not just a document management system; it's a mission-critical platform for the modern global trade era. By unifying fragmented logistics workflows into a single, intelligent interface, we empower freight forwarders and export operations teams to move faster, reduce errors, and gain unprecedented visibility into their global supply chains.

**Try the Demo instantly!** Just click on "Demo Mode" on the login page to explore the full dashboard without creating an account.

---

## ✨ Enterprise-Grade Features

### 🛡️ Smart Logic & Security
- **Dynamic Auth Engine**: Seamless transition between Google OAuth, email verification, and a zero-friction "Demo Mode."
- **Role-Based Workspaces**: Granular permissions for Admins, Managers, and Operations, ensuring data integrity and security.
- **Intelligent Data Isolation**: Complete separation of development, demo, and production environments.

### 📦 Precision Logistics Control
- **Automated Lifecycle Sync**: Shipments evolve through `Draft` → `Booked` → `In Transit` → `Delivered` automatically based on real-time document triggers.
- **Advanced Container Tracking**: Manage complex multi-container shipments with detailed driver assignments and milestones.
- **Interactive Routing**: Geographic maps powered by Leaflet to visualize shipment paths across global ports.

### 🤖 The "AI" Advantage
- **Intelligent OCR**: Coming soon! Our engine is designed for automated data extraction from Invoices and Packing Lists.
- **Predictive Risk Engine**: Historical data analysis (Delay Prediction) to identify high-risk routes before they impact your SLAs.
- **Compliance Copilot**: Real-time validation checks against export checklists to prevent customs rejections.

### 📊 Tactical Intelligence
- **Live KPI Ecosystem**: Real-time heartbeat of your operations—tracking on-time delivery rates, document completion, and volume trends.
- **Rich Analytics Suite**: High-fidelity charts (Recharts) providing deep insights into monthly throughput and bottleneck detection.

---

## 🏗 System Architecture

```text
User --> React Frontend (Vite)
React Frontend --> Vercel API (Node.js)
Vercel API --> MySQL Database
React Frontend --> Google/Email Auth
```

### Core Components
- **Shipment Engine**: Automated lifecycle management.
- **Document Manager**: Smart upload and verification.
- **Analytics Dashboard**: Real-time KPI visualization.

---

## 🛠 Tech Stack

ExporTrack-AI is built on a modern, high-performance stack optimized for speed, scalability, and developer experience.

| Layer | Technologies |
| :--- | :--- |
| **Core** | `React 18`, `TypeScript`, `React Router v6` |
| **Design** | `Tailwind CSS`, `Framer Motion` (Micro-animations), `Lucide-react` |
| **Data & State** | `Context API`, `useReducer`, `SQL (MySQL)`, `Resend` (Emails) |
| **Visualization** | `Recharts`, `React-Leaflet`, `Lucide Icons` |
| **Infrastructure** | `Vite`, `Vercel Serverless`, `Node.js` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0 or higher)
- **MySQL Instance** (Local via XAMPP or Cloud)

### One-Command Setup
```bash
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

---

## 👨‍💻 Author

**Bheda Nikhilkumar**
- Full-Stack Developer & AI Specialist
- Building SaaS products for the Logistics Industry 🚀

---

**Note:** Ensure you run `schema.sql` on your MySQL server to initialize the required tables before starting the application for real data persistence.

---

<p align="center">
  **⭐ Star this repo if you found it helpful!**
</p>

<p align="center">
  Built with ❤️ by the ExporTrack-AI Team.
</p>


