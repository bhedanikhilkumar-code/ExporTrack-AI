import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const highlights = [
  {
    title: 'Shipment-Centric Control',
    detail: 'Every export file is organized by shipment with instant status visibility and no document guesswork.'
  },
  {
    title: 'AI-Assisted Data Capture',
    detail: 'OCR-style extraction pre-fills invoice and buyer details to cut manual errors and rework.'
  },
  {
    title: 'Compliance-Ready Verification',
    detail: 'Checklist workflows track Pending, Verified, Missing, and Rejected files in real time.'
  },
  {
    title: 'Team Operations Hub',
    detail: 'Role-based collaboration, alerts, and internal notes keep logistics, customs, and ops in sync.'
  }
];

export default function SplashPage() {
  const {
    state: { isAuthenticated, shipments, notifications }
  } = useAppContext();

  const totalDocs = shipments.reduce((sum, shipment) => sum + shipment.documents.length, 0);
  const liveAlerts = notifications.filter((item) => !item.read).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="relative isolate overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal-100 blur-3xl" />
        <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-navy-100 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-14 md:px-10">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
            ExporTrack AI • Export Logistics Document Management
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-navy-900 md:text-6xl">
            Run export documentation like a modern operations command center.
          </h1>
          <p className="mt-5 max-w-3xl text-base text-slate-600 md:text-lg">
            ExporTrack AI helps exporters and logistics teams create shipments, upload and verify critical documents, detect missing files early,
            and move faster with fewer compliance delays.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={isAuthenticated ? '/dashboard' : '/auth'} className="btn-primary">
              {isAuthenticated ? 'Open Live Dashboard' : 'Get Started'}
            </Link>
            <Link to="/auth" className="btn-secondary">
              Start Product Demo
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="card-surface p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Tracked Shipments</p>
              <p className="mt-1 text-2xl font-bold text-navy-800">{shipments.length}</p>
            </div>
            <div className="card-surface p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Managed Documents</p>
              <p className="mt-1 text-2xl font-bold text-navy-800">{totalDocs}</p>
            </div>
            <div className="card-surface p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Active Alerts</p>
              <p className="mt-1 text-2xl font-bold text-navy-800">{liveAlerts}</p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {highlights.map((item) => (
              <div key={item.title} className="card-surface p-4">
                <p className="text-sm font-semibold text-navy-800">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
