import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { id } = req.query;

    if (!id) return res.status(400).json({ error: 'Buyer ID is required' });

    const [result]: any = await pool.query('DELETE FROM buyers WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    return res.status(200).json({ success: true, message: 'Buyer deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting buyer:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
