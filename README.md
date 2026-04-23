# ExporTrack AI

Export document and shipment workflow platform for logistics teams.

## Overview
ExporTrack AI is a full-stack web application built for export operations, freight forwarding, and shipment documentation workflows. It brings shipment tracking, document verification, collaboration, analytics, and compliance-oriented workflows into one interface.

The project is designed to reduce fragmented logistics processes by giving teams a central place to manage shipments, upload supporting documents, track status changes, and monitor operational performance.

## Highlights
- Shipment lifecycle management from draft to delivery
- Document upload and verification workflows for export paperwork
- Team-oriented workspace with role-based access
- Dashboard analytics for shipment and document visibility
- OCR and AI-oriented workflow concepts for smarter operations
- Map and location-aware UI components for logistics context

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

## Core Features
### Shipment Operations
- Create and manage export shipments
- Track shipment stages and operational progress
- Assign logistics-related details as records move through the workflow

### Document Workflows
- Upload supporting export documents
- Track verification states such as pending, verified, missing, or rejected
- Organize paperwork around shipment records

### Team Collaboration
- Role-based access for different user types
- Shared operational visibility across teams
- Internal workflow support for logistics coordination

### Analytics
- KPI-style overview cards
- Visual charts for shipment activity and trends
- Centralized dashboard for operational monitoring

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
This project contains separate frontend and backend applications. Configure environment variables according to the services you want to enable, including database connectivity and any authentication-related settings.

## Deployment
- Frontend-oriented deployment configuration is present via `vercel.json`
- Backend can be deployed separately on a Node-compatible host

## Why This Project Matters
ExporTrack AI focuses on a real business workflow instead of a generic demo use case. It showcases full-stack application structure, domain-specific UX, operational dashboards, and document-centric process design.

## Roadmap Ideas
- Stronger backend validation and API documentation
- Real OCR/compliance integrations
- Notification delivery workflows
- Multi-tenant organization support
- Audit logging and reporting improvements

## License
This repository currently does not expose a dedicated license file. Add one if you want to make reuse terms explicit.
