# ExporTrack-AI

ExporTrack-AI is a React + Vite + TypeScript + Tailwind MVP for logistics document management. It simulates a production-like workflow for shipment tracking, document verification, AI OCR extraction, and team collaboration using local state and `localStorage` only.

## Stack

- React 18
- React Router
- TypeScript
- Tailwind CSS
- Vite

## Quick Start

```bash
cd ExporTrack-AI
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Core Features

- Splash + Login/Signup with mocked email auth and Google auth button
- Dashboard with KPI cards:
  - Total shipments
  - Pending docs
  - Verified files
  - Delayed cases
  - Alerts
- Create Shipment form:
  - Shipment ID
  - Client name
  - Destination country
  - Shipment date
  - Container number
  - Shipment status
- Shipment Details page with:
  - Document list
  - Status badges
  - File download mock
  - Export shipment bundle mock
  - Collaboration comments/internal notes
- Upload Documents page:
  - PDF/JPG/PNG support
  - Mobile camera capture-enabled input (`capture="environment"`)
- AI Scan Results page with mocked OCR extraction:
  - Invoice number
  - Date
  - Buyer name
  - Shipment value
  - Destination
  - Document type
- Verification Checklist page for required docs:
  - Invoice
  - Packing list
  - Bill of lading
  - Shipping bill
  - Certificate of origin
  - Insurance papers
  - Customs files
- Document statuses: Pending, Verified, Missing, Rejected
- Smart Search/Filter by shipment ID, client name, destination, date, and doc type
- Notifications/reminders for missing docs, delayed approvals, and deadlines
- Profile/Team Management with role switch mock (Admin/Manager/Coordinator)
- Admin page with role-gated controls and approval queue mock
- Fully responsive enterprise UI (white background with navy + teal accents)

## Notes

- No backend is used. All app data is seeded dummy data and persisted in browser `localStorage`.
- To reset data, clear browser storage for the site key:
  - `exportrack-ai-state-v1`
