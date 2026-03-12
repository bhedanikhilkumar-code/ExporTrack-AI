import { FormEvent, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AppIcon from '../components/AppIcon';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, loginWithGoogleToken } = useAppContext();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Initialize Google Sign-In
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleSignIn();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google) {
      console.error('Google SDK not loaded');
      return;
    }

    try {
      // Get Client ID from environment variables
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId) {
        setError('Google Sign-In is not configured. Please contact support.');
        console.error('VITE_GOOGLE_CLIENT_ID environment variable is not set');
        return;
      }

      // Initialize Google Sign-In with your Client ID
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
        auto_select: false
      });

      // Render the Sign-In button
      if (googleButtonRef.current && !googleButtonRef.current.innerHTML) {
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with'
          }
        );
      }
    } catch (error) {
      console.error('Google Sign-In initialization error:', error);
    }
  };

  const handleGoogleCallback = (response: any) => {
    if (response.credential) {
      try {
        setError('');
        setIsLoading(true);

        // Login with the Google JWT token
        loginWithGoogleToken(response.credential);

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 300);
      } catch (err: any) {
        setError(err.message || 'Google sign-in failed. Please try again.');
        setIsLoading(false);
      }
    } else {
      setError('Google sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setError('Please enter email and password');
          setIsLoading(false);
          return;
        }
        login(email, password);
      } else {
        if (!name.trim() || !email || !password) {
          setError('Please fill in all fields');
          setIsLoading(false);
          return;
        }
        signup(name.trim(), email, password);
      }

      // Small delay for UX
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Simulate Google OAuth flow delay
      await new Promise(resolve => setTimeout(resolve, 800));
      loginWithGoogle();
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-50 items-center justify-center px-4 py-8 md:py-0">
      <div className="w-full max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl grid md:grid-cols-[1.2fr_1fr]">
          {/* Left Section - Info Panel */}
          <section className="hidden bg-gradient-to-br from-navy-800 via-navy-700 to-teal-600 p-12 text-white md:flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white font-bold text-lg">
                  EA
                </div>
                <h1 className="text-2xl font-bold tracking-tight">ExporTrack-AI</h1>
              </div>
              <p className="text-sm text-slate-100/90 leading-relaxed">
                Access the logistics operating layer where shipment documentation, AI extraction, and compliance checks are unified in one powerful platform.
              </p>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-300/20 flex-shrink-0">
                  <AppIcon name="check" className="h-3 w-3 text-teal-300" />
                </span>
                <span>Track pending and rejected files in real time</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-300/20 flex-shrink-0">
                  <AppIcon name="check" className="h-3 w-3 text-teal-300" />
                </span>
                <span>Run OCR scans and validate extracted fields</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-300/20 flex-shrink-0">
                  <AppIcon name="check" className="h-3 w-3 text-teal-300" />
                </span>
                <span>Collaborate securely with role-based workflows</span>
              </li>
            </ul>

            <div className="pt-8 border-t border-white/10">
              <p className="text-xs text-slate-100/70">
                Enterprise-grade logistics platform trusted by export operations
              </p>
            </div>
          </section>

          {/* Right Section - Auth Form */}
          <section className="flex flex-col justify-center p-8 md:p-10">
            <div className="w-full max-w-sm mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-navy-800 dark:text-slate-100">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {mode === 'login'
                    ? 'Sign in to access your shipments and AI tools'
                    : 'Join ExporTrack-AI to manage your logistics'}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800/50">
                  <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
                </div>
              )}

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <div>
                    <label htmlFor="full-name" className="input-label">
                      Full Name
                    </label>
                    <input
                      id="full-name"
                      type="text"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        setError('');
                      }}
                      required={mode === 'signup'}
                      className="input-field"
                      placeholder="Jane Doe"
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="input-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError('');
                    }}
                    required
                    className="input-field"
                    placeholder="ops@company.com"
                    disabled={isLoading}
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
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError('');
                    }}
                    required
                    minLength={6}
                    className="input-field"
                    placeholder="Minimum 6 characters"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    mode === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">OR</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Google Sign-In Button */}
              <div ref={googleButtonRef} />

              {/* Toggle Mode */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
                      setError('');
                      setName('');
                      setEmail('');
                      setPassword('');
                    }}
                    className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Protected by enterprise-grade security • Privacy Policy • Terms of Service
        </p>
      </div>
    </div>
  );
}

