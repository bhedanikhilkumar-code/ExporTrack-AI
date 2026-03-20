/**
 * Shipment Notification Email API
 * Sends real email notifications for shipment events using Resend
 * Deploy to Vercel as serverless function
 *
 * Events:
 * - shipment_created: New shipment created
 * - shipment_dispatched: Shipment picked up / in transit
 * - shipment_delayed: Shipment delayed alert
 * - shipment_delivered: Delivery confirmation
 * - document_missing: Missing document alert
 * - document_verified: Document approved
 * - deadline_reminder: Upcoming deadline warning
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationEvent =
    | 'shipment_created'
    | 'shipment_dispatched'
    | 'shipment_delayed'
    | 'shipment_delivered'
    | 'document_missing'
    | 'document_verified'
    | 'deadline_reminder';

interface NotificationPayload {
    event: NotificationEvent;
    recipientEmail: string;
    recipientName: string;
    shipmentId: string;
    clientName?: string;
    destination?: string;
    status?: string;
    documentType?: string;
    deadline?: string;
    daysUntilDeadline?: number;
    trackingUrl?: string;
    notes?: string;
}

// ─── Email Templates ──────────────────────────────────────────────────────────

function getEmailTemplate(payload: NotificationPayload): { subject: string; html: string } {
    const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background: #f8fafc;
  `;

    const headerHtml = `
    <div style="background: linear-gradient(135deg, #0f766e, #0d9488); padding: 32px 24px; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">ExporTrack AI</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Export Logistics Document Management</p>
    </div>
  `;

    const footerHtml = `
    <div style="background: #1e293b; padding: 20px 24px; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        This is an automated notification from ExporTrack AI.<br>
        Please do not reply to this email.
      </p>
    </div>
  `;

    function wrapContent(content: string): string {
        return `
      <div style="${baseStyle}">
        ${headerHtml}
        <div style="background: white; padding: 28px 24px;">
          ${content}
        </div>
        ${footerHtml}
      </div>
    `;
    }

    function infoRow(label: string, value: string): string {
        return `
      <tr>
        <td style="padding: 8px 12px; background: #f1f5f9; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; width: 40%; border-bottom: 1px solid #e2e8f0;">${label}</td>
        <td style="padding: 8px 12px; font-size: 13px; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${value}</td>
      </tr>
    `;
    }

    function shipmentTable(): string {
        const rows = [
            payload.shipmentId ? infoRow('Shipment ID', payload.shipmentId) : '',
            payload.clientName ? infoRow('Client', payload.clientName) : '',
            payload.destination ? infoRow('Destination', payload.destination) : '',
            payload.status ? infoRow('Status', payload.status) : '',
            payload.deadline ? infoRow('Deadline', payload.deadline) : '',
        ].filter(Boolean).join('');

        return `
      <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; margin: 16px 0;">
        ${rows}
      </table>
    `;
    }

    switch (payload.event) {
        case 'shipment_created':
            return {
                subject: `✅ New Shipment Created — ${payload.shipmentId}`,
                html: wrapContent(`
          <h2 style="color: #0f766e; margin: 0 0 8px;">New Shipment Created</h2>
          <p style="color: #475569; font-size: 14px; margin: 0 0 16px;">
            Hello ${payload.recipientName}, a new export shipment has been created and assigned to you.
          </p>
          ${shipmentTable()}
          <p style="color: #475569; font-size: 13px;">
            Please upload the required documents (Invoice, Packing List, Bill of Lading, etc.) to proceed.
          </p>
          ${payload.trackingUrl ? `<a href="${payload.trackingUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">View Shipment →</a>` : ''}
        `),
            };

        case 'shipment_dispatched':
            return {
                subject: `🚢 Shipment Dispatched — ${payload.shipmentId}`,
                html: wrapContent(`
          <h2 style="color: #0f766e; margin: 0 0 8px;">Shipment Dispatched</h2>
          <p style="color: #475569; font-size: 14px; margin: 0 0 16px;">
            Hello ${payload.recipientName}, your shipment is now in transit.
          </p>
          ${shipmentTable()}
          ${payload.trackingUrl ? `<a href="${payload.trackingUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Track Shipment →</a>` : ''}
        `),
            };

        case 'shipment_delayed':
            return {
                subject: `⚠️ Shipment Delayed — ${payload.shipmentId}`,
                html: wrapContent(`
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;">
            <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: 600;">⚠️ Delay Alert</p>
          </div>
          <h2 style="color: #b45309; margin: 0 0 8px;">Shipment Delayed</h2>
          <p style="color: #475569; font-size: 14px; margin: 0 0 16px;">
            Hello ${payload.recipientName}, shipment <strong>${payload.shipmentId}</strong> has been marked as delayed.
            ${payload.notes ? `<br><br>Reason: ${payload.notes}` : ''}
          </p>
          ${shipmentTable()}
          <p style="color: #475569; font-size: 13px;">Please take immediate action to resolve the delay.</p>
          ${payload.trackingUrl ? `<a href="${payload.trackingUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #d97706; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">View Details →</a>` : ''}
        `),
            };

        case 'shipment_delivered':
            return {
                subject: `🎉 Shipment Delivered — ${payload.shipmentId}`,
                html: wrapContent(`
          <div style="background: #dcfce7; border: 1px solid #22c55e; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;">
            <p style="color: #166534; font-size: 13px; margin: 0; font-weight: 600;">✅ Delivery Confirmed</p>
          </div>
          <h2 style="color: #16a34a; margin: 0 0 8px;">Shipment Successfully Delivered!</h2>
          <p style="color: #475569; font-size: 14px; margin: 0 0 16px;">
            Hello ${payload.recipientName}, great news! Shipment <strong>${payload.shipmentId}</strong> has been successfully delivered to ${payload.destination || 'the destination'}.
          </p>
          ${shipmentTable()}
        `),
            };

        case 'document_missing':
            return {
                subject: `📄 Missing Document Alert — ${payload.shipmentId}`,
                html: wrapContent(`
          <div style="background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;">
            <p style="color: #991b1b; font-size: 13px; margin: 0; font-weight: 600;">🚨 Action Required</p>
          </div>
          <h2 style="color: #dc2626; margin: 0 0 8px;">Missing Document Alert</h2>
          <p style="color: #475569; font-size: 14px; margin: 0 0 16px;">
            Hello ${payload.recipientName}, the following document is missing for shipment <strong>${payload.shipmentId}</strong>:
          </p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="color: #dc2626; font-size: 16px; font-weight: 700; margin: 0;">📄 ${payload.documentType || 'Required Document'}</p>
          </div>
          ${shipmentTable()}
          <p style="color: #475569; font-size: 13px;">Please upload this document immediately to avoid shipment delays.</p>
          ${payload.trackingUrl ? `<a href="${payload.trackingUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Upload Document →</a>` : ''}
        `),
            };

        case 'document_verified':
            return {
                subject: `✅ Document Verified — ${payload.documentType} for ${payload.shipmentId}`,
                html: wrapContent(`
          <h2 style="color: #16a34a; margin: 0 0 8px;">Document Verified</h2>
          <p style="color: #475569; font-size: 14px; margin: 0 0 16px;">
            Hello ${payload.recipientName}, your document has been verified and approved.
          </p>
          <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="color: #16a34a; font-size: 16px; font-weight: 700; margin: 0;">✅ ${payload.documentType || 'Document'} — Verified</p>
          </div>
          ${shipmentTable()}
        `),
            };

        case 'deadline_reminder':
            return {
                subject: `⏰ Deadline Reminder — ${payload.shipmentId} (${payload.daysUntilDeadline} days left)`,
                html: wrapContent(`
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;">
            <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: 600;">⏰ Deadline Approaching</p>
          </div>
          <h2 style="color: #b45309; margin: 0 0 8px;">Shipment Deadline Reminder</h2>
          <p style="color: #475569; font-size: 14px; margin: 0 0 16px;">
            Hello ${payload.recipientName}, shipment <strong>${payload.shipmentId}</strong> has a deadline in 
            <strong style="color: #dc2626;">${payload.daysUntilDeadline} day${(payload.daysUntilDeadline || 0) > 1 ? 's' : ''}</strong>.
          </p>
          ${shipmentTable()}
          <p style="color: #475569; font-size: 13px;">Please ensure all documents are uploaded and verified before the deadline.</p>
          ${payload.trackingUrl ? `<a href="${payload.trackingUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #d97706; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">View Shipment →</a>` : ''}
        `),
            };

        default:
            return {
                subject: `ExporTrack AI Notification — ${payload.shipmentId}`,
                html: wrapContent(`<p>You have a new notification for shipment ${payload.shipmentId}.</p>`),
            };
    }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || 'notifications@exportrack.ai';

    if (!RESEND_API_KEY) {
        return res.status(500).json({ error: 'Email service not configured. Set RESEND_API_KEY environment variable.' });
    }

    const payload = req.body as NotificationPayload;

    if (!payload.event || !payload.recipientEmail || !payload.shipmentId) {
        return res.status(400).json({ error: 'Missing required fields: event, recipientEmail, shipmentId' });
    }

    const { subject, html } = getEmailTemplate(payload);

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `ExporTrack AI <${FROM_EMAIL}>`,
                to: [payload.recipientEmail],
                subject,
                html,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Resend API error:', error);
            return res.status(500).json({ error: 'Failed to send email', details: error });
        }

        const result = await response.json();
        return res.status(200).json({
            success: true,
            messageId: result.id,
            event: payload.event,
            recipient: payload.recipientEmail,
        });
    } catch (err) {
        console.error('Email send error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
