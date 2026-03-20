/**
 * Document utility functions
 * - Number sequencing (INV-2526-0001, PL-2526-0001, etc.)
 * - Number to words conversion
 * - Document status helpers
 * - Linked documents helpers
 */

export type DocumentStatus = 'Draft' | 'Final' | 'Cancelled';

export interface LinkedDocument {
  id: string;
  type: 'invoice' | 'packing-list' | 'coo' | 'shipping-bill';
  number: string;
}

/**
 * Generate document number based on financial year and sequence
 * Format: PREFIX-YYMM-NNNN (e.g., INV-2526-0001)
 */
export function generateDocumentNumber(
  prefix: string,
  existingNumbers: string[]
): string {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();
  
  // Indian financial year: April to March
  // FY 2025-26 → "2526"
  const fyStart = month >= 3 ? year : year - 1;
  const fyEnd = fyStart + 1;
  const fyCode = `${String(fyStart).slice(-2)}${String(fyEnd).slice(-2)}`;

  // Find the highest sequence number for this FY
  const fyPrefix = `${prefix}-${fyCode}-`;
  let maxSeq = 0;
  existingNumbers.forEach(num => {
    if (num.startsWith(fyPrefix)) {
      const seqStr = num.replace(fyPrefix, '');
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  });

  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `${fyPrefix}${nextSeq}`;
}

/**
 * Convert number to words (for invoice totals)
 * Supports up to 99,99,99,999 (Indian numbering)
 */
export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + numberToWords(-num);

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertBelowThousand(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertBelowThousand(n % 100) : '');
  }

  const intPart = Math.floor(num);
  const decimalPart = Math.round((num - intPart) * 100);

  let result = '';

  if (intPart >= 10000000) {
    result += convertBelowThousand(Math.floor(intPart / 10000000)) + ' Crore ';
  }
  if (intPart >= 100000) {
    result += convertBelowThousand(Math.floor((intPart % 10000000) / 100000)) + ' Lakh ';
  }
  if (intPart >= 1000) {
    result += convertBelowThousand(Math.floor((intPart % 100000) / 1000)) + ' Thousand ';
  }
  result += convertBelowThousand(intPart % 1000);

  result = result.trim();
  if (!result) result = 'Zero';

  if (decimalPart > 0) {
    result += ' and ' + convertBelowThousand(decimalPart) + ' Paise';
  }

  return result + ' Only';
}

/**
 * Get status badge color classes
 */
export function getDocumentStatusClasses(status: DocumentStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Draft':
      return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' };
    case 'Final':
      return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
    case 'Cancelled':
      return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' };
    default:
      return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' };
  }
}

/**
 * Format currency with proper locale
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const currencyMap: Record<string, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    INR: 'en-IN',
    AED: 'ar-AE',
    JPY: 'ja-JP',
  };
  const locale = currencyMap[currency] || 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

/**
 * Get current Indian financial year string
 */
export function getCurrentFY(): string {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const fyStart = month >= 3 ? year : year - 1;
  return `${fyStart}-${String(fyStart + 1).slice(-2)}`;
}
