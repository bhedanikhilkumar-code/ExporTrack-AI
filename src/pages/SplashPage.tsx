import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const features = [
  'Shipment-wise document organization',
  'AI/OCR-assisted data extraction',
  'Verification checklist with live status',
  'Alerts for missing docs and delays'
];

const howItWorks = [
  { step: '1', title: 'Create Shipment', desc: 'Capture shipment metadata and assign owners in seconds.' },
  { step: '2', title: 'Upload & Extract', desc: 'Upload PDF/JPG/PNG files and auto-capture key fields.' },
  { step: '3', title: 'Verify & Dispatch', desc: 'Track Pending/Verified/Missing/Rejected until compliance-ready.' }
];

export default function SplashPage() {
  const {
    state: { shipments, notifications }
  } = useAppContext();

  const totalDocs = shipments.reduce((sum, shipment) => sum + shipment.documents.length, 0);
  const liveAlerts = notifications.filter((item) => !item.read).length;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-700 font-bold text-white">EA</span>
            <span className="text-sm font-bold text-navy-800 md:text-base">ExporTrack-AI</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-navy-800">Features</a>
            <a href="#how" className="hover:text-navy-800">How it works</a>
            <Link to="/auth" className="hover:text-navy-800">Login</Link>
            <Link to="/dashboard" className="btn-primary px-4 py-2">Demo</Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 py-12 md:px-10 md:py-16">
        <div className="absolute -left-28 -top-20 h-72 w-72 rounded-full bg-teal-100 blur-3xl" />
        <div className="absolute -right-28 top-6 h-72 w-72 rounded-full bg-navy-100 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600">
              Export Logistics Document Management
            </div>
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-navy-900 md:text-5xl">
              Run export documentation like a modern operations command center.
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600 md:text-lg">
              Manage shipment documents, verification states, and team approvals in one premium workspace built for real export operations.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/auth" className="btn-primary">Login / Sign up</Link>
              <Link to="/dashboard" className="btn-secondary">Start Free Demo</Link>
            </div>
          </div>

          <div className="card-surface p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-800">Operations Preview</h3>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">Live</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Shipments</p><p className="text-xl font-bold text-navy-800">{shipments.length}</p></div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Documents</p><p className="text-xl font-bold text-navy-800">{totalDocs}</p></div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Alerts</p><p className="text-xl font-bold text-navy-800">{liveAlerts}</p></div>
            </div>
            <div className="mt-4 space-y-2">
              {shipments.slice(0, 3).map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-navy-800">{s.id}</p>
                    <p className="text-xs text-slate-500">{s.clientName} • {s.destinationCountry}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        <h2 className="text-2xl font-bold tracking-tight text-navy-900">Key Features</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => (
            <div key={item} className="card-surface p-4">
              <p className="text-sm font-semibold text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        <h2 className="text-2xl font-bold tracking-tight text-navy-900">How it works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {howItWorks.map((item) => (
            <div key={item.step} className="card-surface p-5">
              <p className="text-xs font-bold text-teal-700">STEP {item.step}</p>
              <p className="mt-2 text-lg font-semibold text-navy-800">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between md:px-10">
          <p>© 2026 ExporTrack-AI. Built for modern export operations.</p>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="hover:text-navy-800">Login</Link>
            <Link to="/dashboard" className="hover:text-navy-800">Open Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
