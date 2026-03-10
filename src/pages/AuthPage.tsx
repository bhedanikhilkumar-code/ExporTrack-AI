import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAppContext();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'login') {
      login(email, password);
    } else {
      signup(name.trim() || 'New User', email, password);
    }
    navigate('/dashboard');
  };

  const handleGoogleSignIn = () => {
    loginWithGoogle();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft md:grid-cols-[1.2fr_1fr]">
        <section className="hidden bg-gradient-to-br from-navy-800 via-navy-700 to-teal-600 p-8 text-white md:block">
          <h1 className="text-3xl font-semibold">ExporTrack-AI</h1>
          <p className="mt-4 text-sm text-slate-100">
            Access the logistics operating layer where shipment documentation, AI extraction, and compliance checks are unified.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li>Track pending and rejected files in real time</li>
            <li>Run OCR scans and validate extracted fields</li>
            <li>Collaborate securely with role-based workflows</li>
          </ul>
        </section>

        <section className="p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-navy-800">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <button
              type="button"
              onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
              className="btn-secondary btn-xs"
            >
              {mode === 'login' ? 'Need Sign up?' : 'Have Login?'}
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'signup' ? (
              <div>
                <label htmlFor="full-name" className="input-label">
                  Full Name
                </label>
                <input
                  id="full-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required={mode === 'signup'}
                  className="input-field"
                  placeholder="Jane Doe"
                />
              </div>
            ) : null}
            <div>
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="input-field"
                placeholder="ops@company.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="input-field"
                placeholder="******"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            OR
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn-secondary w-full"
          >
            Continue with Google
          </button>
        </section>
      </div>
    </div>
  );
}

