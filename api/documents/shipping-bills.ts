import { VercelRequest, VercelResponse } from '@vercel/node';

let shippingBills: any[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') return res.status(200).end();

  try {
    switch (method) {
      case 'GET':
        const { id } = req.query;
        if (id) {
          const sb = shippingBills.find(s => s.id === id);
          return res.status(sb ? 200 : 404).json(sb || { error: 'Not found' });
        }
        return res.status(200).json(shippingBills);
      case 'POST':
        const data = req.body;
        if (!data.id) return res.status(400).json({ error: 'Missing ID' });
        const idx = shippingBills.findIndex(s => s.id === data.id);
        if (idx >= 0) shippingBills[idx] = { ...shippingBills[idx], ...data, updatedAt: new Date().toISOString() };
        else shippingBills.push({ ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        return res.status(200).json({ success: true, data });
      case 'DELETE':
        const { deleteId } = req.query;
        if (!deleteId) return res.status(400).json({ error: 'Missing ID' });
        shippingBills = shippingBills.filter(s => s.id !== deleteId);
        return res.status(200).json({ success: true });
      default:
        return res.status(405).end();
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
