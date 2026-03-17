/// <reference types="vite/client" />
import { FormEvent, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AppIcon from '../components/AppIcon';
import {
  validateEmailFormat,
  validatePasswordStrength,
  getPasswordStrength,
  validateLoginForm,
  validateSignupForm,
  recordFailedAttempt,
  clearLoginAttempts,
  isAccountLockedOut
} from '../utils/authSecurity';

type Mode = 'login' | 'signup';

// Check if user exists in localStorage (mock registered users)
const registeredEmails = ['admin@exportrack.com', 'demo@exportrack.com', 'user@example.com'];

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, loginWithGoogleToken, logout, state } = useAppContext();
  const { isAuthenticated, user } = state;
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false, name: false });

  // Get password strength for signup
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  // Check lockout status
  const lockoutStatus = useMemo(() => isAccountLockedOut(email), [email]);

  // Initialize Google Sign-In
  useEffect(() => {
    let mounted = true;
    let attempts = 0;

    const initializeGoogleSDK = async () => {
      try {
        console.log('🔍 Initializing Google Sign-In (Attempts:', attempts, ')...');

        // Wait for SDK and Button element
        while (attempts < 50) {
          if (!mounted) return;

          const sdkReady = (window as any).google?.accounts?.id;
          const buttonReady = document.getElementById('google-signin-button');

          if (sdkReady && buttonReady) {
            console.log('✅ Google SDK and Button Element ready');
            initializeGoogleSignIn();
            return;
          }

          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }

        if (mounted) {
          throw new Error('Google Sign-In failed to load (timeout)');
        }
      } catch (err: any) {
        console.error('❌ SDK initialization error:', err);
        if (mounted) {
          setGoogleError(err.message || 'Google Sign-In is temporarily unavailable');
        }
      }
    };

    initializeGoogleSDK();

    return () => {
      mounted = false;
    };
  }, []);

  const initializeGoogleSignIn = () => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId) {
        throw new Error('Google Client ID is missing. Please check configuration.');
      }

      // Initialize Google Accounts
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
        auto_select: false,
        itp_support: true,
      });

      // Render button
      const buttonElement = document.getElementById('google-signin-button');
      if (buttonElement) {
        (window as any).google.accounts.id.renderButton(
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
      }
    } catch (err: any) {
      console.error('❌ Google initialization failed:', err.message);
      setGoogleError(err.message || 'Failed to initialize Google Sign-In');
      setGoogleInitialized(false);
    }
  };

  const handleGoogleCallback = (response: any) => {
    try {
      console.log('🔔 Google callback received');
      if (!response.credential) throw new Error('No credential in response');

      setIsGoogleLoading(true);
      loginWithGoogleToken(response.credential);

      const from = location.state?.from || '/dashboard';
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err: any) {
      console.error('❌ Callback error:', err);
      setGoogleError(err.message || 'Authentication failed');
      setIsGoogleLoading(false);
    }
  };

  // Handle form field changes with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (nameError) setNameError('');
  };

  // Validate on blur
  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    if (email) {
      const result = validateEmailFormat(email);
      setEmailError(result.isValid ? '' : result.error || '');
    }
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    if (password && mode === 'signup') {
      const result = validatePasswordStrength(password);
      setPasswordError(result.isValid ? '' : result.error || '');
    }
  };

  const handleNameBlur = () => {
    setTouched(prev => ({ ...prev, name: true }));
    if (mode === 'signup' && !name.trim()) {
      setNameError('Full name is required');
    } else {
      setNameError('');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setGoogleError('');
    setIsLoading(true);

    // Get the redirect path
    const from = location.state?.from || '/dashboard';

    // Check lockout
    if (isAccountLockedOut(email)) {
      setError('Account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.');
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setError('Please enter email and password');
          setIsLoading(false);
          return;
        }

        // Validate email format
        const emailValidation = validateEmailFormat(email);
        if (!emailValidation.isValid) {
          setError(emailValidation.error || 'Please enter a valid email address');
          setIsLoading(false);
          return;
        }

        // Attempt login
        login(email, password);

        // Small delay for UX
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 300);
      } else {
        // Signup mode - enhanced validation
        if (!name.trim()) {
          setNameError('Full name is required');
          setError('Please fill in all required fields');
          setIsLoading(false);
          return;
        }

        if (!email) {
          setError('Please enter your email address');
          setIsLoading(false);
          return;
        }

        if (!password) {
          setError('Please enter a password');
          setIsLoading(false);
          return;
        }

        // Validate email format
        const emailValidation = validateEmailFormat(email);
        if (!emailValidation.isValid) {
          setError(emailValidation.error || 'Please enter a valid email address');
          setIsLoading(false);
          return;
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
          setError(passwordValidation.error || 'Password does not meet security requirements');
          setIsLoading(false);
          return;
        }

        // Check if email already registered
        if (registeredEmails.includes(email.toLowerCase())) {
          setError('This email is already registered. Please login instead.');
          setIsLoading(false);
          return;
        }

        // Attempt signup
        signup(name.trim(), email, password);

        // Small delay for UX
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 300);
      }
    } catch (err: any) {
      // Record failed attempt for brute force protection (login only)
      if (mode === 'login') {
        recordFailedAttempt(email);
        const attempts = parseInt(localStorage.getItem('login_attempts_' + email) || '0');
        const remainingAttempts = 5 - attempts;

        if (remainingAttempts <= 0) {
          setError('Account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.');
        } else {
          setError(`Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before lockout.`);
        }
      } else {
        const errorMessage = err.message || 'An error occurred. Please try again.';
        setError(errorMessage);
      }
      setIsLoading(false);
    }
  };

  /* Existing logic for Google Sign-In and local login */

  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-500/10 mb-6 font-bold text-teal-600">
            {user.name.charAt(0)}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Already Signed In</h2>
          <p className="mt-2 text-sm text-slate-500 mb-8 truncate">
            {user.name} ({user.email})
          </p>
          <div className="space-y-4">
            <button
              onClick={() => {
                const from = location.state?.from || '/dashboard';
                navigate(from);
              }}
              className="btn-primary w-full py-3"
            >
              Go to App
            </button>
            <button
              onClick={() => {
                logout();
                setMode('login');
              }}
              className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Sign Out & Use Another Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setError('');
    setGoogleError('');
    setName('');
    setEmail('');
    setPassword('');
    // Clear validation states
    setEmailError('');
    setPasswordError('');
    setNameError('');
    setTouched({ email: false, password: false, name: false });
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
                  <img src="/logo.svg" alt="ExporTrack-AI Logo" className="h-full w-full object-cover" />
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

              {/* Lockout Warning Banner */}
              {lockoutStatus.locked && mode === 'login' && (
                <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50">
                  <div className="flex items-start gap-2">
                    <AppIcon name="warning" className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Account Temporarily Locked</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        Too many failed login attempts. Please try again in {lockoutStatus.remainingMinutes} minute{lockoutStatus.remainingMinutes !== 1 ? 's' : ''}.
                      </p>
                    </div>
                  </div>
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
                      onChange={handleNameChange}
                      onBlur={handleNameBlur}
                      required={mode === 'signup'}
                      className={`input-field ${nameError && touched.name ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                      placeholder="Jane Doe"
                      disabled={isLoading || isGoogleLoading}
                    />
                    {nameError && touched.name && (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AppIcon name="warning" className="h-3 w-3" />
                        {nameError}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="input-label">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={handleEmailBlur}
                      required
                      className={`input-field pr-10 ${emailError && touched.email ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                      placeholder="ops@company.com"
                      disabled={isLoading || isGoogleLoading}
                    />
                    {touched.email && email && !emailError && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AppIcon name="check" className="h-5 w-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {emailError && touched.email && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AppIcon name="warning" className="h-3 w-3" />
                      {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="input-label">
                    Password
                    {mode === 'signup' && (
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        (8+ chars, uppercase, lowercase, number, symbol)
                      </span>
                    )}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    required
                    minLength={mode === 'signup' ? 8 : 6}
                    className={`input-field ${passwordError && touched.password ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                    placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                    disabled={isLoading || isGoogleLoading}
                  />
                  {passwordError && touched.password && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AppIcon name="warning" className="h-3 w-3" />
                      {passwordError}
                    </p>
                  )}

                  {/* Password Strength Indicator (Signup mode only) */}
                  {mode === 'signup' && password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${passwordStrength.score <= 1 ? 'bg-rose-500' :
                              passwordStrength.score <= 2 ? 'bg-amber-500' :
                                passwordStrength.score <= 3 ? 'bg-teal-500' :
                                  'bg-emerald-500'
                              }`}
                            style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${passwordStrength.score <= 1 ? 'text-rose-500' :
                          passwordStrength.score <= 2 ? 'text-amber-500' :
                            passwordStrength.score <= 3 ? 'text-teal-500' :
                              'text-emerald-500'
                          }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { label: 'A-Z', met: passwordStrength.hasUppercase },
                          { label: 'a-z', met: passwordStrength.hasLowercase },
                          { label: '0-9', met: passwordStrength.hasNumber },
                          { label: '!@#', met: passwordStrength.hasSpecial },
                          { label: '8+', met: passwordStrength.hasMinLength }
                        ].map((req) => (
                          <span
                            key={req.label}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${req.met
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                              }`}
                          >
                            {req.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                  className={`w-full flex justify-center transition-opacity duration-300 ${googleError || !googleInitialized ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}
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

