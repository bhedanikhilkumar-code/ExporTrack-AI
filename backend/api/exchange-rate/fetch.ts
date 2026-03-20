/**
 * Exchange Rate API
 * GET /api/exchange-rate/fetch?from=USD&to=INR
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET is allowed' } });
  }

  const from = (req.query.from as string || 'USD').toUpperCase();
  const to = (req.query.to as string || 'INR').toUpperCase();

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    if (!response.ok) throw new Error('Exchange rate API unavailable');
    const data = await response.json();

    if (!data.rates || !data.rates[to]) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CURRENCY', message: `Cannot convert ${from} to ${to}` }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        from,
        to,
        rate: data.rates[to],
        lastUpdated: data.time_last_update_utc || new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Exchange rate error:', error);
    // Fallback rates
    const fallbackRates: Record<string, number> = { INR: 83.5, EUR: 0.92, GBP: 0.79, AED: 3.67, JPY: 149.5 };
    return res.status(200).json({
      success: true,
      data: { from, to, rate: fallbackRates[to] || 1, lastUpdated: new Date().toISOString(), fallback: true }
    });
  }
}
