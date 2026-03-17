/**
 * Security Service
 * Handles reCAPTCHA verification, email verification API, and password hashing
 */

// ============================================================================
// reCAPTCHA Configuration
// ============================================================================

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const RECAPTCHA_THRESHOLD = 0.5; // Minimum score for reCAPTCHA v3

// Track reCAPTCHA script loading state
let recaptchaLoaded = false;
let recaptchaLoading = false;

/**
 * Load reCAPTCHA script dynamically
 */
function loadRecaptchaScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (recaptchaLoaded) {
            resolve();
            return;
        }

        if (recaptchaLoading) {
            // Wait for existing load to complete
            const checkLoaded = setInterval(() => {
                if (recaptchaLoaded) {
                    clearInterval(checkLoaded);
                    resolve();
                }
            }, 100);
            return;
        }

        recaptchaLoading = true;

        if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === 'your_recaptcha_site_key_here') {
            console.warn('reCAPTCHA site key not configured. CAPTCHA verification is disabled.');
            recaptchaLoaded = true;
            recaptchaLoading = false;
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            recaptchaLoaded = true;
            recaptchaLoading = false;
            console.log('reCAPTCHA script loaded');
            resolve();
        };

        script.onerror = () => {
            recaptchaLoading = false;
            console.error('Failed to load reCAPTCHA script');
            reject(new Error('Failed to load reCAPTCHA'));
        };

        document.head.appendChild(script);
    });
}

/**
 * Execute reCAPTCHA verification
 * Returns true if CAPTCHA is verified, false otherwise
 */
export async function verifyRecaptcha(action: string = 'login'): Promise<{
    success: boolean;
    score?: number;
    error?: string;
}> {
    // If no reCAPTCHA key is configured, skip verification
    if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === 'your_recaptcha_site_key_here') {
        console.log('reCAPTCHA not configured, skipping verification');
        return { success: true };
    }

    try {
        await loadRecaptchaScript();

        // Check if grecaptcha is available
        const grecaptcha = (window as any).grecaptcha;
        if (!grecaptcha) {
            return { success: false, error: 'reCAPTCHA not available' };
        }

        // Execute reCAPTCHA v3
        const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });

        if (!token) {
            return { success: false, error: 'CAPTCHA token not generated' };
        }

        // In a real implementation, you MUST send this token to your backend server
        // to verify with Google's API and get a score. Since this is frontend-only,
        // we'll do a basic validation.
        //
        // ⚠️ SECURITY NOTE: Frontend-only reCAPTCHA is NOT secure!
        // Attackers can bypass client-side verification by:
        // 1. Using browser dev tools to intercept and modify responses
        // 2. Using automated tools that can solve CAPTCHA
        // 3. Reverse engineering the JS to understand the verification logic
        //
        // FOR PRODUCTION:
        // 1. Send token to your backend API endpoint
        // 2. Backend calls Google reCAPTCHA API:
        //    POST https://www.google.com/recaptcha/api/siteverify
        //    Parameters: secret=YOUR_SECRET_KEY&response=TOKEN
        // 3. Parse the JSON response for 'score' and 'success'
        // 4. Block requests with low scores (< 0.5) or failed verification
        //
        // Your backend should store VITE_RECAPTCHA_SECRET_KEY (never expose this!)
        // Example backend verification: https://developers.google.com/recaptcha/docs/v3#server-side_implementation

        console.log('reCAPTCHA token generated:', token.substring(0, 20) + '...');

        return { success: true };
    } catch (error: any) {
        console.error('reCAPTCHA verification error:', error);
        return { success: false, error: error.message || 'CAPTCHA verification failed' };
    }
}

/**
 * Check if reCAPTCHA is configured and available
 */
export function isRecaptchaConfigured(): boolean {
    return !!RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== 'your_recaptcha_site_key_here';
}

// ============================================================================
// Email Verification API
// ============================================================================

const EMAIL_VERIFICATION_API_KEY = import.meta.env.VITE_EMAIL_VERIFICATION_API_KEY;
const EMAIL_VERIFICATION_PROVIDER = import.meta.env.VITE_EMAIL_VERIFICATION_PROVIDER;

