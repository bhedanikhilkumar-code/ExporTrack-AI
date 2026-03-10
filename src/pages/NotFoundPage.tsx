import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy-800">Page Not Found</h1>
        <p className="mt-3 text-sm text-slate-600">The page does not exist or has moved to another route.</p>
        <Link to="/dashboard" className="mt-6 inline-flex rounded-xl bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

