// Serverless function for verifying OTP
// Deploy to Vercel: https://vercel.com/docs/serverless-functions/introduction

// Configuration
const MAX_ATTEMPTS = 3;
const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 30;

// In-memory OTP storage
const otpStore = new Map<string, {
    otp: string;
    expiresAt: number;
    attempts: number;
    createdAt: number;
    lastSentAt: number;
}>();

// RFC 5322 compliant email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function validateEmailFormat(email: string): { isValid: boolean; error?: string } {
    if (!email || email.trim() === '') {
        return { isValid: false, error: 'Email is required' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
        return { isValid: false, error: 'Enter a valid email' };
    }

    if (trimmedEmail.includes('..')) {
        return { isValid: false, error: 'Invalid email format' };
    }

    if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
        return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
}

// Clean up expired OTPs
function cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
        if (data.expiresAt < now) {
            otpStore.delete(email);
        }
    }
}

setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

export default async function handler(req: any, res: any) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    const { email, otp } = req.body;

    // Validate email exists
    if (!email) {
        return res.status(400).json({
            success: false,
            error: 'Email is required'
        });
    }

    // Validate OTP exists
    if (!otp) {
        return res.status(400).json({
            success: false,
            error: 'Please enter the verification code'
        });
    }

    // Validate email format
    const formatValidation = validateEmailFormat(email);
    if (!formatValidation.isValid) {
        return res.status(400).json({
            success: false,
            error: formatValidation.error || 'Enter a valid email'
        });
    }

    // Validate OTP format (must be 6 digits)
    if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid verification code format'
        });
    }

    const emailLower = email.toLowerCase();
    const now = Date.now();

    // Get stored OTP
    const storedOTP = otpStore.get(emailLower);

    // Check if OTP exists
    if (!storedOTP) {
        return res.status(400).json({
            success: false,
            error: 'OTP expired, request a new one',
            canResend: true
        });
    }

    // Check if OTP has expired
    if (storedOTP.expiresAt < now) {
        // Remove expired OTP
        otpStore.delete(emailLower);

        return res.status(400).json({
            success: false,
            error: 'OTP expired, request a new one',
            canResend: true,
            resendCooldown: 0
        });
    }

    // Check if maximum attempts exceeded
    if (storedOTP.attempts >= MAX_ATTEMPTS) {
        // Remove OTP after max attempts
        otpStore.delete(emailLower);

        return res.status(400).json({
            success: false,
            error: 'Too many failed attempts. Please request a new OTP.',
            locked: true
        });
    }

    // Verify OTP
    if (storedOTP.otp === otp) {
        // OTP verified successfully
        // Remove OTP after successful verification (one-time use)
        otpStore.delete(emailLower);

        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            email: emailLower
        });
    } else {
        // Increment attempts
        storedOTP.attempts += 1;
        otpStore.set(emailLower, storedOTP);

        const remainingAttempts = MAX_ATTEMPTS - storedOTP.attempts;

        if (remainingAttempts <= 0) {
            // Remove OTP after max attempts
            otpStore.delete(emailLower);

            return res.status(400).json({
                success: false,
                error: 'Too many failed attempts. Please request a new OTP.',
                locked: true
            });
        }

        return res.status(400).json({
            success: false,
            error: 'Invalid OTP',
            attemptsRemaining: remainingAttempts
        });
    }
}
