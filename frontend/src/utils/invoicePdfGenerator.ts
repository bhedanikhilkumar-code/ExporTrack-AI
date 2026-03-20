/**
 * Invoice PDF Generator
 * Generates professional, GST-compliant Commercial Invoice PDF
 * using jsPDF + jspdf-autotable
 */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { CommercialInvoice } from '../types/invoice';
import { numberToWords, formatCurrency } from './documentUtils';

// Augment jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

const PRIMARY: [number, number, number] = [15, 118, 110];
const DARK: [number, number, number] = [15, 23, 42];
const GRAY: [number, number, number] = [100, 116, 139];
const LIGHT_BG: [number, number, number] = [241, 245, 249];

export function generateInvoicePDF(invoice: CommercialInvoice): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ── Header Bar ──
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 210, 8, 'F');

  // ── Copy Type Stamp ──
  if (invoice.copyType) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(invoice.copyType.toUpperCase(), 196, 5.5, { align: 'right' });
  }

  let y = 14;

  // ── Title ──
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('COMMERCIAL INVOICE', 105, y, { align: 'center' });
  y += 8;

  // ── Invoice Number & Date ──
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, y);
  doc.text(`Date: ${invoice.invoiceDate}`, 196, y, { align: 'right' });
  y += 3;
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 6;

  // ── Exporter & Buyer (Two-Column) ──
  const colWidth = 88;
  const leftX = 14;
  const rightX = 108;
  const boxTop = y;

  // Exporter Box
  doc.setFillColor(...LIGHT_BG);
  doc.rect(leftX, boxTop, colWidth, 42, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY);
  doc.text('EXPORTER / SHIPPER', leftX + 3, boxTop + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  doc.setFontSize(8);
  doc.text(invoice.exporterDetails.name, leftX + 3, boxTop + 11);
  const expAddr = doc.splitTextToSize(invoice.exporterDetails.address || '', colWidth - 6);
  doc.text(expAddr, leftX + 3, boxTop + 16);
  const expY = boxTop + 16 + expAddr.length * 4;
  if (invoice.exporterDetails.gstin) doc.text(`GSTIN: ${invoice.exporterDetails.gstin}`, leftX + 3, expY);
  if (invoice.exporterDetails.iec) doc.text(`IEC: ${invoice.exporterDetails.iec}`, leftX + 3, expY + 4);
  if (invoice.exporterDetails.pan) doc.text(`PAN: ${invoice.exporterDetails.pan}`, leftX + 3, expY + 8);

  // Buyer Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 200, 200);
  doc.rect(rightX, boxTop, colWidth, 42, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY);
  doc.text('BUYER / CONSIGNEE', rightX + 3, boxTop + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  doc.text(invoice.buyerDetails.name, rightX + 3, boxTop + 11);
  const buyerAddr = doc.splitTextToSize(invoice.buyerDetails.address || '', colWidth - 6);
  doc.text(buyerAddr, rightX + 3, boxTop + 16);
  if (invoice.buyerDetails.country) doc.text(`Country: ${invoice.buyerDetails.country}`, rightX + 3, boxTop + 16 + buyerAddr.length * 4);
  if (invoice.buyerDetails.buyerOrderNo) doc.text(`Buyer Order: ${invoice.buyerDetails.buyerOrderNo}`, rightX + 3, boxTop + 20 + buyerAddr.length * 4);

  y = boxTop + 46;

  // ── Shipment Details ──
  doc.setFillColor(...LIGHT_BG);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY);
  doc.text('SHIPMENT DETAILS', 16, y + 5);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  doc.setFontSize(7.5);
  const shipFields = [
    ['Port of Loading', invoice.shipmentDetails.portOfLoading, 'Port of Discharge', invoice.shipmentDetails.portOfDischarge],
    ['Final Destination', invoice.shipmentDetails.finalDestination, 'Vessel / Flight', invoice.shipmentDetails.vesselFlightNo],
    ['Terms (Incoterms)', invoice.shipmentDetails.termsOfDelivery, 'Currency', invoice.shipmentDetails.currency],
    ['B/L No', invoice.shipmentDetails.billOfLadingNo, 'Payment Terms', invoice.shipmentDetails.paymentTerms],
  ];

  shipFields.forEach(([l1, v1, l2, v2]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY);
    doc.text(l1 + ':', 16, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(v1 || '—', 52, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY);
    doc.text(l2 + ':', 110, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(v2 || '—', 146, y);
    y += 5;
  });

  y += 3;

  // ── Items Table ──
  const totalQty = invoice.items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = invoice.items.reduce((s, i) => s + i.totalPrice, 0);
  const totalNetWt = invoice.items.reduce((s, i) => s + i.netWeight, 0);
  const totalGrossWt = invoice.items.reduce((s, i) => s + i.grossWeight, 0);

  doc.autoTable({
    startY: y,
    head: [['Sr', 'Description', 'HS Code', 'Qty', 'Unit', 'Rate', 'Amount', 'Net Wt', 'Gross Wt']],
    body: [
      ...invoice.items.map(item => [
        item.srNo,
        item.description,
        item.hsCode,
        item.quantity,
        item.unit,
        item.unitPrice.toFixed(2),
        item.totalPrice.toFixed(2),
        item.netWeight.toFixed(2),
        item.grossWeight.toFixed(2),
      ]),
      // Totals row
      ['', 'TOTAL', '', totalQty, '', '', totalAmount.toFixed(2), totalNetWt.toFixed(2), totalGrossWt.toFixed(2)],
    ],
    styles: { fontSize: 7, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 42 },
      2: { cellWidth: 20 },
      3: { cellWidth: 14, halign: 'right' },
      4: { cellWidth: 12 },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 24, halign: 'right' },
      7: { cellWidth: 20, halign: 'right' },
      8: { cellWidth: 20, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data: any) => {
      // Bold the totals row
      if (data.row.index === invoice.items.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    },
  });

  y = doc.lastAutoTable.finalY + 4;

  // ── Amount in Words ──
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(`Amount in Words: ${invoice.shipmentDetails.currency} ${numberToWords(totalAmount)}`, 16, y);
  y += 8;

  // ── Bank Details ──
  doc.setFillColor(...LIGHT_BG);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY);
  doc.text('BANK DETAILS', 16, y + 5);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  doc.setFontSize(7.5);
  const bankFields = [
    ['Bank Name', invoice.bankDetails.bankName],
    ['Account No', invoice.bankDetails.accountNo],
    ['SWIFT Code', invoice.bankDetails.swiftCode],
    ['IFSC Code', invoice.bankDetails.ifscCode],
    ['Branch', invoice.bankDetails.branchAddress],
  ];
  bankFields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY);
    doc.text(label + ':', 16, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(value || '—', 50, y);
    y += 4.5;
  });
  y += 4;

  // ── Declaration ──
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...GRAY);
  const declLines = doc.splitTextToSize(invoice.declaration, 170);
  doc.text(declLines, 16, y);
  y += declLines.length * 3.5 + 6;

  // ── Signature ──
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setDrawColor(...GRAY);
  doc.line(130, y + 10, 192, y + 10);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  doc.text('Authorized Signatory', 161, y + 15, { align: 'center' });
  if (invoice.authorizedSignatory) {
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.authorizedSignatory, 161, y + 7, { align: 'center' });
  }

  // ── Footer on all pages ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.height;
    doc.setDrawColor(...GRAY);
    doc.setLineWidth(0.3);
    doc.line(14, pageH - 12, 196, pageH - 12);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text('ExporTrack AI — Commercial Invoice', 14, pageH - 7);
    doc.text(`Page ${i} of ${totalPages}`, 196, pageH - 7, { align: 'right' });
  }

  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
}
