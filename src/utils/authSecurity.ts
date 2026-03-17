/**
 * Authentication Security Utilities
 * Provides validation and security functions for login/signup
 */

// RFC 5322 compliant email regex (simplified but robust)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Common disposable email domains (free email providers)
const DISPOSABLE_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
    'icloud.com', 'mail.com', 'protonmail.com', 'aol.com', 'zoho.com'
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

    return { isValid: true };
}

/**
 * Check if email is from a disposable/free provider
 * Note: This is optional - you can allow or block these
 */
export function isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? DISPOSABLE_DOMAINS.includes(domain) : false;
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export function validatePasswordStrength(password: string): { isValid: boolean; error?: string; strength?: 'weak' | 'medium' | 'strong' } {
    if (!password || password === '') {
        return { isValid: false, error: 'Password is required' };
    }

    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    if (passedChecks < 3) {
        return {
            isValid: false,
            error: 'Password is too weak. Use at least 8 characters with uppercase, lowercase, numbers, and special characters',
            strength: 'weak'
        };
    }

    if (passedChecks < 5) {
        return {
            isValid: true,
            strength: 'medium'
        };
    }

    return {
        isValid: true,
        strength: 'strong'
    };
}

/**
 * Get password strength indicator
 */
export function getPasswordStrength(password: string): {
    score: number;
    label: string;
    color: string;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    hasMinLength: boolean;
} {
    if (!password) return {
        score: 0,
        label: '',
        color: '',
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
        hasMinLength: false
    };

    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    let score = 0;
    if (hasMinLength) score++;
    if (password.length >= 12) score++;
    if (hasUppercase) score++;
    if (hasLowercase) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    if (score <= 2) return { score: 20, label: 'Weak', color: 'bg-red-500', hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial };
    if (score <= 4) return { score: 60, label: 'Medium', color: 'bg-amber-500', hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500', hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial };
}

// Storage keys for brute force protection
const LOGIN_ATTEMPTS_KEY = 'exportrack-login-attempts';
const LOCKOUT_KEY = 'exportrack-account-lockout';

/**
 * Get login attempts from localStorage
 */
function getLoginAttempts(): { email: string; count: number; lastAttempt: number }[] {
    try {
        const data = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * Save login attempts to localStorage
 */
function saveLoginAttempts(attempts: { email: string; count: number; lastAttempt: number }[]): void {
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(email: string): void {
    const attempts = getLoginAttempts();
    const normalizedEmail = email.toLowerCase();
    const existing = attempts.find(a => a.email === normalizedEmail);

    if (existing) {
        existing.count++;
        existing.lastAttempt = Date.now();
    } else {
        attempts.push({ email: normalizedEmail, count: 1, lastAttempt: Date.now() });
    }

    // Keep only last 24 hours of attempts
    const cutoff = Date.now() - (24 * 60 * 60 * 1000);
    const filtered = attempts.filter(a => a.lastAttempt > cutoff);
    saveLoginAttempts(filtered);
}

/**
 * Check if account is locked out due to too many attempts
 */
export function isAccountLockedOut(email: string): { locked: boolean; remainingMinutes?: number; remainingAttempts?: number } {
    const attempts = getLoginAttempts();
    const normalizedEmail = email.toLowerCase();
    const existing = attempts.find(a => a.email === normalizedEmail);

    const MAX_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

    if (!existing) {
        return { locked: false, remainingAttempts: MAX_ATTEMPTS };
    }

    if (existing.count >= MAX_ATTEMPTS) {
        const timeSinceLastAttempt = Date.now() - existing.lastAttempt;

        if (timeSinceLastAttempt < LOCKOUT_DURATION) {
            const remainingMinutes = Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / (60 * 1000));
            return { locked: true, remainingMinutes };
        } else {
            // Lockout expired, reset attempts
            const filtered = attempts.filter(a => a.email !== normalizedEmail);
            saveLoginAttempts(filtered);
            return { locked: false, remainingAttempts: MAX_ATTEMPTS };
        }
    }

    return { locked: false, remainingAttempts: MAX_ATTEMPTS - existing.count };
}

/**
 * Clear login attempts for an email (on successful login)
 */
export function clearLoginAttempts(email: string): void {
    const attempts = getLoginAttempts();
    const filtered = attempts.filter(a => a.email !== email.toLowerCase());
    saveLoginAttempts(filtered);
}

/**
 * Get all validation errors for login form
 */
export function validateLoginForm(
    email: string,
    password: string,
    isRegisteredUser: boolean = true
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Email validation
    const emailValidation = validateEmailFormat(email);
    if (!emailValidation.isValid) {
        errors.push(emailValidation.error!);
    }

    // Check if email is registered
    if (emailValidation.isValid && !isRegisteredUser) {
        errors.push('Email not registered. Please sign up or use a registered email.');
    }

    // Password validation
    if (!password || password === '') {
        errors.push('Password is required');
    }

    // Brute force check
    const lockout = isAccountLockedOut(email);
    if (lockout.locked) {
        errors.push(`Too many failed attempts. Please try again in ${lockout.remainingMinutes} minutes.`);
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Get all validation errors for signup form
 */
export function validateSignupForm(
    name: string,
    email: string,
    password: string,
    isEmailAlreadyRegistered: boolean = false
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Name validation
    if (!name || name.trim() === '') {
        errors.push('Name is required');
    } else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    // Email validation
    const emailValidation = validateEmailFormat(email);
    if (!emailValidation.isValid) {
        errors.push(emailValidation.error!);
    }

    // Check if email already registered
    if (emailValidation.isValid && isEmailAlreadyRegistered) {
        errors.push('Email is already registered. Please login or use a different email.');
    }

    // Password validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
        errors.push(passwordValidation.error!);
    }

    return { isValid: errors.length === 0, errors };
}
