/**
 * API Route: Update a team member's role in MySQL
 * POST /api/members/update-role
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

type Role = 'owner' | 'admin' | 'manager' | 'viewer';
const VALID_ROLES: Role[] = ['owner', 'admin', 'manager', 'viewer'];

function normalizeRole(role: string): Role {
  const lower = role.toLowerCase();
  if (lower === 'owner') return 'owner';
  if (lower === 'admin') return 'admin';
  if (lower === 'manager' || lower === 'export operations manager' || lower === 'operations' || lower === 'staff') return 'manager';
  return 'viewer';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST is allowed' } });
  }

  try {
    const { memberId, newRole, actorRole, actorId, memberCurrentRole } = req.body;

    if (!memberId || !newRole || !actorRole || !actorId) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'memberId, newRole, actorRole, and actorId are required' }
      });
    }

    const normalizedActorRole = normalizeRole(actorRole);
    const normalizedNewRole = newRole.toLowerCase() as Role;
    const normalizedCurrentRole = memberCurrentRole ? normalizeRole(memberCurrentRole) : 'viewer';

    if (!VALID_ROLES.includes(normalizedNewRole)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: `Invalid role: ${newRole}` }
      });
    }

    if (memberId === actorId) {
      return res.status(403).json({
        success: false,
        error: { code: 'SELF_MODIFICATION', message: 'You cannot change your own role' }
      });
    }

    if (normalizedActorRole !== 'owner' && normalizedActorRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'INSUFFICIENT_PERMISSION', message: 'Only owners and admins can update member roles' }
      });
    }

    // Database Update
    const [result]: any = await pool.query('UPDATE users SET role = ? WHERE id = ?', [newRole, memberId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'The specified member was not found in the database' }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        memberId,
        previousRole: normalizedCurrentRole,
        newRole: normalizedNewRole,
        updatedBy: actorId,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Update role error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
}
