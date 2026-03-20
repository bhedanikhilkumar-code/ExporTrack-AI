// Serverless function for sending OTP via SendGrid
// SendGrid provides high email deliverability to inbox
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
const RESEND_COOLDOWN_SECONDS = 30;

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

// Send email using SendGrid API
async function sendEmailWithSendGrid(to: string, subject: string, htmlContent: string): Promise<{ success: boolean; error?: string }> {
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    if (!sendgridApiKey) {
        console.error('SendGrid API key not configured');
        return { success: false, error: 'Email service not configured' };
    }

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
                from: {
                    email: 'noreply@exportrack.ai',
                    name: 'ExporTrack-AI'
                },
                reply_to: { email: 'bhedanikhilkumar@gmail.com', name: 'ExporTrack Support' },
                subject: subject,
                content: [
                    {
                        type: 'text/plain',
                        value: htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for plain text
                    },
                    {
                        type: 'text/html',
                        value: htmlContent
                    }
                ]
            })
        });

        if (response.ok || response.status === 202) {
            console.log(`OTP email sent successfully to ${to}`);
            return { success: true };
        } else {
            const errorText = await response.text();
            console.error('SendGrid error:', response.status, errorText);
            return { success: false, error: `Failed to send email: ${response.status}` };
        }
    } catch (error: any) {
        console.error('SendGrid exception:', error);
        return { success: false, error: error.message };
    }
}

// Send email using Resend API (alternative to SendGrid)
async function sendEmailWithResend(to: string, subject: string, htmlContent: string): Promise<{ success: boolean; error?: string }> {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
        console.error('Resend API key not configured');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'ExporTrack-AI <onboarding@resend.dev>',
                reply_to: 'bhedanikhilkumar@gmail.com',
                to: to,
                subject: subject,
                html: htmlContent
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`OTP email sent successfully via Resend to ${to}:`, data.id);
            return { success: true };
        } else {
            const errorText = await response.text();
            console.error('Resend error:', response.status, errorText);
            return { success: false, error: `Failed to send email: ${response.status}` };
        }
    } catch (error: any) {
        console.error('Resend exception:', error);
        return { success: false, error: error.message };
    }
}

// Build OTP email HTML template
function buildOTPEmailHtml(otp: string, email: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #134e4a 100%); padding: 32px 40px; border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">ExporTrack-AI</h1>
                            <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">Email Verification</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
                                Your verification code is:
                            </p>
                            
                            <!-- OTP Display -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 20px 32px; border-radius: 8px;">
                                            <span style="color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: monospace;">${otp}</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px; text-align: center;">
                                This code will expire in <strong>5 minutes</strong>
                            </p>
                            
                            <!-- Warning -->
                            <div style="margin-top: 24px; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                <p style="margin: 0; color: #92400e; font-size: 13px;">
                                    <strong>Security Notice:</strong> If you didn't request this code, please ignore this email. Never share your verification code with anyone.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                                This email was sent to ${email}<br>
                                © 2024 ExporTrack-AI. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

// Build plain text OTP email
function buildOTPEmailText(otp: string, email: string): string {
    return `
Your Verification Code - ExporTrack-AI
======================================

Your OTP is: ${otp}

This code will expire in 5 minutes.

Security Notice: If you didn't request this code, please ignore this email. 
Never share your verification code with anyone.

---
This email was sent to ${email}
© 2024 ExporTrack-AI. All rights reserved.
    `.trim();
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
            const requestCount = existingOTP.attempts + 1;
            if (requestCount > MAX_OTP_REQUESTS_PER_HOUR) {
                return res.status(429).json({
                    success: false,
                    error: 'Too many OTP requests. Please try again later.',
                    retryAfter: Math.ceil((rateLimitMs - timeSinceLastSent) / 1000 / 60)
                });
            }
        }

        // Check if previous OTP is still valid (not expired)
        if (existingOTP.expiresAt > now) {
            const timeLeft = Math.ceil((existingOTP.expiresAt - now) / 1000);
            return res.status(400).json({
                success: false,
                error: 'OTP already sent. Please check your email or wait for the current OTP to expire.',
                expiresIn: Math.ceil(timeLeft / 60),
                canResendIn: timeLeft < RESEND_COOLDOWN_SECONDS ? 0 : RESEND_COOLDOWN_SECONDS - timeLeft
            });
        }

        // Check cooldown for resend
        const timeSinceLastOTP = now - existingOTP.lastSentAt;
        if (timeSinceLastOTP < RESEND_COOLDOWN_SECONDS * 1000) {
            const waitTime = Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - timeSinceLastOTP) / 1000);
            return res.status(400).json({
                success: false,
                error: `Please wait ${waitTime} seconds before requesting a new OTP`,
                cooldownRemaining: waitTime
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

    // Build email content
    const emailSubject = 'Your Verification Code';
    const htmlContent = buildOTPEmailHtml(otp, emailLower);
    const textContent = buildOTPEmailText(otp, emailLower);

    // Try SendGrid first, then Resend as fallback
    let emailResult = await sendEmailWithSendGrid(emailLower, emailSubject, htmlContent);

    // If SendGrid fails, try Resend
    if (!emailResult.success && process.env.RESEND_API_KEY) {
        console.log('SendGrid failed, trying Resend...');
        emailResult = await sendEmailWithResend(emailLower, emailSubject, htmlContent);
    }

    // If no email service configured, simulate success for development
    if (!process.env.SENDGRID_API_KEY && !process.env.RESEND_API_KEY) {
        console.log(`[DEV MODE] OTP would be sent to ${emailLower}: ${otp}`);
        emailResult = { success: true };
    }

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
        expiresIn: OTP_EXPIRY_MINUTES * 60,
        resendCooldown: RESEND_COOLDOWN_SECONDS
    });
}

// Export for testing
export { otpStore, generateOTP, validateEmailFormat };
