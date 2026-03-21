import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { id } = req.query;
    
    if (!id) return res.status(400).json({ error: 'Supplier ID is required' });

    const {
      companyName,
      contactPerson,
      email,
      phone,
      address,
      city,
      country,
      taxId,
      paymentTerms,
      productCategories,
      notes,
      rating
    } = req.body;

    const categoriesJson = productCategories ? JSON.stringify(productCategories) : null;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (companyName !== undefined) { updates.push('companyName = ?'); values.push(companyName); }
    if (contactPerson !== undefined) { updates.push('contactPerson = ?'); values.push(contactPerson); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (city !== undefined) { updates.push('city = ?'); values.push(city); }
    if (country !== undefined) { updates.push('country = ?'); values.push(country); }
    if (taxId !== undefined) { updates.push('taxId = ?'); values.push(taxId); }
    if (paymentTerms !== undefined) { updates.push('paymentTerms = ?'); values.push(paymentTerms); }
    if (productCategories !== undefined) { updates.push('productCategories = ?'); values.push(categoriesJson); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    if (rating !== undefined) { updates.push('rating = ?'); values.push(rating); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE suppliers SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    return res.status(200).json({ success: true, message: 'Supplier updated successfully' });
  } catch (err: any) {
    console.error('Error updating supplier:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
