// Serverless function for team invitation system using MySQL
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import pool from './lib/db';

const INVITE_EXPIRY_HOURS = 24;
const INVITE_EXPIRY_MS = INVITE_EXPIRY_HOURS * 60 * 60 * 1000;

function generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

function generateInviteId(): string {
    return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') return response.status(200).end();

    const { method, query, body } = request;
    const token = query.token as string;

    try {
        // POST /api/invite-member - Send invitation
        if (method === 'POST' && request.url?.includes('invite-member')) {
            const { email, name, role, workspaceId } = body;

            if (!email || !name || !role) return response.status(400).json({ success: false, error: 'Email, name, and role are required' });

            const inviteToken = generateSecureToken();
            const inviteId = generateInviteId();
            const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS);

            await pool.query(
                'INSERT INTO team_invites (id, name, email, role, workspaceId, token, status, expiresAt) VALUES (?, ?, ?, ?, ?, ?, "Pending", ?)',
                [inviteId, name, email.toLowerCase(), role, workspaceId || 'default', inviteToken, expiresAt]
            );

            // In development, we skip actual email sending if keys are missing
            console.log(`[DEV] Invite link: /accept-invite?token=${inviteToken}`);

            return response.status(200).json({ success: true, inviteId, inviteToken });
        }

        // GET /api/invite - Get invite details
        if (method === 'GET' && token) {
            const [rows]: any = await pool.query('SELECT * FROM team_invites WHERE token = ?', [token]);
            if (rows.length === 0) return response.status(404).json({ success: false, error: 'Invalid invite' });

            const invite = rows[0];
            if (new Date(invite.expiresAt) < new Date()) return response.status(400).json({ success: false, error: 'Invite expired' });
            if (invite.status !== 'Pending') return response.status(400).json({ success: false, error: 'Invite already used or invalid' });

            return response.status(200).json({ success: true, invite });
        }

        // POST /api/confirm-invite - Accept invitation
        if (method === 'POST' && request.url?.includes('confirm-invite')) {
            const { token, userId } = body;
            if (!token) return response.status(400).json({ success: false, error: 'Token required' });

            const [rows]: any = await pool.query('SELECT * FROM team_invites WHERE token = ?', [token]);
            if (rows.length === 0) return response.status(404).json({ success: false, error: 'Invalid invite' });

            await pool.query('UPDATE team_invites SET status = "Accepted" WHERE token = ?', [token]);
            
            // Add to team_members if teamId is known (simplified for now)
            // if (userId && rows[0].workspaceId) { ... }

            return response.status(200).json({ success: true, message: 'Joined successfully' });
        }

        return response.status(405).end();
    } catch (error: any) {
        return response.status(500).json({ success: false, error: error.message });
    }
}
