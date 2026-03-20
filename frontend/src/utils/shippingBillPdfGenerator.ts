/**
 * Shipping Bill PDF Generator (India ICEGATE format)
 */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { ShippingBill } from '../types/shippingBill';

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

export function generateShippingBillPDF(sb: ShippingBill): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 210, 8, 'F');

  let y = 14;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('SHIPPING BILL (For Export)', 105, y, { align: 'center' });
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('(CUSTOMS ACT, 1962)', 105, y, { align: 'center' });
  y += 6;

  // SB details header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  doc.text(`SB No: ${sb.sbNumber}`, 14, y);
  doc.text(`Date: ${sb.sbDate}`, 105, y, { align: 'center' });
  doc.text(`Port: ${sb.portCode}`, 196, y, { align: 'right' });
  y += 3;
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 6;

  // Details fields
  const fieldRow = (label: string, value: string, x: number, labelW: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(label + ':', x, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(value || '—', x + labelW, y);
  };

  // Exporter section
  doc.setFillColor(...LIGHT_BG);
  doc.rect(14, y, 182, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY);
  doc.text('EXPORTER DETAILS', 16, y + 3.5);
  y += 8;

  fieldRow('Name', sb.exporterDetails.name, 16, 20); fieldRow('IEC', sb.exporterDetails.iec, 110, 14); y += 4;
  fieldRow('GSTIN', sb.exporterDetails.gstin, 16, 20); fieldRow('PAN', sb.exporterDetails.pan, 110, 14); y += 4;
  fieldRow('AD Code', sb.exporterDetails.adCode, 16, 20); y += 4;
  fieldRow('Address', sb.exporterDetails.address, 16, 20); y += 6;

  // Consignee
  doc.setFillColor(...LIGHT_BG);
  doc.rect(14, y, 182, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY);
  doc.text('CONSIGNEE / BUYER', 16, y + 3.5);
  y += 8;
  fieldRow('Name', sb.consigneeDetails.name, 16, 20); fieldRow('Country', sb.consigneeDetails.country, 110, 18); y += 4;
  fieldRow('Address', sb.consigneeDetails.address, 16, 20); y += 6;

  // Shipment Info
  doc.setFillColor(...LIGHT_BG);
  doc.rect(14, y, 182, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY);
  doc.text('SHIPMENT INFORMATION', 16, y + 3.5);
  y += 8;
  fieldRow('Export Scheme', sb.exportScheme, 16, 30); fieldRow('Mode', sb.shipmentDetails.modeOfTransport, 110, 14); y += 4;
  fieldRow('Port of Loading', sb.shipmentDetails.portOfLoading, 16, 30); fieldRow('Destination', sb.shipmentDetails.countryOfDestination, 110, 24); y += 4;
  fieldRow('Vessel', sb.shipmentDetails.vessel, 16, 20); fieldRow('Rotation No', sb.shipmentDetails.rotationNo, 110, 24); y += 4;
  fieldRow('Exchange Rate', `1 ${sb.currency} = ₹${sb.exchangeRate}`, 16, 30); fieldRow('Currency', sb.currency, 110, 18); y += 6;

  // Items table
  doc.autoTable({
    startY: y,
    head: [['Sr', 'Description', 'HS Code', 'Qty', 'Unit', `FOB (${sb.currency})`, 'FOB (INR)']],
    body: [
      ...sb.items.map(item => [
        item.srNo,
        item.description,
        item.hsCode,
        item.quantity,
        item.unit,
        item.fobValueForeign.toFixed(2),
        item.fobValueINR.toFixed(2),
      ]),
      ['', 'TOTAL', '', '', '', sb.totalFOBValueForeign.toFixed(2), sb.totalFOBValueINR.toFixed(2)],
    ],
    styles: { fontSize: 7, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 52 },
      2: { cellWidth: 22 },
      3: { cellWidth: 15, halign: 'right' },
      4: { cellWidth: 12 },
      5: { cellWidth: 28, halign: 'right' },
      6: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data: any) => {
      if (data.row.index === sb.items.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    },
  });

  y = doc.lastAutoTable.finalY + 8;

  // Drawback details if applicable
  if (sb.drawbackDetails && sb.exportScheme === 'Drawback') {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Drawback Details:', 16, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Table Sr No: ${sb.drawbackDetails.dbkTableSrNo} | Rate: ${sb.drawbackDetails.rate}% | Amount: ₹${sb.drawbackDetails.amount.toFixed(2)}`, 16, y);
    y += 8;
  }

  // Signature
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setDrawColor(...GRAY);
  doc.line(130, y + 10, 192, y + 10);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  doc.text('Authorized Signatory', 161, y + 15, { align: 'center' });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.height;
    doc.setDrawColor(...GRAY);
    doc.setLineWidth(0.3);
    doc.line(14, pageH - 12, 196, pageH - 12);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text('ExporTrack AI — Shipping Bill (Indian Customs)', 14, pageH - 7);
    doc.text(`Page ${i} of ${totalPages}`, 196, pageH - 7, { align: 'right' });
  }

  doc.save(`ShippingBill_${sb.sbNumber}.pdf`);
}
