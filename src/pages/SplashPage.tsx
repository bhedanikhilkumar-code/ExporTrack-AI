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
    <div className="min-h-screen bg-white text-slate-900 dark:bg-[#020617] dark:text-slate-100 overflow-x-hidden">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-100/50 dark:border-slate-800/50 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
          <Link to="/" className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl shadow-md overflow-hidden bg-white">
              <img src="/logo.svg" alt="Logo" className="h-full w-full object-cover" />
            </span>
            <span className="text-xl font-bold tracking-tight text-black dark:text-white">
              ExporTrack <span className="text-teal-600 dark:text-teal-400">AI</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-10 text-sm font-semibold text-slate-500 dark:text-slate-400 md:flex">
            <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-black dark:hover:text-white transition-colors">How it works</a>
            <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-8">
              <Link to="/auth" className="hover:text-black dark:hover:text-white transition-colors">Sign in</Link>
              <button 
                type="button" 
                onClick={handleDemo} 
                className="bg-[#0f172a] text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/10"
              >
                Start Demo
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 py-20 text-center md:px-10">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f0fdf4]/50 via-white to-white dark:from-[#0d9488]/5 dark:via-[#020617] dark:to-[#020617]" />
        
        <div className="relative z-10 mx-auto max-w-[1100px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/50 px-5 py-2 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
              Export Logistics Document Management
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15]">
            Unified Command for <br className="hidden md:block" />
            <span className="text-[#0f172a] dark:text-teal-400">Global Export Operations.</span>
          </h1>

          {/* Body Text */}
          <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-slate-400 dark:text-slate-500">
            Manage shipment documents, verification states, and team approvals <br className="hidden md:block" />
            in one premium workspace built for real export operations.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-8 sm:flex-row">
            <Link 
              to="/auth" 
              className="flex h-12 items-center justify-center rounded-lg bg-[#0f172a] px-8 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-sm active:scale-95"
            >
              Login / Sign up
            </Link>
            <button 
              type="button" 
              onClick={handleDemo} 
              className="text-sm font-bold text-slate-400 transition-colors hover:text-black dark:text-slate-500 dark:hover:text-white"
            >
              Start Free Demo
            </button>
          </div>
        </div>

        {/* Operations Preview Card - Moved slightly lower but kept for functionality */}
        <div className="mt-24 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="card-premium overflow-hidden p-0 shadow-2xl border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-3 rounded-full bg-slate-100 dark:bg-slate-900" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Operations Control Center</h3>
              </div>
              <span className="flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-500/10 px-3 py-1 text-[10px] font-bold text-teal-700 dark:text-teal-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
                SYSTEM LIVE
              </span>
            </div>
            
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shipments</p>
                      <p className="mt-1 text-2xl font-bold dark:text-white">{shipments.length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Docs</p>
                      <p className="mt-1 text-2xl font-bold dark:text-white">{totalDocs}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alerts</p>
                      <p className="mt-1 text-2xl font-bold text-rose-500">{liveAlerts}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-2 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="h-40 w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950">
                      <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800" alt="Logistics" className="h-full w-full object-cover opacity-60 mix-blend-multiply transition-transform duration-700 hover:scale-105" />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="rounded-2xl border border-slate-100 bg-white p-2 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="space-y-1">
                      {shipments.slice(0, 4).map((s) => (
                        <div key={s.id} className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              {s.destinationCountry.substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{s.id}</p>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{s.clientName} • {s.destinationCountry}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div className="h-full bg-teal-500 transition-all" style={{ width: s.status === 'Delivered' ? '100%' : '65%' }} />
                            </div>
                            <span className="min-w-[80px] text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {s.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
            <Link to="/auth" className="hover:text-slate-900 dark:hover:text-white transition-colors">Login</Link>
            <button type="button" onClick={handleDemo} className="hover:text-slate-900 dark:hover:text-white transition-colors">Open Demo</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
