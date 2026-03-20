// Serverless function for Google Auth persistence using MySQL
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './lib/db';

/**
 * Decodes a JWT token without verification (verification should happen on frontend or via Google API)
 * For higher security in production, use google-auth-library to verify the ID token.
 */
function decodeToken(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            Buffer.from(base64, 'base64')
                .toString()
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method === 'OPTIONS') {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return response.status(200).end();
    }

    if (request.method !== 'POST') return response.status(405).end();

    const { token } = request.body;
    if (!token) return response.status(400).json({ success: false, error: 'Token is required' });

    try {
        const payload = decodeToken(token);
        if (!payload || !payload.email) {
            return response.status(400).json({ success: false, error: 'Invalid Google token' });
        }

        const email = payload.email.toLowerCase();
        const name = payload.name || payload.given_name || 'Google User';
        const googleId = payload.sub;

        // Check if user exists
        const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            // Auto-provision new Google user
            const userId = googleId || `google-${Date.now()}`;
            await pool.query(
                'INSERT INTO users (id, name, email, role, authProvider) VALUES (?, ?, ?, "Staff", "google")',
                [userId, name, email]
            );
            return response.status(200).json({ success: true, isNew: true, user: { id: userId, name, email, role: 'Staff' } });
        }

        return response.status(200).json({ success: true, isNew: false, user: users[0] });
    } catch (error: any) {
        console.error('Google Auth Error:', error);
        return response.status(500).json({ success: false, error: error.message });
    }
}
