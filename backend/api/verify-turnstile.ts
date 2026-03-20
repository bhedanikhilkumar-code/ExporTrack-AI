// Serverless function for Cloudflare Turnstile verification
// Deploy to Vercel: https://vercel.com/docs/serverless-functions/introduction

interface TurnstileResponse {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    'error-codes'?: string[];
    action?: string;
    cdata?: string;
}

export default async function handler(req: any, res: any) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    const { token } = req.body;

    // Validate token exists
    if (!token) {
        return res.status(400).json({
            success: false,
            'error-codes': ['missing-input-response'],
            error: 'Token is required'
        });
    }

    // Get secret key from environment variables
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
        console.error('TURNSTILE_SECRET_KEY is not configured');
        return res.status(500).json({
            success: false,
            error: 'Server configuration error'
        });
    }

    try {
        // Verify token with Cloudflare Turnstile API
        const verifyResponse = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    secret: secretKey,
                    response: token,
                    remoteip: req.headers['x-forwarded-for'] ||
                        req.headers['x-real-ip'] ||
                        req.socket?.remoteAddress ||
                        '',
                }),
            }
        );

        const data: TurnstileResponse = await verifyResponse.json();

        if (data.success) {
            return res.status(200).json({
                success: true,
                challenge_ts: data.challenge_ts,
                hostname: data.hostname,
                action: data.action,
                cdata: data.cdata
            });
        } else {
            return res.status(400).json({
                success: false,
                'error-codes': data['error-codes'] || ['verification-failed'],
                error: 'Human verification failed'
            });
        }
    } catch (error) {
        console.error('Turnstile verification error:', error);
        return res.status(500).json({
            success: false,
            error: 'Verification service error'
        });
    }
}
