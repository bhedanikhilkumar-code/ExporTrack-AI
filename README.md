# ExporTrack AI

<p align="left">
  <a href="https://github.com/bhedanikhilkumar-code/ExporTrack-AI"><img src="https://img.shields.io/badge/Repo-GitHub-111827?style=for-the-badge&logo=github&logoColor=white" alt="Repo" /></a>
  <a href="https://exportrack-backend.onrender.com/"><img src="https://img.shields.io/badge/Backend%20API-Render-3B82F6?style=for-the-badge&logo=render&logoColor=white" alt="Backend API" /></a>
</p>

Full-stack logistics workflow platform for shipment tracking, document verification, and operational visibility.

## What This Project Solves
Export operations often involve fragmented shipment tracking, scattered document handling, and limited dashboard visibility.

ExporTrack AI brings these workflows into one system so teams can manage shipment records, track status changes, organize supporting documents, and monitor operational activity from a single interface.

## Key Capabilities
- Manage shipment workflows from draft to delivery
- Upload and verify export-related documents
- Centralize operational visibility through dashboard views
- Support team-oriented workflows with role-based access concepts
- Surface analytics and status trends for logistics activity
- Add location-aware context through map-oriented UI components

## Demo
- **Backend API:** https://exportrack-backend.onrender.com/
- **Frontend demo:** currently not linked publicly in this README while deployment is being refreshed.

## Tech Stack
### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- Leaflet / React Leaflet

### Backend
- Node.js
- Express
- MySQL
- dotenv
- cors

## Repository Structure
```text
ExporTrack-AI/
├── frontend/   # React + TypeScript client
├── backend/    # Express API and database connectivity
├── Dockerfile
├── schema.sql
└── vercel.json
```

## Feature Areas
### Shipment Operations
- Create and manage export shipments
- Track shipment stages and operational progress
- Organize shipment details through structured workflow states

### Document Workflows
- Upload supporting export documents
- Track verification states such as pending, verified, missing, or rejected
- Keep paperwork tied to shipment records

### Dashboards & Visibility
- View KPI-style summary cards
- Explore charts for shipment trends and document activity
- Monitor operational performance in one place

### Team Workflow Support
- Role-based access concepts for different user types
- Shared visibility for operational coordination
- A structure suited to logistics-focused collaboration

## Getting Started
### Prerequisites
- Node.js 18+
- npm
- MySQL database

### 1) Clone the repository
```bash
git clone https://github.com/bhedanikhilkumar-code/ExporTrack-AI.git
cd ExporTrack-AI
```

### 2) Run the backend
```bash
cd backend
npm install
npm start
```

### 3) Run the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```

## Environment Notes
This project contains separate frontend and backend applications. Configure environment variables according to the services you want to enable, especially database connectivity and any authentication-related settings.

## Why This Project Stands Out
ExporTrack AI focuses on a real business workflow instead of a generic CRUD demo. It shows domain-oriented product thinking, full-stack structure, operational dashboard design, and document-centric process handling.

## Roadmap Ideas
- Stronger backend validation and API documentation
- Real OCR / compliance integrations
- Notification workflows
- Multi-tenant organization support
- Audit logging and reporting improvements

## License
This repository currently does not expose a dedicated license file. Add one if you want to make reuse terms explicit.
