/// <reference types="vite/client" />
import { FormEvent, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AppIcon from '../components/AppIcon';
import {
  validateEmailFormat,
  validatePasswordStrength,
  getPasswordStrength,
  recordFailedAttempt,
  clearLoginAttempts,
  isAccountLockedOut
} from '../utils/authSecurity';
import {
  verifyRecaptcha,
  isRecaptchaConfigured,
  isTurnstileConfigured,
  isEmailRegistered,
  verifyEmailExists,
  isEmailVerificationConfigured,
  hashPassword,
  verifyTurnstile
} from '../utils/securityService';

type Mode = 'login' | 'signup';

// Auth flow step types
type AuthStep = 'email' | 'otp' | 'credentials';

// Check if user exists in localStorage (mock registered users)
const registeredEmails = ['admin@exportrack.com', 'demo@exportrack.com', 'user@example.com'];

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, loginWithGoogleToken, logout, state } = useAppContext();
  const { isAuthenticated, user } = state;
  const [mode, setMode] = useState<Mode>('login');
  const [authStep, setAuthStep] = useState<AuthStep>('email');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP fields
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const RESEND_COOLDOWN = 30; // 30 seconds cooldown

  // OTP input refs for auto-focus
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Error states - inline errors only
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');

  // Track touched fields
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    firstName: false,
    lastName: false,
    otp: false
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Captcha states
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaSuccess, setCaptchaSuccess] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const turnstileRef = useRef<any>(null);

  // Email verification
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Get password strength for signup
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  // Check lockout status - ONLY for login mode
  const lockoutStatus = useMemo(() => {
    if (mode !== 'login') return { locked: false, remainingAttempts: 5 };
    return isAccountLockedOut(email);
  }, [email, mode]);

  // Check if CAPTCHA is configured (Turnstile or reCAPTCHA)
  const captchaEnabled = useMemo(() => isTurnstileConfigured() || isRecaptchaConfigured(), []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Initialize Cloudflare Turnstile
  useEffect(() => {
    let mounted = true;

    const loadTurnstile = async () => {
      // Check if Turnstile is already loaded
      if ((window as any).turnstile) {
        renderTurnstile();
        return;
      }

      // Load Turnstile script
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.id = 'turnstile-script';

      script.onload = () => {
        if (mounted) renderTurnstile();
      };

      document.head.appendChild(script);
    };

    const renderTurnstile = () => {
      const container = document.getElementById('turnstile-container');
      const tokenInput = document.getElementById('turnstile-token');

      if (container && (window as any).turnstile && tokenInput) {
        try {
          (window as any).turnstile.render(container, {
            sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAA_TestSiteKey',
            callback: (token: string) => {
              setCaptchaVerified(true);
              setCaptchaSuccess(true);
              setCaptchaError('');
              setCaptchaToken(token);
            },
            'expired-callback': () => {
              setCaptchaVerified(false);
              setCaptchaSuccess(false);
              setCaptchaToken('');
            },
            'error-callback': () => {
              setCaptchaVerified(false);
              setCaptchaSuccess(false);
              setCaptchaToken('');
              setCaptchaError('CAPTCHA verification failed. Please try again.');
            }
          });
        } catch (err) {
          console.error('Turnstile render error:', err);
        }
      }
    };

    if (captchaEnabled) {
      loadTurnstile();
    }

    return () => {
      mounted = false;
    };
  }, [captchaEnabled, mode]);

  // Initialize Google Sign-In
  useEffect(() => {
    let mounted = true;
    let attempts = 0;

    const initializeGoogleSDK = async () => {
      try {
        console.log('🔍 Initializing Google Sign-In (Attempts:', attempts, ')...');

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

      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
        auto_select: false,
        itp_support: true,
      });

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

  // Handle form field changes with real-time validation
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
    if (firstNameError) setFirstNameError('');
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
    if (lastNameError) setLastNameError('');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailVerified(false);

    // Clear errors on type
    if (emailError) setEmailError('');

    // Real-time validation as user types
    if (value) {
      const result = validateEmailFormat(value);
      if (!result.isValid) {
        setEmailError(result.error || 'Invalid email format');
      } else {
        setEmailError('');
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  // Validate on blur
  const handleFirstNameBlur = () => {
    setTouched(prev => ({ ...prev, firstName: true }));
    if (mode === 'signup') {
      if (!firstName.trim()) {
        setFirstNameError('First name is required');
      } else if (firstName.trim().length < 2) {
        setFirstNameError('First name must be at least 2 characters');
      } else {
        setFirstNameError('');
      }
    }
  };

  const handleLastNameBlur = () => {
    setTouched(prev => ({ ...prev, lastName: true }));
    if (mode === 'signup') {
      if (!lastName.trim()) {
        setLastNameError('Last name is required');
      } else if (lastName.trim().length < 2) {
        setLastNameError('Last name must be at least 2 characters');
      } else {
        setLastNameError('');
      }
    }
  };

  // Validate email - Step 1 of the flow
  const handleEmailBlur = async () => {
    setTouched(prev => ({ ...prev, email: true }));
    if (email) {
      const result = validateEmailFormat(email);
      if (!result.isValid) {
        setEmailError(result.error || 'Enter a valid email');
      } else {
        setEmailError('');
      }
    }
  };

  // Proceed to OTP after valid email
  const handleProceedToOtp = async () => {
    if (!email) {
      setEmailError('Email is required');
      setTouched(prev => ({ ...prev, email: true }));
      return;
    }

    const result = validateEmailFormat(email);
    if (!result.isValid) {
      setEmailError(result.error || 'Enter a valid email');
      setTouched(prev => ({ ...prev, email: true }));
      return;
    }

    setIsVerifyingEmail(true);
    setEmailError('');

    try {
      // Call backend to validate email exists
      const response = await fetch('/api/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok || !data.isValid) {
        setEmailError(data.error || 'This email does not exist. Please enter a valid email.');
        setTouched(prev => ({ ...prev, email: true }));
        return;
      }

      // Email is valid, proceed to send OTP
      await sendOTP();
      setEmailVerified(true);
      setAuthStep('otp');
    } catch (err) {
      // If API fails, still allow for development (fallback)
      console.error('Email validation error:', err);
      setEmailVerified(true);
      setAuthStep('otp');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Send OTP to email
  const sendOTP = async () => {
    setIsSendingOtp(true);
    setOtpError('');

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.retryAfter) {
          setOtpError(`Please wait ${data.retryAfter} minutes before requesting another OTP`);
        } else {
          setOtpError(data.error || 'Failed to send OTP. Please try again.');
        }
        return;
      }

      setOtpSent(true);
      setOtpExpiry(data.expiresIn);
      setCountdown(RESEND_COOLDOWN); // 30 seconds cooldown before resend
    } catch (err) {
      console.error('Send OTP error:', err);
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter the 6-digit code');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpAttempts(prev => prev + 1);

        if (data.locked) {
          setOtpError(data.error || 'Too many failed attempts. Please request a new OTP.');
          return;
        }

        if (data.attemptsRemaining) {
          setOtpError(`${data.error}. ${data.attemptsRemaining} attempt(s) remaining.`);
        } else {
          setOtpError(data.error || 'Invalid OTP');
        }
        return;
      }

      // OTP verified successfully
      setAuthStep('credentials');
    } catch (err) {
      console.error('Verify OTP error:', err);
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle OTP input change with auto-focus
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = otp.split('');
    newOtp[index] = value.slice(-1);
    const joinedOtp = newOtp.join('');
    setOtp(joinedOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (joinedOtp.length === 6) {
      verifyOTP();
    }
  };

  // Handle OTP keydown for backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste OTP
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    setOtp(pastedData);
    setOtpError('');

    // Focus last filled input
    const lastIndex = pastedData.length - 1;
    if (lastIndex < 5) {
      otpInputRefs.current[lastIndex]?.focus();
    } else {
      // Auto-verify if complete
      setTimeout(() => verifyOTP(), 100);
    }
  };

  // Go back to email step
  const handleBackToEmail = () => {
    setAuthStep('email');
    setOtp('');
    setOtpError('');
    setOtpAttempts(0);
    setOtpSent(false);
    setOtpExpiry(null);
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    if (password && mode === 'signup') {
      const result = validatePasswordStrength(password);
      if (!result.isValid) {
        setPasswordError(result.error || 'Password is too weak');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    // Get the redirect path
    const from = location.state?.from || '/dashboard';

    try {
      if (mode === 'login') {
        // ========== LOGIN MODE ==========

        // Validate email format
        if (!email) {
          setEmailError('Email is required');
          setIsLoading(false);
          return;
        }

        const emailValidation = validateEmailFormat(email);
        if (!emailValidation.isValid) {
          setEmailError(emailValidation.error || 'Please enter a valid email address');
          setIsLoading(false);
          return;
        }

        // Check lockout - ONLY for login
        if (lockoutStatus.locked) {
          setIsLoading(false);
          return;
        }

        // Check if email is registered
        const emailExists = isEmailRegistered(email) || registeredEmails.includes(email.toLowerCase());
        if (!emailExists) {
          setEmailError('Email not registered. Please sign up first.');
          setIsLoading(false);
          recordFailedAttempt(email);
          return;
        }

        // Verify CAPTCHA with Backend for login
        if (captchaEnabled) {
          if (!captchaVerified || !captchaToken) {
            setCaptchaError('Please complete the human verification');
            setIsLoading(false);
            return;
          }

          const verificationResult = await verifyTurnstile(captchaToken);
          if (!verificationResult.success) {
            setCaptchaError(verificationResult.error || 'Human verification failed on server');
            setCaptchaVerified(false);
            setCaptchaSuccess(false);
            setCaptchaToken('');
            if ((window as any).turnstile) {
              (window as any).turnstile.reset();
            }
            setIsLoading(false);
            return;
          }
        }

        // Attempt login
        login(email, password);

        // Clear failed attempts on successful login
        clearLoginAttempts(email);

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 300);

      } else {
        // ========== SIGNUP MODE ==========

        // Validate first name
        if (!firstName.trim()) {
          setFirstNameError('First name is required');
          setIsLoading(false);
          return;
        }

        // Validate last name
        if (!lastName.trim()) {
          setLastNameError('Last name is required');
          setIsLoading(false);
          return;
        }

        // Validate email
        if (!email) {
          setEmailError('Email is required');
          setIsLoading(false);
          return;
        }

        const emailValidation = validateEmailFormat(email);
        if (!emailValidation.isValid) {
          setEmailError(emailValidation.error || 'Please enter a valid email address');
          setIsLoading(false);
          return;
        }

        // Check if email already registered
        if (registeredEmails.includes(email.toLowerCase())) {
          setEmailError('This email is already registered. Please login instead.');
          setIsLoading(false);
          return;
        }

        // Validate password strength
        if (!password) {
          setPasswordError('Password is required');
          setIsLoading(false);
          return;
        }

        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
          setPasswordError(passwordValidation.error || 'Password does not meet security requirements');
          setIsLoading(false);
          return;
        }

        // Verify CAPTCHA with Backend for signup
        if (captchaEnabled) {
          if (!captchaVerified || !captchaToken) {
            setCaptchaError('Please complete the human verification');
            setIsLoading(false);
            return;
          }

          const verificationResult = await verifyTurnstile(captchaToken);
          if (!verificationResult.success) {
            setCaptchaError(verificationResult.error || 'Human verification failed on server');
            setCaptchaVerified(false);
            setCaptchaSuccess(false);
            setCaptchaToken('');
            if ((window as any).turnstile) {
              (window as any).turnstile.reset();
            }
            setIsLoading(false);
            return;
          }
        }

        // Hash password before storing (for demo purposes)
        const hashedPassword = await hashPassword(password);

        // Attempt signup
        signup(`${firstName.trim()} ${lastName.trim()}`, email, hashedPassword);

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 300);
      }
    } catch (err: any) {
      // Record failed attempt for brute force protection (login only)
      if (mode === 'login') {
        recordFailedAttempt(email);
        const remainingAttempts = 5 - (parseInt(localStorage.getItem('login_attempts_' + email) || '0'));

        if (remainingAttempts <= 0) {
          // Lockout will be shown via lockoutStatus
        } else if (remainingAttempts <= 2) {
          setPasswordError(`Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`);
        } else {
          setPasswordError('Invalid email or password');
        }
      }
      setIsLoading(false);
    }
  };

  // Already authenticated view
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

  // Toggle between login and signup
  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    // Clear all errors and form fields
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setEmailError('');
    setPasswordError('');
    setFirstNameError('');
    setLastNameError('');
    setTouched({ email: false, password: false, firstName: false, lastName: false, otp: false });
    setCaptchaVerified(false);
    setCaptchaSuccess(false);
    setCaptchaError('');
    setCaptchaToken('');
    // Reset auth flow
    setAuthStep('email');
    setOtp('');
    setOtpError('');
    setOtpAttempts(0);
    setOtpSent(false);
    if ((window as any).turnstile) {
      (window as any).turnstile.reset();
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 items-center justify-center px-4 py-8 md:py-0">
      <div className="w-full max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl grid md:grid-cols-[1.2fr_1fr]">
          {/* Left Section - Info Panel */}
          <section className="hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-8 md:p-12 text-white md:flex flex-col justify-center gap-12 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-teal-500/20 blur-[100px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />

            <div className="relative z-10 w-full max-w-md mx-auto">
              {/* Branding */}
              <div className="flex items-center gap-4 mb-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.2)] ring-4 ring-white/10 overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                  <img src="/logo.svg" alt="ExporTrack-AI Logo" className="h-8 w-8 object-contain" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
                  ExporTrack<span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">AI</span>
                </h1>
              </div>
              
              {/* Headline & Subtext */}
              <div className="mb-12">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                  Streamline Your Logistics with AI
                </h2>
                <p className="text-lg text-slate-300 font-light leading-relaxed">
                  Access the logistics operating layer where shipment documentation, AI extraction, and compliance checks are unified in one powerful platform.
                </p>
              </div>

              {/* Feature List */}
              <ul className="space-y-4">
                <li className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 cursor-default border border-transparent hover:border-white/10 backdrop-blur-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 group-hover:scale-110 transition-all duration-300 ring-1 ring-white/5 group-hover:ring-teal-500/30">
                    <AppIcon name="check" className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Real-time tracking of pending & rejected files</span>
                </li>
                <li className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 cursor-default border border-transparent hover:border-white/10 backdrop-blur-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 group-hover:scale-110 transition-all duration-300 ring-1 ring-white/5 group-hover:ring-teal-500/30">
                    <AppIcon name="check" className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">AI-powered OCR file validation</span>
                </li>
                <li className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 cursor-default border border-transparent hover:border-white/10 backdrop-blur-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 group-hover:scale-110 transition-all duration-300 ring-1 ring-white/5 group-hover:ring-teal-500/30">
                    <AppIcon name="check" className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Secure role-based collaboration workflows</span>
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-8 right-8 z-10">
              <div className="pt-6 border-t border-white/10">
                <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                  Enterprise-grade logistics trusted by global operations
                </p>
              </div>
            </div>
          </section>

          {/* Right Section - Auth Form */}
          <section className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
            <div className="w-full max-w-sm mx-auto">
              {/* Header */}
              <div className="mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100" style={{ letterSpacing: '-0.02em' }}>
                  {authStep === 'email'
                    ? (mode === 'login' ? 'Welcome back' : 'Create your account')
                    : authStep === 'otp'
                      ? 'Verify your email'
                      : (mode === 'login' ? 'Welcome back' : 'Create your account')
                  }
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {authStep === 'email'
                    ? (mode === 'login'
                      ? 'Sign in to access your shipments and AI tools'
                      : 'Join ExporTrack-AI to manage your logistics')
                    : authStep === 'otp'
                      ? `We've sent a verification code to ${email}`
                      : (mode === 'login'
                        ? 'Sign in to access your shipments and AI tools'
                        : 'Join ExporTrack-AI to manage your logistics')
                  }
                </p>
              </div>

              {/* Lockout Warning Banner - ONLY show on Login */}
              {lockoutStatus.locked && mode === 'login' && authStep === 'credentials' && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50">
                  <div className="flex items-start gap-2">
                    <AppIcon name="warning" className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Account Temporarily Locked</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        Too many failed login attempts. Please try again in {lockoutStatus.remainingMinutes} minute{lockoutStatus.remainingMinutes !== 1 ? 's' : ''}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CAPTCHA Error Message */}
              {captchaError && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50">
                  <div className="flex items-start gap-2">
                    <AppIcon name="warning" className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-800 dark:text-amber-300">CAPTCHA Required</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{captchaError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* STEP 1: Email Input */}
                {authStep === 'email' && (
                  <>
                    {/* Email Field */}
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
                          disabled={isLoading || isGoogleLoading || isVerifyingEmail}
                          autoComplete="email"
                        />
                        {touched.email && email && !emailError && !isVerifyingEmail && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <AppIcon name="check" className="h-5 w-5 text-emerald-500" />
                          </div>
                        )}
                        {isVerifyingEmail && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></span>
                          </div>
                        )}
                      </div>
                      {emailError && touched.email && (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <AppIcon name="warning" className="h-3 w-3 flex-shrink-0" />
                          {emailError}
                        </p>
                      )}
                    </div>

                    {/* Continue Button */}
                    <button
                      type="button"
                      onClick={handleProceedToOtp}
                      className="btn-primary w-full mt-5 md:mt-6"
                      disabled={isLoading || isGoogleLoading || isVerifyingEmail || !email}
                    >
                      {isVerifyingEmail ? (
                        <span className="flex items-center gap-2 justify-center">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                          Verifying...
                        </span>
                      ) : (
                        'Continue'
                      )}
                    </button>
                  </>
                )}

                {/* STEP 2: OTP Input */}
                {authStep === 'otp' && (
                  <>
                    {/* OTP Input */}
                    <div>
                      <label htmlFor="otp" className="input-label">
                        Verification Code
                      </label>
                      <div className="flex justify-center gap-2 mt-2" onPaste={handleOtpPaste}>
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <input
                            key={index}
                            ref={(el) => { otpInputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={otp[index] || ''}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onFocus={(e) => e.target.select()}
                            className={`w-12 h-12 text-center text-xl font-bold rounded-lg border-2 transition-all
                              ${otpError
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 focus:border-rose-500 focus:ring-rose-500/20'
                                : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:border-teal-500 focus:ring-teal-500/20'
                              } focus:outline-none focus:ring-2`}
                            disabled={isVerifyingOtp}
                          />
                        ))}
                      </div>
                      {otpError && (
                        <p className="mt-3 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
                          <AppIcon name="warning" className="h-3 w-3 flex-shrink-0" />
                          {otpError}
                        </p>
                      )}
                      {otpSent && !otpError && (
                        <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                          <AppIcon name="check" className="h-3 w-3 flex-shrink-0" />
                          Code sent! Check your email.
                        </p>
                      )}
                    </div>

                    {/* Verify Button */}
                    <button
                      type="button"
                      onClick={verifyOTP}
                      className="btn-primary w-full mt-5 md:mt-6"
                      disabled={isVerifyingOtp || otp.length !== 6}
                    >
                      {isVerifyingOtp ? (
                        <span className="flex items-center gap-2 justify-center">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                          Verifying...
                        </span>
                      ) : (
                        'Verify Code'
                      )}
                    </button>

                    {/* Resend OTP */}
                    <div className="text-center mt-4">
                      {countdown > 0 ? (
                        <p className="text-sm text-slate-500">
                          Resend code in <span className="font-semibold text-teal-600">{countdown}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={sendOTP}
                          className="text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                          disabled={isSendingOtp}
                        >
                          {isSendingOtp ? 'Sending...' : 'Resend code'}
                        </button>
                      )}
                    </div>

                    {/* Back Button */}
                    <div className="text-center mt-2">
                      <button
                        type="button"
                        onClick={handleBackToEmail}
                        className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        disabled={isVerifyingOtp}
                      >
                        ← Use a different email
                      </button>
                    </div>
                  </>
                )}

                {/* STEP 3: Credentials (after OTP verified) */}
                {authStep === 'credentials' && (
                  <>
                    {/* First Name + Last Name for Signup */}
                    {mode === 'signup' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="first-name" className="input-label">
                            First Name
                          </label>
                          <input
                            id="first-name"
                            type="text"
                            value={firstName}
                            onChange={handleFirstNameChange}
                            onBlur={handleFirstNameBlur}
                            className={`input-field ${firstNameError && touched.firstName ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                            placeholder="Jane"
                            disabled={isLoading || isGoogleLoading}
                            autoComplete="given-name"
                          />
                          {firstNameError && touched.firstName && (
                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <AppIcon name="warning" className="h-3 w-3 flex-shrink-0" />
                              {firstNameError}
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="last-name" className="input-label">
                            Last Name
                          </label>
                          <input
                            id="last-name"
                            type="text"
                            value={lastName}
                            onChange={handleLastNameChange}
                            onBlur={handleLastNameBlur}
                            className={`input-field ${lastNameError && touched.lastName ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                            placeholder="Doe"
                            disabled={isLoading || isGoogleLoading}
                            autoComplete="family-name"
                          />
                          {lastNameError && touched.lastName && (
                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <AppIcon name="warning" className="h-3 w-3 flex-shrink-0" />
                              {lastNameError}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Verified Email Badge */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                        <AppIcon name="check" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Email verified</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">{email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleBackToEmail}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                      >
                        Change
                      </button>
                    </div>

                    {/* Password Field with Eye Toggle */}
                    <div>
                      <label htmlFor="password" className="input-label">
                        Password
                        {mode === 'signup' && (
                          <span className="ml-1 text-xs font-normal text-slate-400">
                            (8+ chars, uppercase, lowercase, number, symbol)
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={handlePasswordChange}
                          onBlur={handlePasswordBlur}
                          required
                          minLength={mode === 'signup' ? 8 : 6}
                          className={`input-field pr-10 ${passwordError && touched.password ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                          placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                          disabled={isLoading || isGoogleLoading}
                          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
                          tabIndex={-1}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {passwordError && touched.password && (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <AppIcon name="warning" className="h-3 w-3 flex-shrink-0" />
                          {passwordError}
                        </p>
                      )}

                      {/* Password Strength Indicator (Signup mode only) */}
                      {mode === 'signup' && password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${passwordStrength.score <= 20 ? 'bg-rose-500' :
                                  passwordStrength.score <= 60 ? 'bg-amber-500' :
                                    passwordStrength.score <= 80 ? 'bg-teal-500' :
                                      'bg-emerald-500'
                                  }`}
                                style={{ width: `${Math.max(20, passwordStrength.score)}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium whitespace-nowrap ${passwordStrength.score <= 20 ? 'text-rose-500' :
                              passwordStrength.score <= 60 ? 'text-amber-500' :
                                passwordStrength.score <= 80 ? 'text-teal-500' :
                                  'text-emerald-500'
                              }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: 'A-Z', met: passwordStrength.hasUppercase },
                              { label: 'a-z', met: passwordStrength.hasLowercase },
                              { label: '0-9', met: passwordStrength.hasNumber },
                              { label: '!@#', met: passwordStrength.hasSpecial },
                              { label: '8+', met: passwordStrength.hasMinLength }
                            ].map((req) => (
                              <span
                                key={req.label}
                                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${req.met
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

                    {/* Cloudflare Turnstile CAPTCHA - Only show when enabled */}
                    {captchaEnabled && (
                      <div className="flex flex-col items-center">
                        <div
                          id="turnstile-container"
                          className={`g-recaptcha transition-all duration-300 ${captchaSuccess ? 'border-2 border-emerald-500 rounded-lg' : ''}`}
                          data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAA_TestSiteKey'}
                        />
                        {/* Hidden input to store token */}
                        <input type="hidden" id="turnstile-token" />

                        {/* Success indicator - shown after verification */}
                        {captchaSuccess && (
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mt-3 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-semibold">Success!</span>
                          </div>
                        )}

                        {/* Error indicator */}
                        {captchaError && !captchaSuccess && (
                          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mt-3 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                            <AppIcon name="warning" className="h-4 w-4" />
                            <span className="text-xs font-medium">Please complete human verification</span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      className={`btn-primary w-full mt-5 md:mt-6 ${captchaEnabled && !captchaVerified ? 'opacity-75' : ''}`}
                      disabled={isLoading || isGoogleLoading || (captchaEnabled && !captchaVerified)}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2 justify-center">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                          {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                        </span>
                      ) : (
                        <>
                          {mode === 'login' ? 'Sign In' : 'Create Account'}
                          {captchaEnabled && !captchaVerified && (
                            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs">
                              <AppIcon name="shield" className="h-3 w-3" />
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>

              {/* Divider - Only show when not in OTP step */}
              {authStep !== 'otp' && (
                <>
                  <div className="my-5 md:my-6 flex items-center gap-3">
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

                    <div
                      id="google-signin-button"
                      className={`w-full flex justify-center transition-opacity duration-300 ${googleError || !googleInitialized ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}
                    />
                  </div>
                </>
              )}

              {/* Toggle Mode - Only show when not in OTP step */}
              {authStep !== 'otp' && (
                <div className="mt-5 md:mt-6 text-center">
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
              )}

              {/* Security Footer */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-3 md:gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  {captchaEnabled && (
                    <div className="flex items-center gap-1">
                      <AppIcon name="shield" className="h-3.5 w-3.5 text-teal-500" />
                      <span>Turnstile Protected</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <AppIcon name="shield" className="h-3.5 w-3.5 text-teal-500" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AppIcon name="check" className="h-3.5 w-3.5 text-teal-500" />
                    <span>Encrypted</span>
                  </div>
                  {authStep === 'credentials' && (
                    <div className="flex items-center gap-1">
                      <AppIcon name="check" className="h-3.5 w-3.5 text-teal-500" />
                      <span>Email Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 px-4">
          Protected by enterprise-grade security • Privacy Policy • Terms of Service
        </p>
      </div>
    </div>
  );
}
