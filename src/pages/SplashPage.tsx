import { useNavigate, Link } from 'react-router-dom';
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
  const navigate = useNavigate();
  const {
    state: { shipments, notifications },
    loginWithGoogle
  } = useAppContext();

  const handleDemo = () => {
    try {
      loginWithGoogle();
      // Redirect after state is updated
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (error) {
      console.error('Demo login error:', error);
    }
  };

  const totalDocs = shipments.reduce((sum, shipment) => sum + shipment.documents.length, 0);
  const liveAlerts = notifications.filter((item) => !item.read).length;

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 font-bold text-white shadow-md">EA</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white md:text-base">ExporTrack<span className="text-teal-600 dark:text-teal-400">AI</span></span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-navy-800">Features</a>
            <a href="#how" className="hover:text-navy-800">How it works</a>
            <Link to="/auth" className="hover:text-navy-800">Login</Link>
            <button type="button" onClick={handleDemo} className="btn-primary px-4 py-2">Demo</button>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 py-16 md:px-10 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/60 via-white to-blue-50/40 dark:from-teal-950/30 dark:via-slate-950 dark:to-blue-950/20" />
        <div className="absolute -left-28 -top-20 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl dark:bg-teal-500/10 animate-pulse" />
        <div className="absolute -right-28 top-6 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-500/10" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600">
              Export Logistics Document Management
            </div>
            <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl" style={{ letterSpacing: '-0.03em' }}>
              Run export documentation like a modern operations command center.
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-600 dark:text-slate-400 md:text-lg leading-relaxed">
              Manage shipment documents, verification states, and team approvals in one premium workspace built for real export operations.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/auth" className="btn-primary">Login / Sign up</Link>
              <button type="button" onClick={handleDemo} className="btn-secondary">Start Free Demo</button>
            </div>
          </div>

          <div className="card-premium p-5 md:p-6 shadow-elevated">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Operations Preview</h3>
              <span className="rounded-full bg-teal-50 dark:bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-700 dark:text-teal-400">Live</span>
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
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.02em' }}>Key Features</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => (
            <div key={item} className="card-premium p-5 group hover:-translate-y-0.5">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.02em' }}>How it works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {howItWorks.map((item) => (
            <div key={item.step} className="card-premium p-6 group hover:-translate-y-0.5">
              <p className="text-xs font-bold text-teal-600 dark:text-teal-400">STEP {item.step}</p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-600 dark:text-slate-400 md:flex-row md:items-center md:justify-between md:px-10">
          <p>© 2026 ExporTrack-AI. Built for modern export operations.</p>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="hover:text-navy-800">Login</Link>
            <button type="button" onClick={handleDemo} className="hover:text-navy-800">Open Demo</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
