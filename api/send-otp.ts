// Serverless function for sending OTP via email
// Uses Nodemailer with SMTP configuration
// Deploy to Vercel: https://vercel.com/docs/serverless-functions/introduction

// In-memory OTP storage (for serverless, use Redis or database in production)
// Structure: { email: { otp: string, expiresAt: number, attempts: number, createdAt: number } }
const otpStore = new Map<string, {
    otp: string;
    expiresAt: number;
    attempts: number;
    createdAt: number;
    lastSentAt: number;
}>();

// Configuration
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_HOURS = 1;
const MAX_OTP_REQUESTS_PER_HOUR = 3;

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

function generateOTP(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean up expired OTPs periodically
function cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
        if (data.expiresAt < now) {
            otpStore.delete(email);
        }
    }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

// Email sending function using fetch to email service
async function sendEmailWithSMTP(to: string, subject: string, body: string): Promise<{ success: boolean; error?: string }> {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || '587';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || 'bhedanikhilkumar@gmail.com';

    // If SMTP is not configured, use a mail service API
    if (!smtpHost || !smtpUser || !smtpPass) {
        // Use SendGrid or similar API if available
        const sendgridApiKey = process.env.SENDGRID_API_KEY;

        if (sendgridApiKey) {
            try {
                const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${sendgridApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        personalizations: [{
                            to: [{ email: to }]
                        }],
                        from: { email: smtpFrom },
                        subject: subject,
                        content: [{
                            type: 'text/plain',
                            value: body
                        }]
                    })
                });

                if (response.ok || response.status === 202) {
                    return { success: true };
                } else {
                    const error = await response.text();
                    return { success: false, error: `Email service error: ${error}` };
                }
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        }

        // If no email service configured, simulate sending (for development)
        console.log(`[DEV MODE] OTP Email would be sent:`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        return { success: true };
    }

    // Use nodemailer with SMTP (requires nodemailer package)
    // For serverless, we'll use a simple approach
    try {
        // Create SMTP connection URL
        const smtpUrl = `smtp://${encodeURIComponent(smtpUser)}:${encodeURIComponent(smtpPass)}@${smtpHost}:${smtpPort}`;

        // For serverless environments, use a simpler email sending approach
        // This is a basic implementation - in production use proper nodemailer setup

        // Use AWS SES or other SMTP-compatible service
        const nodemailer = await import('nodemailer');

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort),
            secure: smtpPort === '465',
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        await transporter.sendMail({
            from: smtpFrom,
            to: to,
            subject: subject,
            text: body
        });

        return { success: true };
    } catch (error: any) {
        console.error('SMTP Error:', error);
        return { success: false, error: error.message };
    }
}

export default async function handler(req: any, res: any) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    const { email } = req.body;

    // Validate email exists
    if (!email) {
        return res.status(400).json({
            success: false,
            error: 'Email is required'
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

    const emailLower = email.toLowerCase();
    const now = Date.now();

    // Check rate limiting
    const existingOTP = otpStore.get(emailLower);

    if (existingOTP) {
        // Check if last OTP was sent within the rate limit window
        const timeSinceLastSent = now - existingOTP.lastSentAt;
        const rateLimitMs = RATE_LIMIT_HOURS * 60 * 60 * 1000;

        if (timeSinceLastSent < rateLimitMs) {
            // Check if too many requests
            const otpRequestCount = parseInt(req.headers['x-otp-request-count'] || '0');
            if (otpRequestCount >= MAX_OTP_REQUESTS_PER_HOUR) {
                return res.status(429).json({
                    success: false,
                    error: 'Too many OTP requests. Please try again later.',
                    retryAfter: Math.ceil((rateLimitMs - timeSinceLastSent) / 1000 / 60)
                });
            }
        }

        // Check if previous OTP is still valid (not expired)
        if (existingOTP.expiresAt > now) {
            // Don't allow new OTP while previous is still valid
            return res.status(400).json({
                success: false,
                error: 'OTP already sent. Please check your email or wait for the current OTP to expire.',
                expiresIn: Math.ceil((existingOTP.expiresAt - now) / 1000 / 60)
            });
        }
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = now + (OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP
    otpStore.set(emailLower, {
        otp: otp,
        expiresAt: expiresAt,
        attempts: 0,
        createdAt: now,
        lastSentAt: now
    });

    // Send OTP via email
    const emailSubject = 'Your Verification Code';
    const emailBody = `Your OTP is: ${otp} (valid for ${OTP_EXPIRY_MINUTES} minutes)

This code was requested for your ExporTrack-AI account.
If you didn't request this, please ignore this email.

Note: This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes for security purposes.`;

    const emailResult = await sendEmailWithSMTP(
        emailLower,
        emailSubject,
        emailBody
    );

    if (!emailResult.success) {
        // Remove OTP if email failed to send
        otpStore.delete(emailLower);

        return res.status(500).json({
            success: false,
            error: 'Failed to send OTP email. Please try again later.',
            details: emailResult.error
        });
    }

    // Return success
    return res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        email: emailLower,
        expiresIn: OTP_EXPIRY_MINUTES * 60
    });
}

// Export for testing
export { otpStore, generateOTP, validateEmailFormat };
