/**
 * PDF Export Service
 * Generates professional PDF reports for shipments using jsPDF
 */
import { jsPDF } from 'jspdf';
import type { Shipment } from '../types';

const PRIMARY_COLOR: [number, number, number] = [15, 118, 110]; // teal-700
const DARK_COLOR: [number, number, number] = [15, 23, 42]; // slate-900
const GRAY_COLOR: [number, number, number] = [100, 116, 139]; // slate-500
const LIGHT_BG: [number, number, number] = [241, 245, 249]; // slate-100
const SUCCESS_COLOR: [number, number, number] = [22, 163, 74]; // green-600
const DANGER_COLOR: [number, number, number] = [220, 38, 38]; // red-600
const WARNING_COLOR: [number, number, number] = [217, 119, 6]; // amber-600

function addHeader(doc: jsPDF, title: string) {
    // Header background
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(0, 0, 210, 28, 'F');

    // Logo / App name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ExporTrack AI', 14, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Export Logistics Document Management System', 14, 19);

    // Report title on right
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 196, 12, { align: 'right' });

    // Date
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 196, 19, { align: 'right' });

    // Reset color
    doc.setTextColor(...DARK_COLOR);
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(...GRAY_COLOR);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 14, 196, pageHeight - 14);

    doc.setFontSize(8);
    doc.setTextColor(...GRAY_COLOR);
    doc.text('ExporTrack AI — Confidential Export Document', 14, pageHeight - 8);
    doc.text(`Page ${pageNum} of ${totalPages}`, 196, pageHeight - 8, { align: 'right' });
    doc.setTextColor(...DARK_COLOR);
}

function sectionTitle(doc: jsPDF, text: string, y: number): number {
    doc.setFillColor(...LIGHT_BG);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(text, 16, y + 5.5);
    doc.setTextColor(...DARK_COLOR);
    return y + 12;
}

function labelValue(doc: jsPDF, label: string, value: string, x: number, y: number, colWidth = 85) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY_COLOR);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK_COLOR);
    doc.setFontSize(9);
    doc.text(value || '—', x, y + 5);
}

function statusColor(status: string): [number, number, number] {
    if (['Delivered'].includes(status)) return SUCCESS_COLOR;
    if (['Delayed', 'Customs Hold'].includes(status)) return DANGER_COLOR;
    if (['In Transit', 'Out For Delivery'].includes(status)) return PRIMARY_COLOR;
    return WARNING_COLOR;
}

function docStatusColor(status: string): [number, number, number] {
    if (status === 'Verified') return SUCCESS_COLOR;
    if (status === 'Rejected' || status === 'Missing') return DANGER_COLOR;
    return WARNING_COLOR;
}

/**
 * Export a single shipment as a detailed PDF report
 */
