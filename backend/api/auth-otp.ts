// Unified Auth API - Handles OTP sending and verification with MySQL storage
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import pool from './lib/db';

// Configuration
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 30;

// RFC 5322 compliant email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || email.trim() === '') {
        return { isValid: false, error: 'Email is required' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
        return { isValid: false, error: 'Enter a valid email address' };
    }

    return { isValid: true };
}

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email using Resend API
async function sendEmailWithResend(to: string, subject: string, htmlContent: string): Promise<{ success: boolean; error?: string }> {
    const resendApiKey = process.env.RESEND_API_KEY;
    const senderEmail = process.env.RESEND_SENDER_EMAIL || 'ExporTrack-AI <onboarding@resend.dev>';

    if (!resendApiKey) {
        console.error('Resend API key not configured');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const resend = new Resend(resendApiKey);
        const { data, error } = await resend.emails.send({
            from: senderEmail,
            to: to,
            subject: subject,
            html: htmlContent
        });

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Build OTP email HTML template
function buildOTPEmailHtml(otp: string, email: string, type: 'verification' | 'login'): string {
    const title = type === 'verification' ? 'Email Verification' : 'Login Verification';
    return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>ExporTrack-AI</h2>
  <p>Your ${title} code is: <strong>${otp}</strong></p>
  <p>This code will expire in 5 minutes.</p>
</body>
</html>
    `.trim();
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') return response.status(200).end();

    const { method } = request;

    try {
        if (method === 'POST') {
            const { action, email, otp, type } = request.body;

            if (action === 'send') {
                if (!email) return response.status(400).json({ success: false, error: 'Email is required' });
                
                const emailValidation = validateEmail(email);
                if (!emailValidation.isValid) return response.status(400).json({ success: false, error: emailValidation.error });

                const emailLower = email.toLowerCase();
                const now = Date.now();

                // Check rate limiting from DB
                const [existing]: any = await pool.query('SELECT lastSentAt FROM otps WHERE email = ?', [emailLower]);
                if (existing.length > 0) {
                    const timeSinceLastSent = (now - existing[0].lastSentAt) / 1000;
                    if (timeSinceLastSent < RESEND_COOLDOWN_SECONDS) {
                        return response.status(429).json({
                            success: false,
                            error: `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - timeSinceLastSent)} seconds`
                        });
                    }
                }

                const newOTP = generateOTP();
                const expiresAt = now + (OTP_EXPIRY_MINUTES * 60 * 1000);

                // Upsert OTP in DB
                await pool.query(
                    'INSERT INTO otps (email, otp, expiresAt, lastSentAt, verified, attempts) VALUES (?, ?, ?, ?, false, 0) ON DUPLICATE KEY UPDATE otp = ?, expiresAt = ?, lastSentAt = ?, verified = false, attempts = 0',
                    [emailLower, newOTP, expiresAt, now, newOTP, expiresAt, now]
                );

                // Send email
                const result = await sendEmailWithResend(emailLower, 'Your ExporTrack-AI Code', buildOTPEmailHtml(newOTP, emailLower, type || 'verification'));

                if (!result.success) {
                    if (process.env.NODE_ENV === 'development') {
                        return response.status(200).json({ success: true, devMode: true, devOTP: newOTP });
                    }
                    return response.status(500).json({ success: false, error: 'Failed to send email' });
                }

                return response.status(200).json({ success: true, message: 'Code sent' });
            }

            if (action === 'verify') {
                if (!email || !otp) return response.status(400).json({ success: false, error: 'Email and OTP required' });

                const emailLower = email.toLowerCase();
                const [rows]: any = await pool.query('SELECT * FROM otps WHERE email = ?', [emailLower]);

                if (rows.length === 0) return response.status(400).json({ success: false, error: 'Code not found' });

                const stored = rows[0];
                const now = Date.now();

                if (stored.expiresAt < now) return response.status(400).json({ success: false, error: 'Code expired' });
                if (stored.verified) return response.status(400).json({ success: false, error: 'Code already used' });
                if (stored.attempts >= MAX_ATTEMPTS) return response.status(400).json({ success: false, error: 'Too many attempts' });

                if (stored.otp === otp) {
                    await pool.query('UPDATE otps SET verified = true WHERE email = ?', [emailLower]);
                    
                    // Create user if not exists
                    await pool.query(
                        'INSERT IGNORE INTO users (id, name, email, role, userMode) VALUES (?, ?, ?, ?, ?)',
                        [`email-${emailLower}`, emailLower.split('@')[0], emailLower, 'Staff', 'real']
                    );

                    return response.status(200).json({ success: true, email: emailLower });
                } else {
                    await pool.query('UPDATE otps SET attempts = attempts + 1 WHERE email = ?', [emailLower]);
                    return response.status(400).json({ success: false, error: 'Invalid code' });
                }
            }
        }

        if (method === 'GET') {
            const { email } = request.query;
            if (!email) return response.status(400).json({ success: false, error: 'Email required' });

            const [rows]: any = await pool.query('SELECT verified FROM otps WHERE email = ?', [email.toString().toLowerCase()]);
            if (rows.length === 0) return response.status(404).json({ success: false, error: 'Not found' });

            return response.status(200).json({ success: true, verified: !!rows[0].verified });
        }

        return response.status(405).end();
    } catch (error: any) {
        return response.status(500).json({ success: false, error: error.message });
    }
}
