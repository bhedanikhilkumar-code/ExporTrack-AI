/**
 * Certificate of Origin PDF Generator
 * Generates PDF matching the standard international COO box format (boxes 1-12)
 */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { CertificateOfOrigin } from '../types/certificateOfOrigin';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

const PRIMARY: [number, number, number] = [15, 118, 110];
const DARK: [number, number, number] = [15, 23, 42];
const GRAY: [number, number, number] = [100, 116, 139];

export function generateCOOPdf(coo: CertificateOfOrigin): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const boxX = 14;
  const boxW = 182;
  let y = 10;

  // ── Title ──
  doc.setFillColor(...PRIMARY);
  doc.rect(boxX, y, boxW, 12, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CERTIFICATE OF ORIGIN', 105, y + 8, { align: 'center' });
  y += 14;

  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'italic');
  doc.text(`Type: ${coo.cooType}`, boxX + 3, y + 4);
  doc.text(`No: ${coo.cooNumber}    Date: ${coo.cooDate}`, boxX + boxW - 3, y + 4, { align: 'right' });
  y += 8;

  // Helper: draw a labeled box
  const drawBox = (label: string, content: string[], bx: number, by: number, bw: number, bh: number, boxNum?: string) => {
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(bx, by, bw, bh);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY);
    const labelText = boxNum ? `${boxNum}. ${label}` : label;
    doc.text(labelText, bx + 2, by + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.setFontSize(7.5);
    content.forEach((line, i) => {
      doc.text(line, bx + 2, by + 9 + i * 4);
    });
  };

  // Box 1: Exporter
  drawBox('Exporter / Consignor', [
    coo.exporterDetails.name,
    coo.exporterDetails.address,
    `Country: ${coo.exporterDetails.country}`,
    coo.exporterDetails.iec ? `IEC: ${coo.exporterDetails.iec}` : '',
  ].filter(Boolean), boxX, y, boxW / 2 - 1, 28, '1');

  // Box 2: Consignee
  drawBox('Consignee', [
    coo.consigneeDetails.name,
    coo.consigneeDetails.address,
    `Country: ${coo.consigneeDetails.country}`,
  ], boxX + boxW / 2 + 1, y, boxW / 2 - 1, 28, '2');
  y += 30;

  // Box 3: Means of Transport
  drawBox('Means of Transport and Route', [
    `Transport: ${coo.transportDetails.meansOfTransport || '—'}`,
    `Vessel: ${coo.transportDetails.vessel || '—'}`,
    `Departure: ${coo.transportDetails.departureDate || '—'}`,
  ], boxX, y, boxW / 2 - 1, 22, '3');

  // Box 4: Country of Origin
  drawBox('For Official Use', [
    `Issuing Authority:`,
    coo.issuingAuthority,
  ], boxX + boxW / 2 + 1, y, boxW / 2 - 1, 22, '4');
  y += 24;

  // Box 5: Port details
  drawBox('Port of Loading / Discharge', [
    `Loading: ${coo.transportDetails.portOfLoading || '—'}`,
    `Discharge: ${coo.transportDetails.portOfDischarge || '—'}`,
  ], boxX, y, boxW, 14, '5');
  y += 16;

  // Box 6-9: Items Table
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY);
  doc.text('6-9. GOODS DESCRIPTION', boxX + 2, y + 4);
  y += 2;

  doc.autoTable({
    startY: y + 4,
    head: [['Marks', 'Description of Goods', 'HS Code', 'Quantity', 'Invoice No', 'Origin Criteria']],
    body: coo.items.map(item => [
      item.marks, item.description, item.hsCode, item.quantity, item.invoiceNo, item.originCriteria,
    ]),
    styles: { fontSize: 7, cellPadding: 2, lineColor: [180, 180, 180], lineWidth: 0.3 },
    headStyles: { fillColor: [241, 245, 249], textColor: DARK, fontStyle: 'bold', fontSize: 7 },
    margin: { left: boxX, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 4;

  // Box 10: Declaration
  drawBox('Declaration by the Exporter', [
    ...doc.splitTextToSize(coo.declarationText, boxW - 8),
  ], boxX, y, boxW, 24, '10');
  y += 26;

  // Box 11: Certification
  drawBox('Certification', [
    'It is hereby certified, on the basis of control carried out, that the',
    'declaration by the exporter is correct.',
    '',
    `Issuing Authority: ${coo.issuingAuthority}`,
  ], boxX, y, boxW / 2 - 1, 30, '11');

  // Box 12: Stamp
  drawBox('Official Stamp / Seal', [
    '',
    coo.chamberOfCommerceStamp || '(Stamp area)',
  ], boxX + boxW / 2 + 1, y, boxW / 2 - 1, 30, '12');

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text('ExporTrack AI — Certificate of Origin', 14, pageH - 7);
    doc.text(`Page ${i} of ${totalPages}`, 196, pageH - 7, { align: 'right' });
  }

  doc.save(`COO_${coo.cooNumber}.pdf`);
}