export function exportShipmentPDF(shipment: Shipment): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    addHeader(doc, 'Shipment Report');

    let y = 36;

    // ── Shipment Overview ──────────────────────────────────────────────────────
    y = sectionTitle(doc, '📦 Shipment Overview', y);

    labelValue(doc, 'Shipment ID', shipment.id, 14, y);
    labelValue(doc, 'Client Name', shipment.clientName, 105, y);
    y += 14;

    labelValue(doc, 'Destination Country', shipment.destinationCountry, 14, y);
    labelValue(doc, 'Container Number', shipment.containerNumber, 105, y);
    y += 14;

    labelValue(doc, 'Shipment Date', shipment.shipmentDate, 14, y);
    labelValue(doc, 'Deadline', shipment.deadline, 105, y);
    y += 14;

    labelValue(doc, 'Assigned To', shipment.assignedTo, 14, y);
    labelValue(doc, 'Priority', shipment.priority, 105, y);
    y += 14;

    // Status badge
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY_COLOR);
    doc.text('STATUS', 14, y);
    const sc = statusColor(shipment.status);
    doc.setFillColor(...sc);
    doc.roundedRect(14, y + 2, 50, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(shipment.status, 39, y + 6.5, { align: 'center' });
    doc.setTextColor(...DARK_COLOR);

    if (shipment.isDelayed) {
        doc.setFillColor(...DANGER_COLOR);
        doc.roundedRect(68, y + 2, 22, 7, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('DELAYED', 79, y + 6.5, { align: 'center' });
        doc.setTextColor(...DARK_COLOR);
    }
    y += 18;

    // ── Driver Information ─────────────────────────────────────────────────────
    if (shipment.driverName) {
        y = sectionTitle(doc, '🚛 Driver Information', y);
        labelValue(doc, 'Driver Name', shipment.driverName, 14, y);
        labelValue(doc, 'Phone', shipment.driverPhone || '—', 105, y);
        y += 14;
        labelValue(doc, 'Vehicle Number', shipment.vehicleNumber || '—', 14, y);
        labelValue(doc, 'Est. Delivery', shipment.estimatedDeliveryTime || '—', 105, y);
        y += 18;
    }

    // ── Documents Checklist ────────────────────────────────────────────────────
    y = sectionTitle(doc, '📄 Documents Checklist', y);

    const docTypes = [
        'Invoice', 'Packing List', 'Bill of Lading', 'Shipping Bill',
        'Certificate of Origin', 'Insurance Papers', 'Customs Files'
    ];

    // Table header
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(14, y, 182, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Document Type', 16, y + 5);
    doc.text('File Name', 80, y + 5);
    doc.text('Format', 145, y + 5);
    doc.text('Status', 170, y + 5);
    y += 7;

    docTypes.forEach((docType, i) => {
        const doc_ = shipment.documents.find((d) => d.type === docType);
        const rowBg: [number, number, number] = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
        doc.setFillColor(...rowBg);
        doc.rect(14, y, 182, 7, 'F');

        doc.setTextColor(...DARK_COLOR);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(docType, 16, y + 5);

        if (doc_) {
            doc.text(doc_.fileName.length > 30 ? doc_.fileName.substring(0, 28) + '...' : doc_.fileName, 80, y + 5);
            doc.text(doc_.fileFormat, 145, y + 5);

            const sc2 = docStatusColor(doc_.status);
            doc.setTextColor(...sc2);
            doc.setFont('helvetica', 'bold');
            doc.text(doc_.status, 170, y + 5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...DARK_COLOR);
        } else {
            doc.setTextColor(...DANGER_COLOR);
            doc.text('Not Uploaded', 80, y + 5);
            doc.setFont('helvetica', 'bold');
            doc.text('Missing', 170, y + 5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...DARK_COLOR);
        }
        y += 7;
    });
    y += 6;

    // ── Timeline ───────────────────────────────────────────────────────────────
    if (shipment.timeline && shipment.timeline.length > 0) {
        if (y > 220) {
            doc.addPage();
            addHeader(doc, 'Shipment Report (cont.)');
            y = 36;
        }
        y = sectionTitle(doc, '📅 Status Timeline', y);

        shipment.timeline.forEach((event) => {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...PRIMARY_COLOR);
            doc.text('●', 16, y + 4);
            doc.setTextColor(...DARK_COLOR);
            doc.text(event.status, 22, y + 4);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...GRAY_COLOR);
            doc.text(new Date(event.timestamp).toLocaleString('en-IN'), 100, y + 4);
            if (event.note) {
                doc.setFontSize(7);
                doc.text(event.note, 22, y + 9);
                y += 12;
            } else {
                y += 8;
            }
        });
        y += 4;
    }

    // ── Comments / Notes ───────────────────────────────────────────────────────
    const publicComments = shipment.comments.filter((c) => !c.internal);
    if (publicComments.length > 0) {
        if (y > 220) {
            doc.addPage();
            addHeader(doc, 'Shipment Report (cont.)');
            y = 36;
        }
        y = sectionTitle(doc, '💬 Comments & Notes', y);

        publicComments.forEach((comment) => {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...DARK_COLOR);
            doc.text(`${comment.author} (${comment.role})`, 16, y + 4);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...GRAY_COLOR);
            doc.text(new Date(comment.createdAt).toLocaleString('en-IN'), 196, y + 4, { align: 'right' });
            doc.setTextColor(...DARK_COLOR);
            doc.setFontSize(8);
            const lines = doc.splitTextToSize(comment.message, 170);
            doc.text(lines, 16, y + 10);
            y += 10 + lines.length * 5;
        });
    }

    // Add footers to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages);
    }

    doc.save(`Shipment_${shipment.id}_Report.pdf`);
}

/**
 * Export multiple shipments as a summary list PDF
 */
