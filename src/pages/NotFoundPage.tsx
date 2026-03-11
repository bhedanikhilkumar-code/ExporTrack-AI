import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card-panel w-full max-w-lg p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy-800">Page Not Found</h1>
        <p className="mt-3 text-sm text-slate-600">The page does not exist or has moved to another route.</p>
        <Link to="/dashboard" className="btn-primary mt-6">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