/**
 * Verify if an email actually exists using external API
 * Note: This requires an API key from Abstract API or ZeroBounce
 */
export async function verifyEmailExists(email: string): Promise<{
    isValid: boolean;
    isDisposable: boolean;
    error?: string;
    details?: {
        isValidFormat: boolean;
        domainExists: boolean;
        isCatchAll: boolean;
        emailExists?: boolean;
    };
}> {
    // If no API key is configured, do basic validation only
    if (!EMAIL_VERIFICATION_API_KEY || EMAIL_VERIFICATION_API_KEY === 'your_email_verification_api_key_here') {
        console.log('Email verification API not configured, skipping domain validation');

        // Still do basic format validation
        const formatValidation = validateEmailFormat(email);
        return {
            isValid: formatValidation.isValid,
            isDisposable: false,
            details: {
                isValidFormat: formatValidation.isValid,
                domainExists: true, // Assume exists if no API
                isCatchAll: false
            }
        };
    }

    try {
        let apiUrl = '';

        if (EMAIL_VERIFICATION_PROVIDER === 'abstract') {
            // Abstract API
            apiUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=${EMAIL_VERIFICATION_API_KEY}&email=${encodeURIComponent(email)}`;
        } else if (EMAIL_VERIFICATION_PROVIDER === 'zerobounce') {
            // ZeroBounce API
            apiUrl = `https://api.zerobounce.net/v2/validate?api_key=${EMAIL_VERIFICATION_API_KEY}&email=${encodeURIComponent(email)}`;
        } else {
            // Default to Abstract
            apiUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=${EMAIL_VERIFICATION_API_KEY}&email=${encodeURIComponent(email)}`;
        }

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (EMAIL_VERIFICATION_PROVIDER === 'abstract') {
            // Abstract API response format
            const isValid = data.is_valid_format?.value === true && data.is_disposable?.value === false;

            return {
                isValid,
                isDisposable: data.is_disposable?.value === true,
                error: isValid ? undefined : 'Email domain or format is invalid',
                details: {
                    isValidFormat: data.is_valid_format?.value === true,
                    domainExists: data.is_domain_exists?.value === true,
                    isCatchAll: data.is_catch_all?.value === true,
                    emailExists: data.is_deliverable?.value
                }
            };
        } else if (EMAIL_VERIFICATION_PROVIDER === 'zerobounce') {
            // ZeroBounce API response format
            const isValid = data.status === 'valid' && data.disposable === false;

            return {
                isValid,
                isDisposable: data.disposable === true,
                error: isValid ? undefined : `Email is ${data.status}`,
                details: {
                    isValidFormat: data.status !== 'invalid',
                    domainExists: data.domain !== '',
                    isCatchAll: data.catch_all === true,
                    emailExists: data.status === 'valid'
                }
            };
        }

        return { isValid: true, isDisposable: false };
    } catch (error: any) {
        console.error('Email verification error:', error);
        // On error, allow the email but log the error
        return {
            isValid: true,
            isDisposable: false,
            error: 'Email verification service unavailable'
        };
    }
}

/**
 * Check if email verification API is configured
 */
export function isEmailVerificationConfigured(): boolean {
    return !!EMAIL_VERIFICATION_API_KEY &&
        EMAIL_VERIFICATION_API_KEY !== 'your_email_verification_api_key_here';
}

// ============================================================================
// Registered User Check
// ============================================================================

// Mock registered users database
// In a real app, this would be your backend database
const REGISTERED_USERS_KEY = 'exportrack-registered-users';

/**
 * Get registered users from localStorage (for demo purposes)
 */
function getRegisteredUsers(): Set<string> {
    try {
        const stored = localStorage.getItem(REGISTERED_USERS_KEY);
        if (stored) {
            return new Set(JSON.parse(stored));
        }
    } catch (e) {
        console.error('Error reading registered users:', e);
    }

    // Default registered emails for demo
    return new Set([
        'admin@exportrack.com',
        'demo@exportrack.com',
        'user@example.com',
        'test@test.com'
    ]);
}

/**
 * Save a new registered user
 */
export function saveRegisteredUser(email: string): void {
    try {
        const users = getRegisteredUsers();
        users.add(email.toLowerCase());
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify([...users]));
    } catch (e) {
        console.error('Error saving registered user:', e);
    }
}

/**
 * Check if an email is registered in our system
 */
export function isEmailRegistered(email: string): boolean {
    const normalizedEmail = email.toLowerCase().trim();
    const registeredUsers = getRegisteredUsers();
    return registeredUsers.has(normalizedEmail);
}

/**
 * Register a new user in our system
 */
export function registerUser(email: string): boolean {
    if (isEmailRegistered(email)) {
        return false; // Already registered
    }
    saveRegisteredUser(email);
    return true;
}

// ============================================================================
// Password Hashing (Web Crypto API)
// ============================================================================

/**
 * Hash a password using Web Crypto API (SHA-256 with salt)
 * 
 * ⚠️ SECURITY WARNING: This implementation is for DEMO/EDUCATIONAL purposes only!
 * 
 * Using SHA-256 for password hashing is cryptographically insecure because:
 * - SHA-256 is designed for speed, making it vulnerable to brute-force attacks
 * - It lacks built-in salting mechanism proper for password storage
 * - Rainbow tables can reverse SHA-256 hashes quickly
 * 
 * FOR PRODUCTION USE:
 * - Always hash passwords on the BACKEND server
 * - Use proper password hashing algorithms like bcrypt, scrypt, or Argon2
 * - Never store or process passwords client-side in production
 * 
 * This code should only be used for:
 * - Client-side demo/mock scenarios
 * - Educational purposes to understand hashing concepts
 * - Temporary local storage where security is not critical
 */
export async function hashPassword(password: string): Promise<string> {
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

    // Encode password
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    // Combine salt and password
    const combinedData = encoder.encode(saltHex + password);

    // Hash using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', combinedData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Return salt:hash format
    return `${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a stored hash
 * 
 * ⚠️ WARNING: This function has the same security limitations as hashPassword()
 * See hashPassword() for security warnings.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
        const [saltHex, originalHash] = storedHash.split(':');
        if (!saltHex || !originalHash) {
            return false;
        }

        const encoder = new TextEncoder();
        const combinedData = encoder.encode(saltHex + password);

        const hashBuffer = await crypto.subtle.digest('SHA-256', combinedData);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex === originalHash;
    } catch (e) {
        console.error('Password verification error:', e);
        return false;
    }
}

// ============================================================================
// Email Format Validation (RFC Standard)
// ============================================================================

// RFC 5322 compliant email regex (simplified but robust)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Common disposable email domains
const DISPOSABLE_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
    'icloud.com', 'mail.com', 'protonmail.com', 'aol.com', 'zoho.com',
    'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'throwaway.email'
];

/**
 * Validate email format using RFC standard
 */
export function validateEmailFormat(email: string): { isValid: boolean; error?: string } {
    if (!email || email.trim() === '') {
        return { isValid: false, error: 'Email is required' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
        return { isValid: false, error: 'Invalid email format. Please enter a valid email address' };
    }

    // Check for common typos and invalid patterns
    if (trimmedEmail.includes('..')) {
        return { isValid: false, error: 'Invalid email: consecutive dots not allowed' };
    }

    if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
        return { isValid: false, error: 'Invalid email: cannot start or end with a dot' };
    }

    if (trimmedEmail.length > 254) {
        return { isValid: false, error: 'Email address is too long' };
    }

    return { isValid: true };
}

/**
 * Check if email is from a disposable/free provider
 */
export function isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? DISPOSABLE_DOMAINS.includes(domain) : false;
}

