import { FormEvent, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AppIcon from '../components/AppIcon';
import { initGoogleSignIn, renderGoogleSignInButton, GoogleAuthError, GoogleSignInCallbackResponse } from '../utils/googleAuth';
import { logEnvironmentCheck, canUseGoogleOAuth } from '../utils/envCheck';

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
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleScriptRef = useRef<HTMLScriptElement | null>(null);

  // Initialize Google Sign-In
  useEffect(() => {
    let mounted = true;

    // Log environment check on page load
    console.log('AuthPage mounted - checking environment...');
    logEnvironmentCheck();
    
    const oauthCheck = canUseGoogleOAuth();
    console.log('Google OAuth status:', oauthCheck);

    const initializeGoogleSDK = () => {
      if (document.querySelector('script[src*="google.com/gsi/client"]')) {
        // SDK already loaded
        if (mounted) {
          setTimeout(() => initializeGoogleSignIn(), 0);
        }
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (mounted) {
          console.log('Google SDK loaded successfully');
          setTimeout(() => initializeGoogleSignIn(), 0);
        }
      };
      script.onerror = () => {
        if (mounted) {
          console.error('Failed to load Google SDK script');
          setGoogleError('Failed to load Google Sign-In. Please check your internet connection and refresh the page.');
        }
      };
      document.head.appendChild(script);
      googleScriptRef.current = script;
    };

    initializeGoogleSDK();

    return () => {
      mounted = false;
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google) {
      console.error('Google SDK not loaded');
      setGoogleError('Google Sign-In is not available. Please refresh the page.');
      return;
    }

    try {
      // Get Client ID from environment variables
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      console.log('Environment check:', {
        clientIdExists: !!clientId,
        clientIdLength: clientId?.length || 0,
        clientIdPreview: clientId ? clientId.substring(0, 20) + '...' : 'NOT_SET'
      });

      if (!clientId || clientId.trim() === '') {
        setGoogleError('Google Sign-In is not configured. Please ensure VITE_GOOGLE_CLIENT_ID is set in your environment. Contact support if the issue persists.');
        console.error('VITE_GOOGLE_CLIENT_ID environment variable is not set or is empty');
        return;
      }

      // Initialize Google Sign-In
      initGoogleSignIn(
        clientId,
        handleGoogleCallback,
        handleGoogleError
      );

      // Render the Sign-In button
      if (googleButtonRef.current) {
        const renderSuccess = renderGoogleSignInButton('google-signin-button', {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          logo_alignment: 'left'
        });

        if (renderSuccess) {
          setGoogleInitialized(true);
          setGoogleError(''); // Clear any previous errors
          console.log('Google Sign-In button initialized successfully');
        } else {
          setGoogleError('Failed to render Google Sign-In button. Please refresh the page.');
          console.error('Failed to render Google button');
        }
      }
    } catch (error) {
      console.error('Google Sign-In initialization error:', error);
      if (error instanceof GoogleAuthError) {
        setGoogleError(error.message);
      } else {
        setGoogleError('Failed to initialize Google Sign-In. Please refresh the page.');
      }
    }
  };

  const handleGoogleCallback = (response: GoogleSignInCallbackResponse) => {
    try {
      setError('');
      setGoogleError('');
      setIsGoogleLoading(true);

      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Login with the Google JWT token
      loginWithGoogleToken(response.credential);

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 300);
    } catch (err: any) {
      console.error('Google callback error:', err);
      const errorMessage = err.message || 'Google sign-in failed. Please try again.';
      setGoogleError(errorMessage);
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = (error: GoogleAuthError) => {
    console.error('Google Auth Error:', error);
    setGoogleError(error.message);
    setIsGoogleLoading(false);
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

              {/* Error Messages */}
              {error && (
                <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800/50">
                  <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
                </div>
              )}

              {googleError && (
                <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800/50">
                  <p className="text-sm text-rose-700 dark:text-rose-400">{googleError}</p>
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
              <div
                ref={googleButtonRef}
                id="google-signin-button"
                className={`w-full ${!googleInitialized && !googleError ? 'flex items-center justify-center py-3 bg-slate-100 rounded-lg animate-pulse' : ''}`}
              >
                {!googleInitialized && !googleError && (
                  <span className="text-sm text-slate-500">Loading Google Sign-In...</span>
                )}
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

