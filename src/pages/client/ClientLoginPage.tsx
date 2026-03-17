import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import AppIcon from '../../components/AppIcon';
import {
  isRecaptchaConfigured,
  verifyRecaptcha,
  isEmailRegistered,
  validateEmailFormat
} from '../../utils/securityService';
import {
  isAccountLockedOut,
  recordFailedAttempt,
  clearLoginAttempts
} from '../../utils/authSecurity';

export default function ClientLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const { login } = useAppContext();
  const navigate = useNavigate();

  // Check if CAPTCHA is configured
  const captchaEnabled = useMemo(() => isRecaptchaConfigured(), []);

  // Check lockout status
  const lockoutStatus = useMemo(() => isAccountLockedOut(email), [email]);

  // Handle email change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
    if (error && error.includes('not registered')) {
      setError('');
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  // Validate email on blur
  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    if (email) {
      const result = validateEmailFormat(email);
      setEmailError(result.isValid ? '' : result.error || '');
    }
  };

  // Validate password on blur
  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    if (!password) {
      setPasswordError('Password is required');
    } else {
      setPasswordError('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    setCaptchaError('');
    setIsLoading(true);

    // Check lockout
    if (lockoutStatus.locked) {
      setError(`Account is temporarily locked due to too many failed attempts. Please try again in ${lockoutStatus.remainingMinutes} minutes.`);
      setIsLoading(false);
      return;
    }

    // Validate email format
    if (!email) {
      setEmailError('Email is required');
      setIsLoading(false);
      return;
    }

    const emailValidation = validateEmailFormat(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email format');
      setIsLoading(false);
      return;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      setIsLoading(false);
      return;
    }

    // Verify CAPTCHA if enabled
    if (captchaEnabled && !captchaVerified) {
      try {
        const captchaResult = await verifyRecaptcha('client_login');
        if (!captchaResult.success) {
          setCaptchaError('Please complete the CAPTCHA verification to continue');
          setIsLoading(false);
          return;
        }
        setCaptchaVerified(true);
      } catch (err) {
        setCaptchaError('CAPTCHA verification failed. Please try again.');
        setIsLoading(false);
        return;
      }
    }

    // Check if email is registered
    setIsCheckingEmail(true);
    const isRegistered = isEmailRegistered(email);
    setIsCheckingEmail(false);

    if (!isRegistered) {
      // Record failed attempt
      recordFailedAttempt(email);
      const attempts = parseInt(localStorage.getItem(`login_attempts_${email}`) || '0');
      const remainingAttempts = 5 - attempts;

      if (remainingAttempts <= 0) {
        setError('Account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.');
      } else {
        setError(`Email not registered. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before lockout.`);
      }
      setIsLoading(false);
      return;
    }

    try {
      // For demo, we just auto-login a mock client
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockedClient = {
        name: email.split('@')[0] || 'Client Name',
        email: email || 'client@example.com',
        role: 'Client' as const
      };

      // Clear failed attempts on successful login
      clearLoginAttempts(email);

      login(email, "client123");
      navigate('/client/dashboard');
    } catch {
      // Record failed attempt
      recordFailedAttempt(email);
      const attempts = parseInt(localStorage.getItem(`login_attempts_${email}`) || '0');
      const remainingAttempts = 5 - attempts;

      if (remainingAttempts <= 0) {
        setError('Account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.');
      } else {
        setError(`Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before lockout.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/20 mb-6">
            <AppIcon name="shipments" className="h-8 w-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.04em' }}>
            Client Portal
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Sign in to track and manage your global shipments
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

          <form onSubmit={handleLogin} className="space-y-6 relative">
            {/* Main Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 p-4 text-sm text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/50">
                <AppIcon name="warning" className="h-4 w-4 shrink-0" />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            {/* Lockout Warning */}
            {lockoutStatus.locked && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50">
                <AppIcon name="warning" className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">Account Temporarily Locked</p>
                  <p className="text-xs mt-1">Too many failed attempts. Try again in {lockoutStatus.remainingMinutes} minutes.</p>
                </div>
              </div>
            )}

            {/* CAPTCHA Error */}
            {captchaError && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50">
                <AppIcon name="warning" className="h-4 w-4 shrink-0" />
                <p className="font-semibold">{captchaError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                  Client Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <AppIcon name="team" className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    required
                    disabled={isLoading || isCheckingEmail}
                    className={`block w-full rounded-xl border py-3 pl-11 pr-4 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-4 ${emailError && touched.email
                      ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500/10 dark:bg-rose-950/20 dark:border-rose-700'
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-400 dark:focus:bg-slate-900'
                      }`}
                    placeholder="you@company.com"
                  />
                  {touched.email && email && !emailError && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AppIcon name="check" className="h-5 w-5 text-emerald-500" />
                    </div>
                  )}
                </div>
                {emailError && touched.email && (
                  <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AppIcon name="warning" className="h-3 w-3" />
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <AppIcon name="shield" className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    required
                    disabled={isLoading}
                    className={`block w-full rounded-xl border py-3 pl-11 pr-4 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-4 ${passwordError && touched.password
                      ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500/10 dark:bg-rose-950/20 dark:border-rose-700'
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-400 dark:focus:bg-slate-900'
                      }`}
                    placeholder="••••••••"
                  />
                </div>
                {passwordError && touched.password && (
                  <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AppIcon name="warning" className="h-3 w-3" />
                    {passwordError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:ring-offset-slate-950 transition-colors"
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                  Remember me
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isCheckingEmail}
              className="group relative flex w-full justify-center rounded-xl bg-indigo-600 py-3.5 px-4 text-sm font-bold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading || isCheckingEmail ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                  {isCheckingEmail ? 'Checking...' : 'Signing in...'}
                </span>
              ) : (
                <>
                  Sign in to Portal
                  {captchaEnabled && !captchaVerified && (
                    <span className="ml-2 inline-flex items-center">
                      <AppIcon name="shield" className="h-4 w-4 opacity-50" />
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Security Footer */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                {captchaEnabled && (
                  <div className="flex items-center gap-1">
                    <AppIcon name="shield" className="h-3.5 w-3.5 text-indigo-500" />
                    <span>reCAPTCHA</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <AppIcon name="check" className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Secure</span>
                </div>
              </div>
            </div>
          </form>

          {/* Quick Demo Access Note */}
          <div className="mt-8 border-t border-slate-200/60 dark:border-slate-800/60 pt-6 text-center">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Click sign in to enter demo customer mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
