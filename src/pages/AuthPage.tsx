/// <reference types="vite/client" />
import { FormEvent, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AppIcon from '../components/AppIcon';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogleToken } = useAppContext();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);

  // Initialize Google Sign-In
  useEffect(() => {
    let mounted = true;

    const initializeGoogleSDK = async () => {
      try {
        // Check environment
        console.log('🔍 Initializing Google Sign-In...');
        console.log('Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'SET ✅' : 'MISSING ❌');

        // Wait for globalThis.google to be available
        let attempts = 0;
        while (!(globalThis as any).google && attempts < 50) {
          // Check if script already loaded
          if (!document.querySelector('script[src*="gsi/client"]')) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
              console.log('✅ Google SDK script loaded');
            };
            document.head.appendChild(script);
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!(globalThis as any).google) {
          throw new Error('Google SDK failed to load');
        }

        console.log('✅ Google SDK ready');
        if (mounted) {
          initializeGoogleSignIn();
        }
      } catch (err) {
        console.error('❌ SDK initialization error:', err);
        if (mounted) {
          setGoogleError('Google Sign-In service is unavailable. Please try again.');
        }
      }
    };

    // Start initialization
    setTimeout(initializeGoogleSDK, 500);

    return () => {
      mounted = false;
    };
  }, []);

  const initializeGoogleSignIn = () => {
    try {
      if (!(globalThis as any).google) {
        throw new Error('Google SDK not loaded - globalThis.google not found');
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId) {
        throw new Error('VITE_GOOGLE_CLIENT_ID is missing. Check your .env file or Vercel environment variables.');
      }

      console.log('📝 Initializing with Client ID:', clientId.substring(0, 15) + '...');

      // Initialize Google Accounts
      (globalThis as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
        auto_select: false,
        itp_support: true,
      });

      console.log('✅ Google initialized');

      // Render button
      const buttonElement = document.getElementById('google-signin-button');
      if (!buttonElement) {
        throw new Error('Button element not found');
      }

      (globalThis as any).google.accounts.id.renderButton(
        buttonElement,
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          locale: 'en'
        }
      );

      console.log('✅ Google button rendered');
      setGoogleInitialized(true);
      setGoogleError('');
    } catch (err: any) {
      console.error('❌ Google initialization failed:', err.message);
      setGoogleError(err.message || 'Failed to initialize Google Sign-In');
      setGoogleInitialized(false);
    }
  };

  const handleGoogleCallback = (response: any) => {
    try {
      console.log('🔔 Google callback received');

      if (!response.credential) {
        throw new Error('No credential in response');
      }

      console.log('✅ Got credential, logging in...');
      setIsGoogleLoading(true);

      // Call context login function
      loginWithGoogleToken(response.credential);

      // Redirect after a short delay
      setTimeout(() => {
        console.log('➡️ Redirecting to dashboard...');
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (err: any) {
      console.error('❌ Callback error:', err);
      setGoogleError(err.message || 'Authentication failed');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setGoogleError('');
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
        navigate('/dashboard', { replace: true });
      }, 300);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setError('');
    setGoogleError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 items-center justify-center px-4 py-8 md:py-0">
      <div className="w-full max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl grid md:grid-cols-[1.2fr_1fr]">
          {/* Left Section - Info Panel */}
          <section className="hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-700 dark:from-slate-950 dark:via-slate-900 dark:to-teal-900 p-12 text-white md:flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(45,212,191,0.15),transparent_60%)]" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg overflow-hidden bg-white">
                  <img src="/logo.png" alt="ExporTrack-AI Logo" className="h-full w-full object-cover" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight">ExporTrack<span className="text-teal-300">AI</span></h1>
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
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100" style={{ letterSpacing: '-0.02em' }}>
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {mode === 'login'
                    ? 'Sign in to access your shipments and AI tools'
                    : 'Join ExporTrack-AI to manage your logistics'}
                </p>
              </div>

              {/* Error Messages */}
              {error && (
                <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800/50">
                  <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
                </div>
              )}

              {/* Form level error was handled above */}

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
                      disabled={isLoading || isGoogleLoading}
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
                    disabled={isLoading || isGoogleLoading}
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
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    <>{mode === 'login' ? 'Sign In' : 'Create Account'}</>
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
              <div className="w-full flex flex-col items-center justify-center min-h-[48px]">
                {googleError ? (
                  <div className="w-full p-3 rounded-xl bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50 flex items-start gap-3">
                    <AppIcon name="alert" className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-orange-800 dark:text-orange-300">
                        Authentication Config Error
                      </p>
                      <p className="text-[11px] text-orange-700/80 dark:text-orange-400/80 mt-0.5" title={googleError}>
                        {googleError}
                      </p>
                    </div>
                  </div>
                ) : !googleInitialized ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></span>
                    <span className="text-sm font-medium">Loading Google...</span>
                  </div>
                ) : null}
                
                {/* 
                  The Google button will be rendered into this specific div via the SDK.
                  We use relative positioning so it sits on top if needed, and give it a class to ensure it's hidden if there's an error.
                */}
                <div 
                  id="google-signin-button" 
                  className={`w-full flex justify-center ${googleError || !googleInitialized ? 'hidden' : ''}`}
                ></div>
              </div>

              {/* Toggle Mode */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    disabled={isLoading || isGoogleLoading}
                    className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

