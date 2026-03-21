import { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const p = req.body;
    const { id } = req.query;

    const targetId = id || p.id;

    if (!targetId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required' });
    }

    const updates: string[] = [];
    const values: any[] = [];

    const allowedFields = ['referenceNo', 'buyerId', 'invoiceId', 'amount', 'currency', 'date', 'method', 'status', 'notes'];

    for (const field of allowedFields) {
      if (p[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(p[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(targetId);

    const query = `UPDATE payments SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating payment:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}