export function exportShipmentListPDF(shipments: Shipment[], title = 'All Shipments Report'): void {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    addHeader(doc, title);

    let y = 36;

    // Summary stats
    const total = shipments.length;
    const delivered = shipments.filter((s) => s.status === 'Delivered').length;
    const delayed = shipments.filter((s) => s.isDelayed).length;
    const inTransit = shipments.filter((s) => s.status === 'In Transit').length;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY_COLOR);

    const stats = [
        { label: 'Total Shipments', value: String(total), color: PRIMARY_COLOR },
        { label: 'Delivered', value: String(delivered), color: SUCCESS_COLOR },
        { label: 'In Transit', value: String(inTransit), color: WARNING_COLOR },
        { label: 'Delayed', value: String(delayed), color: DANGER_COLOR },
    ];

    stats.forEach((stat, i) => {
        const x = 14 + i * 70;
        doc.setFillColor(...stat.color);
        doc.roundedRect(x, y, 65, 16, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(stat.value, x + 32.5, y + 10, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(stat.label, x + 32.5, y + 14.5, { align: 'center' });
    });
    doc.setTextColor(...DARK_COLOR);
    y += 24;

    // Table header
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(14, y, 269, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Shipment ID', 16, y + 5.5);
    doc.text('Client', 55, y + 5.5);
    doc.text('Destination', 105, y + 5.5);
    doc.text('Date', 150, y + 5.5);
    doc.text('Deadline', 180, y + 5.5);
    doc.text('Priority', 210, y + 5.5);
    doc.text('Status', 240, y + 5.5);
    y += 8;

    shipments.forEach((s, i) => {
        if (y > 185) {
            doc.addPage();
            addHeader(doc, title + ' (cont.)');
            y = 36;
        }

        const rowBg: [number, number, number] = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
        doc.setFillColor(...rowBg);
        doc.rect(14, y, 269, 7, 'F');

        doc.setTextColor(...DARK_COLOR);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(s.id, 16, y + 5);
        doc.text(s.clientName.length > 20 ? s.clientName.substring(0, 18) + '...' : s.clientName, 55, y + 5);
        doc.text(s.destinationCountry, 105, y + 5);
        doc.text(s.shipmentDate, 150, y + 5);
        doc.text(s.deadline, 180, y + 5);

        // Priority color
        const pColor: [number, number, number] = s.priority === 'High' ? DANGER_COLOR : s.priority === 'Medium' ? WARNING_COLOR : SUCCESS_COLOR;
        doc.setTextColor(...pColor);
        doc.setFont('helvetica', 'bold');
        doc.text(s.priority, 210, y + 5);

        // Status
        const sc = statusColor(s.status);
        doc.setTextColor(...sc);
        doc.text(s.status, 240, y + 5);
        doc.setTextColor(...DARK_COLOR);
        doc.setFont('helvetica', 'normal');

        y += 7;
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages);
    }

    doc.save(`ExporTrack_Shipments_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Export document checklist as PDF
 */
export function exportDocumentChecklistPDF(shipment: Shipment): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    addHeader(doc, 'Document Checklist');

    let y = 36;

    y = sectionTitle(doc, `📋 Document Checklist — ${shipment.id}`, y);

    labelValue(doc, 'Client', shipment.clientName, 14, y);
    labelValue(doc, 'Destination', shipment.destinationCountry, 105, y);
    y += 14;
    labelValue(doc, 'Shipment Date', shipment.shipmentDate, 14, y);
    labelValue(doc, 'Status', shipment.status, 105, y);
    y += 18;

    const docTypes = [
        'Invoice', 'Packing List', 'Bill of Lading', 'Shipping Bill',
        'Certificate of Origin', 'Insurance Papers', 'Customs Files',
        'Letter of Credit', 'Delivery Order', 'Inspection Report'
    ];

    docTypes.forEach((docType, i) => {
        const docItem = shipment.documents.find((d) => d.type === docType);
        const rowBg: [number, number, number] = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
        doc.setFillColor(...rowBg);
        doc.rect(14, y, 182, 12, 'F');

        // Checkbox
        if (docItem && docItem.status === 'Verified') {
            doc.setFillColor(...SUCCESS_COLOR);
            doc.roundedRect(16, y + 2.5, 7, 7, 1, 1, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text('✓', 19.5, y + 7.5, { align: 'center' });
        } else if (docItem && docItem.status === 'Rejected') {
            doc.setFillColor(...DANGER_COLOR);
            doc.roundedRect(16, y + 2.5, 7, 7, 1, 1, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text('✗', 19.5, y + 7.5, { align: 'center' });
        } else if (docItem && docItem.status === 'Pending') {
            doc.setFillColor(...WARNING_COLOR);
            doc.roundedRect(16, y + 2.5, 7, 7, 1, 1, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text('?', 19.5, y + 7.5, { align: 'center' });
        } else {
            doc.setDrawColor(...GRAY_COLOR);
            doc.setLineWidth(0.5);
            doc.roundedRect(16, y + 2.5, 7, 7, 1, 1, 'S');
        }

        doc.setTextColor(...DARK_COLOR);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(docType, 27, y + 7.5);

        if (docItem) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(...GRAY_COLOR);
            doc.text(`Uploaded: ${new Date(docItem.uploadedAt).toLocaleDateString('en-IN')} by ${docItem.uploadedBy}`, 27, y + 11);
            doc.setTextColor(...DARK_COLOR);

            const sc = docStatusColor(docItem.status);
            doc.setFillColor(...sc);
            doc.roundedRect(170, y + 2.5, 22, 7, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            doc.text(docItem.status, 181, y + 7, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...DARK_COLOR);
        } else {
            doc.setFillColor(...DANGER_COLOR);
            doc.roundedRect(170, y + 2.5, 22, 7, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            doc.text('Missing', 181, y + 7, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...DARK_COLOR);
        }

        y += 14;
    });

    // Summary
    y += 4;
    const verified = shipment.documents.filter((d) => d.status === 'Verified').length;
    const missing = docTypes.filter((dt) => !shipment.documents.find((d) => d.type === dt)).length;
    const pending = shipment.documents.filter((d) => d.status === 'Pending').length;

    doc.setFillColor(...LIGHT_BG);
    doc.rect(14, y, 182, 20, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK_COLOR);
    doc.text('Summary:', 16, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SUCCESS_COLOR);
    doc.text(`✓ Verified: ${verified}`, 16, y + 14);
    doc.setTextColor(...WARNING_COLOR);
    doc.text(`⏳ Pending: ${pending}`, 60, y + 14);
    doc.setTextColor(...DANGER_COLOR);
    doc.text(`✗ Missing: ${missing}`, 104, y + 14);
    doc.setTextColor(...DARK_COLOR);

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages);
    }

    doc.save(`Checklist_${shipment.id}.pdf`);
}
