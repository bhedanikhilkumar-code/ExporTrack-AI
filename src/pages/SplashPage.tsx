import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const highlights = [
  'AI-powered OCR extraction for trade docs',
  'Verification checklist for end-to-end compliance',
  'Role-based collaboration for ops teams',
  'Smart tracking of missing files and approval delays'
];

export default function SplashPage() {
  const {
    state: { isAuthenticated }
  } = useAppContext();

  return (
    <div className="min-h-screen bg-white">
      <div className="relative isolate overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal-100 blur-3xl" />
        <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-navy-100 blur-3xl" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-14 md:px-10">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600">
            Enterprise Logistics Document Intelligence
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-navy-900 md:text-6xl">
            ExporTrack-AI
            <span className="block text-2xl text-teal-700 md:text-3xl">Modern logistics documentation control center</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-slate-600 md:text-lg">
            Manage shipment paperwork, track verification status, collaborate with your operations team, and reduce compliance delays with
            a single responsive dashboard.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={isAuthenticated ? '/dashboard' : '/auth'}
              className="rounded-xl bg-navy-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              {isAuthenticated ? 'Open Dashboard' : 'Login / Sign up'}
            </Link>
            <Link to="/auth" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Start Free Demo
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
                <p className="text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
