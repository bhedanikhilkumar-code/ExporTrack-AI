import { VercelRequest, VercelResponse } from '@vercel/node';

let trackings: any[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') return res.status(200).end();

  try {
    switch (method) {
      case 'GET':
        const { id, trackingNumber } = req.query;
        if (id) {
          const t = trackings.find(tr => tr.id === id);
          return res.status(t ? 200 : 404).json(t || { error: 'Not found' });
        }
        if (trackingNumber) {
          const t = trackings.find(tr => tr.trackingNumber === trackingNumber);
          return res.status(t ? 200 : 404).json(t || { error: 'Not found' });
        }
        return res.status(200).json(trackings);
      case 'POST':
        const data = req.body;
        if (!data.id) return res.status(400).json({ error: 'Missing ID' });
        const idx = trackings.findIndex(t => t.id === data.id);
        const now = new Date().toISOString();
        if (idx >= 0) trackings[idx] = { ...trackings[idx], ...data, lastUpdated: now };
        else trackings.push({ ...data, lastUpdated: now });
        return res.status(200).json({ success: true, data });
      case 'DELETE':
        const { deleteId } = req.query;
        if (!deleteId) return res.status(400).json({ error: 'Missing ID' });
        trackings = trackings.filter(t => t.id !== deleteId);
        return res.status(200).json({ success: true });
      default:
        return res.status(405).end();
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
