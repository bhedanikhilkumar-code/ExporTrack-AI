/**
 * Packing List PDF Generator
 */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { PackingList } from '../types/packingList';

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

export function generatePackingListPDF(pl: PackingList): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 210, 8, 'F');

  let y = 14;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('PACKING LIST', 105, y, { align: 'center' });
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`PL No: ${pl.plNumber}`, 14, y);
  doc.text(`Date: ${pl.plDate}`, 196, y, { align: 'right' });
  y += 3;
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 6;

  // Exporter & Buyer
  const boxTop = y;
  doc.setFillColor(...LIGHT_BG);
  doc.rect(14, boxTop, 88, 30, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY);
  doc.text('EXPORTER', 17, boxTop + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  doc.text(pl.exporterDetails.name, 17, boxTop + 11);
  const expAddr = doc.splitTextToSize(pl.exporterDetails.address || '', 82);
  doc.text(expAddr, 17, boxTop + 16);

  doc.setDrawColor(200, 200, 200);
  doc.rect(108, boxTop, 88, 30, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY);
  doc.text('BUYER / CONSIGNEE', 111, boxTop + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  doc.text(pl.buyerDetails.name, 111, boxTop + 11);
  const buyAddr = doc.splitTextToSize(pl.buyerDetails.address || '', 82);
  doc.text(buyAddr, 111, boxTop + 16);
  if (pl.buyerDetails.country) doc.text(`Country: ${pl.buyerDetails.country}`, 111, boxTop + 16 + buyAddr.length * 4);

  y = boxTop + 34;

  // Shipment details
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY);
  doc.text('Port of Loading:', 16, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK); doc.text(pl.shipmentDetails.portOfLoading || '—', 52, y);
  doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY); doc.text('Port of Discharge:', 110, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK); doc.text(pl.shipmentDetails.portOfDischarge || '—', 146, y);
  y += 5;
  if (pl.shipmentDetails.marksAndNumbers) {
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY); doc.text('Marks & Numbers:', 16, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK); doc.text(pl.shipmentDetails.marksAndNumbers, 52, y);
    y += 5;
  }
  y += 3;

  // Package table
  doc.autoTable({
    startY: y,
    head: [['Pkg #', 'Description', 'HS Code', 'Qty', 'Unit', 'Net Wt (kg)', 'Gross Wt (kg)', 'L×W×H', 'CBM']],
    body: [
      ...pl.packages.map(p => [
        p.packageNo, p.description, p.hsCode, p.quantity, p.unit,
        p.netWeight.toFixed(2), p.grossWeight.toFixed(2),
        `${p.dimensions.length}×${p.dimensions.width}×${p.dimensions.height} ${p.dimensions.unit}`,
        p.cbm.toFixed(4),
      ]),
      ['TOTAL', '', '', '', '', pl.totalNetWeight.toFixed(2), pl.totalGrossWeight.toFixed(2), '', pl.totalVolume.toFixed(4)],
    ],
    styles: { fontSize: 7, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
    didParseCell: (data: any) => {
      if (data.row.index === pl.packages.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    },
  });

  y = doc.lastAutoTable.finalY + 8;

  // Totals summary
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(`Total Packages: ${pl.totalPackages}`, 16, y);
  doc.text(`Total Net Weight: ${pl.totalNetWeight.toFixed(2)} kg`, 80, y);
  doc.text(`Total Volume: ${pl.totalVolume.toFixed(4)} CBM`, 150, y);
  y += 12;

  // Signature
  doc.setDrawColor(...GRAY);
  doc.line(130, y + 10, 192, y + 10);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
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
    doc.text('ExporTrack AI — Packing List', 14, pageH - 7);
    doc.text(`Page ${i} of ${totalPages}`, 196, pageH - 7, { align: 'right' });
  }

  doc.save(`PackingList_${pl.plNumber}.pdf`);
}