/**
 * Get email domain
 */
export function getEmailDomain(email: string): string | null {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : null;
}

// ============================================================================
// Combined Validation Functions
// ============================================================================

export interface LoginValidationResult {
    isValid: boolean;
    errors: {
        captcha?: string;
        emailFormat?: string;
        emailRegistered?: string;
        emailExists?: string;
        password?: string;
        bruteForce?: string;
    };
}

/**
 * Validate login form with all security checks
 */
export async function validateLoginSecurity(
    email: string,
    password: string,
    captchaToken?: string
): Promise<LoginValidationResult> {
    const errors: LoginValidationResult['errors'] = {};
    let isValid = true;

    // 1. CAPTCHA verification
    if (isRecaptchaConfigured()) {
        const captchaResult = await verifyRecaptcha('login');
        if (!captchaResult.success) {
            errors.captcha = 'Please complete the CAPTCHA verification';
            isValid = false;
        }
    }

    // 2. Email format validation
    const emailFormatResult = validateEmailFormat(email);
    if (!emailFormatResult.isValid) {
        errors.emailFormat = emailFormatResult.error;
        isValid = false;
    }

    // 3. Check if email is registered
    if (emailFormatResult.isValid && !isEmailRegistered(email)) {
        errors.emailRegistered = 'Email not registered. Please sign up or use a registered email.';
        isValid = false;
    }

    // 4. Email existence verification (optional, requires API key)
    if (emailFormatResult.isValid && isEmailVerificationConfigured()) {
        const emailVerifyResult = await verifyEmailExists(email);
        if (!emailVerifyResult.isValid) {
            errors.emailExists = emailVerifyResult.error || 'Email domain does not exist or is invalid';
            isValid = false;
        }
    }

    // 5. Password validation
    if (!password || password === '') {
        errors.password = 'Password is required';
        isValid = false;
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
        isValid = false;
    }

    // 6. Brute force check
    const { isAccountLockedOut } = await import('./authSecurity');
    const lockoutStatus = isAccountLockedOut(email);
    if (lockoutStatus.locked) {
        errors.bruteForce = `Too many failed attempts. Please try again in ${lockoutStatus.remainingMinutes} minutes.`;
        isValid = false;
    }

    return { isValid, errors };
}

