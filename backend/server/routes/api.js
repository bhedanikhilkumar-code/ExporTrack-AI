const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// --- Helper Functions (Reused from auth-otp.ts) ---

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 30;

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- API Endpoints ---

// 1. Validate Email
router.post('/validate-email', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ isValid: false, error: 'Email is required' });

    const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const isValid = EMAIL_REGEX.test(email.toLowerCase());

    if (!isValid) return res.json({ isValid: false, error: 'Invalid email format' });

    // For simplicity, just return valid if format is correct
    res.json({ isValid: true, isDisposable: false });
});

// 2. Send OTP
router.post('/send-otp', async (req, res) => {
    const { email, type } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

    const emailLower = email.toLowerCase();
    const now = Date.now();

    try {
        // Rate limiting check
        const [existing] = await pool.query('SELECT lastSentAt FROM otps WHERE email = ?', [emailLower]);
        if (existing && existing.length > 0) {
            const timeSinceLastSent = (now - existing[0].lastSentAt) / 1000;
            if (timeSinceLastSent < RESEND_COOLDOWN_SECONDS) {
                return res.status(429).json({
                    success: false,
                    error: `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - timeSinceLastSent)} seconds`
                });
            }
        }

        const newOTP = generateOTP();
        const expiresAt = now + (OTP_EXPIRY_MINUTES * 60 * 1000);

        // Upsert OTP in DB
        await pool.query(
            'INSERT INTO otps (email, otp, expiresAt, lastSentAt, verified, attempts) VALUES (?, ?, ?, ?, false, 0) ON DUPLICATE KEY UPDATE otp = ?, expiresAt = ?, lastSentAt = ?, verified = false, attempts = 0',
            [emailLower, newOTP, expiresAt, now, newOTP, expiresAt, now]
        );

        // In dev mode, we just return the OTP for testing
        console.log(`[DEV] OTP for ${emailLower}: ${newOTP}`);

        return res.status(200).json({
            success: true,
            message: 'Code sent',
            devMode: true,
            devOTP: newOTP
        });

    } catch (error) {
        console.error('Error in send-otp:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, error: 'Email and OTP required' });

    const emailLower = email.toLowerCase();
    const now = Date.now();

    try {
        const [rows] = await pool.query('SELECT * FROM otps WHERE email = ?', [emailLower]);
        if (!rows || rows.length === 0) return res.status(400).json({ success: false, error: 'Code not found' });

        const stored = rows[0];

        if (stored.expiresAt < now) return res.status(400).json({ success: false, error: 'Code expired' });
        if (stored.verified) return res.status(400).json({ success: false, error: 'Code already used' });
        if (stored.attempts >= MAX_ATTEMPTS) return res.status(400).json({ success: false, error: 'Too many attempts' });

        if (stored.otp === otp) {
            await pool.query('UPDATE otps SET verified = true WHERE email = ?', [emailLower]);

            // Create user if not exists
            const userId = `email-${emailLower}`;
            await pool.query(
                'INSERT IGNORE INTO users (id, name, email, role, userMode) VALUES (?, ?, ?, ?, ?)',
                [userId, emailLower.split('@')[0], emailLower, 'Staff', 'real']
            );

            return res.status(200).json({ success: true, email: emailLower, userId });
        } else {
            await pool.query('UPDATE otps SET attempts = attempts + 1 WHERE email = ?', [emailLower]);
            return res.status(400).json({ success: false, error: 'Invalid code' });
        }
    } catch (error) {
        console.error('Error in verify-otp:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. AI Document Extraction (OCR)
router.post('/ocr/extract', async (req, res) => {
    const { docType, fileName } = req.body;

    if (!docType || !fileName) {
        return res.status(400).json({ success: false, error: 'Document type and file name required' });
    }

    // Mock extraction logic based on docType
    const mockExtractions = {
        'Bill of Lading': {
            invoice_number: 'BL-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            exporter_name: 'Apex Retail Imports',
            importer_name: 'Global Trade GmbH',
            total_amount: '$' + (Math.random() * 50000 + 5000).toFixed(2),
            invoice_date: new Date().toISOString().split('T')[0],
            product_details: 'Industrial Machinery Parts',
            shipmentId: 'EXP-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000),
            destinationCountry: 'Germany',
            containerNumber: 'MSCU' + Math.floor(Math.random() * 10000000),
            documentStatus: 'Verified',
            docType: 'Bill of Lading',
            confidence: Math.floor(Math.random() * 15 + 85),
            extractedAt: new Date().toISOString(),
        },
        'Commercial Invoice': {
            invoice_number: 'INV-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            exporter_name: 'Sunrise Manufacturing Co.',
            importer_name: 'Pacific Rim Traders LLC',
            total_amount: '$' + (Math.random() * 20000 + 1000).toFixed(2),
            invoice_date: new Date().toISOString().split('T')[0],
            product_details: 'Solar Panel Components',
            shipmentId: 'SHP-' + Math.floor(Math.random() * 1000000),
            destinationCountry: 'United States',
            containerNumber: 'HLCU' + Math.floor(Math.random() * 10000000),
            documentStatus: 'Pending Review',
            docType: 'Commercial Invoice',
            confidence: Math.floor(Math.random() * 15 + 80),
            extractedAt: new Date().toISOString(),
        },
        'Packing List': {
            invoice_number: 'PKL-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            exporter_name: 'Delta Logistics (India)',
            importer_name: 'Eurotrade Sprl',
            total_amount: 'N/A',
            invoice_date: new Date().toISOString().split('T')[0],
            product_details: 'Mixed Textiles - 120 Cartons',
            shipmentId: 'SHP-' + Math.floor(Math.random() * 1000000),
            destinationCountry: 'Belgium',
            containerNumber: 'MAEU' + Math.floor(Math.random() * 10000000),
            documentStatus: 'Flagged',
            docType: 'Packing List',
            confidence: Math.floor(Math.random() * 25 + 70),
            extractedAt: new Date().toISOString(),
        }
    };

    const result = mockExtractions[docType] || mockExtractions['Bill of Lading'];

    // Simulate processing time
    setTimeout(() => {
        res.json({ success: true, data: result });
    }, 2000);
});

// 5. Buyers Management
router.get('/buyers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM buyers ORDER BY companyName ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/buyers', async (req, res) => {
    try {
        const buyer = req.body;
        await pool.query('INSERT INTO buyers SET ?', [buyer]);
        res.status(201).json({ success: true, data: buyer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Suppliers Management
router.get('/suppliers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY companyName ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/suppliers', async (req, res) => {
    try {
        const supplier = req.body;
        await pool.query('INSERT INTO suppliers SET ?', [supplier]);
        res.status(201).json({ success: true, data: supplier });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. Team Management
router.get('/teams/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM teams WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Team not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/teams', async (req, res) => {
    const { id, name, ownerId, plan } = req.body;
    try {
        await pool.query('INSERT INTO teams (id, name, ownerId, plan) VALUES (?, ?, ?, ?)', [id, name, ownerId, plan]);
        // Owner becomes first member
        await pool.query('INSERT INTO team_members (teamId, userId, role) VALUES (?, ?, ?)', [id, ownerId, 'Admin']);
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/teams/:id/members', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM team_members WHERE teamId = ?', [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/teams/:id/members', async (req, res) => {
    const { userId, role } = req.body;
    try {
        await pool.query('INSERT INTO team_members (teamId, userId, role) VALUES (?, ?, ?)', [req.params.id, userId, role]);
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. Shipment Documents
router.get('/shipments/:id/documents', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM shipment_documents WHERE shipmentId = ?', [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/shipments/:id/documents', async (req, res) => {
    const { id, userId, type, fileName, fileFormat, status, uploadedBy } = req.body;
    try {
        await pool.query(
            'INSERT INTO shipment_documents (id, shipmentId, userId, type, fileName, fileFormat, status, uploadedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, req.params.id, userId, type, fileName, fileFormat, status || 'Pending', uploadedBy]
        );
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/shipments/:id/documents/:docId', async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query('UPDATE shipment_documents SET status = ? WHERE id = ? AND shipmentId = ?', [status, req.params.docId, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 9. Shipment Timeline
router.get('/shipments/:id/timeline', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM shipment_timeline WHERE shipmentId = ? ORDER BY timestamp DESC', [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/shipments/:id/timeline', async (req, res) => {
    const { id, status, note, timestamp } = req.body;
    try {
        await pool.query(
            'INSERT INTO shipment_timeline (id, shipmentId, status, note, timestamp) VALUES (?, ?, ?, ?, ?)',
            [id, req.params.id, status, note, timestamp || new Date()]
        );
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 10. Shipment Comments
router.get('/shipments/:id/comments', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM shipment_comments WHERE shipmentId = ? ORDER BY createdAt ASC', [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/shipments/:id/comments', async (req, res) => {
    const { id, author, role, message, internal } = req.body;
    try {
        await pool.query(
            'INSERT INTO shipment_comments (id, shipmentId, author, role, message, internal) VALUES (?, ?, ?, ?, ?, ?)',
            [id, req.params.id, author, role, message, internal ? 1 : 0]
        );
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 11. Notifications
router.get('/notifications', async (req, res) => {
    const { userId } = req.query;
    try {
        const [rows] = await pool.query('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC', [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/notifications/:id/read', async (req, res) => {
    try {
        await pool.query('UPDATE notifications SET isRead = 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 12. Audit Logs
router.get('/audit-logs', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/audit-logs', async (req, res) => {
    const log = req.body;
    try {
        await pool.query('INSERT INTO audit_logs SET ?', [log]);
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 13. Profile Management
router.patch('/users/:id', async (req, res) => {
    const { name, region } = req.body;
    try {
        await pool.query('UPDATE users SET name = ?, region = ? WHERE id = ?', [name, region, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 14. Team Invites
router.post('/invite-member', async (req, res) => {
    const { email, role, workspaceId } = req.body;
    const token = Math.random().toString(36).substr(2, 12);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    try {
        const id = `inv-${Date.now()}`;
        await pool.query(
            'INSERT INTO team_invites (id, teamId, email, role, token, expiresAt) VALUES (?, ?, ?, ?, ?, ?)',
            [id, workspaceId, email, role, token, expiresAt]
        );
        res.json({ success: true, inviteId: id, inviteToken: token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/invite-member', async (req, res) => {
    const { token } = req.query;
    try {
        const [rows] = await pool.query('SELECT * FROM team_invites WHERE token = ?', [token]);
        if (rows.length === 0) return res.status(404).json({ success: false, error: 'Invite not found' });
        res.json({ success: true, invite: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/confirm-invite', async (req, res) => {
    const { token } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM team_invites WHERE token = ?', [token]);
        if (rows.length === 0) return res.status(404).json({ success: false, error: 'Invalid token' });

        const invite = rows[0];
        // Add member to team
        const userId = `email-${invite.email.toLowerCase()}`;
        await pool.query('INSERT INTO team_members (teamId, userId, role) VALUES (?, ?, ?)', [invite.teamId, userId, invite.role]);
        // Delete invite
        await pool.query('DELETE FROM team_invites WHERE token = ?', [token]);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/resend-invite', async (req, res) => {
    const { inviteId } = req.body;
    try {
        // Logic to resend email would go here
        res.json({ success: true, message: 'Invite resent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 15. Email/System Notifications
router.post('/send-notification', async (req, res) => {
    const { userId, type, title, message, severity } = req.body;
    try {
        const id = `notif-${Date.now()}`;
        await pool.query(
            'INSERT INTO notifications (id, userId, type, title, message, severity) VALUES (?, ?, ?, ?, ?, ?)',
            [id, userId, type, title, message, severity || 'Medium']
        );
        res.json({ success: true, notificationId: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 16. Live Trackings
router.get('/trackings', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM trackings');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/trackings', async (req, res) => {
    try {
        const tracking = req.body;
        await pool.query('INSERT INTO trackings SET ?', [tracking]);
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/trackings/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM trackings WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 17. Payments Management
router.get('/payments/list', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM payments ORDER BY createdAt DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/payments/create', async (req, res) => {
    const p = req.body;
    const id = `PAY-${Date.now()}`;
    try {
        await pool.query(
            `INSERT INTO payments (id, referenceNo, buyerId, invoiceId, amount, currency, date, method, status, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, p.referenceNo, p.buyerId, p.invoiceId || null, p.amount, p.currency || 'USD', p.date, p.method || 'Wire Transfer', p.status || 'Pending', p.notes || null]
        );
        res.status(201).json({ success: true, message: 'Payment recorded', data: { id, ...p } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/payments/delete', async (req, res) => {
    const { id } = req.query;
    try {
        await pool.query('DELETE FROM payments WHERE id = ?', [id]);
        res.json({ success: true, message: 'Payment deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 18. Document Management (Invoices, PL, SB, COO)
router.get('/documents/invoices', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM invoices ORDER BY createdAt DESC');
        // Parse JSON fields
        const invoices = rows.map(r => ({
            ...r,
            exporterDetails: typeof r.exporterDetails === 'string' ? JSON.parse(r.exporterDetails) : r.exporterDetails,
            buyerDetails: typeof r.buyerDetails === 'string' ? JSON.parse(r.buyerDetails) : r.buyerDetails,
            shipmentDetails: typeof r.shipmentDetails === 'string' ? JSON.parse(r.shipmentDetails) : r.shipmentDetails,
            items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
            bankDetails: typeof r.bankDetails === 'string' ? JSON.parse(r.bankDetails) : r.bankDetails,
            linkedDocuments: typeof r.linkedDocuments === 'string' ? JSON.parse(r.linkedDocuments) : r.linkedDocuments
        }));
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/documents/invoices', async (req, res) => {
    const inv = req.body;
    try {
        await pool.query(
            `INSERT INTO invoices (id, invoiceNumber, invoiceDate, status, exporterDetails, buyerDetails, shipmentDetails, items, subTotal, taxTotal, discountTotal, grandTotal, currency, bankDetails, linkedDocuments) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             status=VALUES(status), exporterDetails=VALUES(exporterDetails), buyerDetails=VALUES(buyerDetails), shipmentDetails=VALUES(shipmentDetails), 
             items=VALUES(items), grandTotal=VALUES(grandTotal), bankDetails=VALUES(bankDetails)`,
            [inv.id, inv.invoiceNumber, inv.invoiceDate, inv.status, JSON.stringify(inv.exporterDetails), JSON.stringify(inv.buyerDetails), JSON.stringify(inv.shipmentDetails), JSON.stringify(inv.items), inv.subTotal, inv.taxTotal, inv.discountTotal, inv.grandTotal, inv.currency, JSON.stringify(inv.bankDetails), JSON.stringify(inv.linkedDocuments || [])]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/documents/invoices/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM invoices WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Similar for Packing Lists
router.get('/documents/packing-lists', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM packing_lists ORDER BY createdAt DESC');
        const pl = rows.map(r => ({
            ...r,
            exporterDetails: JSON.parse(r.exporterDetails || '{}'),
            buyerDetails: JSON.parse(r.buyerDetails || '{}'),
            shipmentDetails: JSON.parse(r.shipmentDetails || '{}'),
            packages: JSON.parse(r.packages || '[]'),
            linkedDocuments: JSON.parse(r.linkedDocuments || '[]')
        }));
        res.json(pl);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/documents/packing-lists', async (req, res) => {
    const pl = req.body;
    try {
        await pool.query(
            `INSERT INTO packing_lists (id, plNumber, plDate, status, linkedInvoiceId, exporterDetails, buyerDetails, shipmentDetails, packages, totalPackages, totalNetWeight, totalGrossWeight, totalVolume, linkedDocuments) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             status=VALUES(status), packages=VALUES(packages), totalPackages=VALUES(totalPackages), totalNetWeight=VALUES(totalNetWeight), totalGrossWeight=VALUES(totalGrossWeight)`,
            [pl.id, pl.plNumber, pl.plDate, pl.status, pl.linkedInvoiceId, JSON.stringify(pl.exporterDetails), JSON.stringify(pl.buyerDetails), JSON.stringify(pl.shipmentDetails), JSON.stringify(pl.packages), pl.totalPackages, pl.totalNetWeight, pl.totalGrossWeight, pl.totalVolume, JSON.stringify(pl.linkedDocuments || [])]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/documents/packing-lists/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM packing_lists WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Shipping Bills
router.get('/documents/shipping-bills', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM shipping_bills ORDER BY createdAt DESC');
        const sb = rows.map(r => ({
            ...r,
            exporterDetails: JSON.parse(r.exporterDetails || '{}'),
            consigneeDetails: JSON.parse(r.consigneeDetails || '{}'),
            shipmentDetails: JSON.parse(r.shipmentDetails || '{}'),
            items: JSON.parse(r.items || '[]'),
            drawbackDetails: JSON.parse(r.drawbackDetails || '{}'),
            linkedDocuments: JSON.parse(r.linkedDocuments || '[]')
        }));
        res.json(sb);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/documents/shipping-bills', async (req, res) => {
    const sb = req.body;
    try {
        await pool.query(
            `INSERT INTO shipping_bills (id, sbNumber, sbDate, status, customsStation, portCode, exporterDetails, consigneeDetails, exportScheme, shipmentDetails, items, totalFOBValueINR, totalFOBValueForeign, currency, exchangeRate, drawbackDetails, linkedDocuments) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status=VALUES(status), items=VALUES(items)`,
            [sb.id, sb.sbNumber, sb.sbDate, sb.status, sb.customsStation, sb.portCode, JSON.stringify(sb.exporterDetails), JSON.stringify(sb.consigneeDetails), sb.exportScheme, JSON.stringify(sb.shipmentDetails), JSON.stringify(sb.items), sb.totalFOBValueINR, sb.totalFOBValueForeign, sb.currency, sb.exchangeRate, JSON.stringify(sb.drawbackDetails), JSON.stringify(sb.linkedDocuments || [])]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// COO
router.get('/documents/coos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM certificate_of_origins ORDER BY createdAt DESC');
        const coo = rows.map(r => ({
            ...r,
            exporterDetails: JSON.parse(r.exporterDetails || '{}'),
            consigneeDetails: JSON.parse(r.consigneeDetails || '{}'),
            transportDetails: JSON.parse(r.transportDetails || '{}'),
            items: JSON.parse(r.items || '[]'),
            linkedDocuments: JSON.parse(r.linkedDocuments || '[]')
        }));
        res.json(coo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/documents/coos', async (req, res) => {
    const coo = req.body;
    try {
        await pool.query(
            `INSERT INTO certificate_of_origins (id, cooNumber, cooDate, status, cooType, exporterDetails, consigneeDetails, transportDetails, items, declarationText, issuingAuthority, linkedDocuments) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status=VALUES(status), items=VALUES(items)`,
            [coo.id, coo.cooNumber, coo.cooDate, coo.status, coo.cooType, JSON.stringify(coo.exporterDetails), JSON.stringify(coo.consigneeDetails), JSON.stringify(coo.transportDetails), JSON.stringify(coo.items), coo.declarationText, coo.issuingAuthority, JSON.stringify(coo.linkedDocuments || [])]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 19. Workspace Settings
router.get('/workspace/settings', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM workspace_settings LIMIT 1');
        res.json(rows[0] || { name: 'ExporTrack Pro Workspace', tagline: 'Modern Logistics Hub' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/workspace/settings', async (req, res) => {
    const { name, tagline, timezone, language } = req.body;
    try {
        await pool.query(
            `INSERT INTO workspace_settings (id, name, tagline, timezone, language) 
             VALUES ('default', ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE name=VALUES(name), tagline=VALUES(tagline), timezone=VALUES(timezone), language=VALUES(language)`,
            [name, tagline || '', timezone || 'UTC', language || 'en']
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