export interface SignupValidationResult {
    isValid: boolean;
    errors: {
        captcha?: string;
        name?: string;
        emailFormat?: string;
        emailRegistered?: string;
        emailExists?: string;
        password?: string;
    };
}

/**
 * Validate signup form with all security checks
 */
export async function validateSignupSecurity(
    name: string,
    email: string,
    password: string,
    captchaToken?: string
): Promise<SignupValidationResult> {
    const errors: SignupValidationResult['errors'] = {};
    let isValid = true;

    // 1. CAPTCHA verification
    if (isRecaptchaConfigured()) {
        const captchaResult = await verifyRecaptcha('signup');
        if (!captchaResult.success) {
            errors.captcha = 'Please complete the CAPTCHA verification';
            isValid = false;
        }
    }

    // 2. Name validation
    if (!name || name.trim() === '') {
        errors.name = 'Full name is required';
        isValid = false;
    } else if (name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
        isValid = false;
    }

    // 3. Email format validation
    const emailFormatResult = validateEmailFormat(email);
    if (!emailFormatResult.isValid) {
        errors.emailFormat = emailFormatResult.error;
        isValid = false;
    }

    // 4. Check if email already registered
    if (emailFormatResult.isValid && isEmailRegistered(email)) {
        errors.emailRegistered = 'Email is already registered. Please login or use a different email.';
        isValid = false;
    }

    // 5. Email existence verification (optional)
    if (emailFormatResult.isValid && isEmailVerificationConfigured()) {
        const emailVerifyResult = await verifyEmailExists(email);
        if (!emailVerifyResult.isValid) {
            errors.emailExists = emailVerifyResult.error || 'Email domain does not exist or is invalid';
            isValid = false;
        }
    }

    // 6. Password validation
    const { validatePasswordStrength } = await import('./authSecurity');
    const passwordResult = validatePasswordStrength(password);
    if (!passwordResult.isValid) {
        errors.password = passwordResult.error || 'Password does not meet security requirements';
        isValid = false;
    }

    return { isValid, errors };
}
