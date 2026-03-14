import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import AppIcon from '../components/AppIcon';

/* ─── Types ──────────────────────────────────────────────────────────── */
type Stage = 'idle' | 'uploading' | 'scanning' | 'done';

interface OcrField {
  label: string;
  key: string;
  value: string;
  confidence: number;
}

interface OcrResult {
  fields: OcrField[];
  documentType: string;
  overallConfidence: number;
  processedAt: string;
  pageCount: number;
}

/* ─── Mock OCR results ───────────────────────────────────────────────── */
const MOCK_OCR_RESULTS: Record<string, OcrResult> = {
  invoice: {
    documentType: 'Commercial Invoice',
    overallConfidence: 96,
    processedAt: new Date().toISOString(),
    pageCount: 2,
    fields: [
      { label: 'Invoice Number', key: 'invoice_number', value: 'INV-2026-EX-4821', confidence: 99 },
      { label: 'Exporter Name', key: 'exporter_name', value: 'Bheda Exports Pvt. Ltd.', confidence: 97 },
      { label: 'Importer Name', key: 'importer_name', value: 'Global Trade GmbH', confidence: 95 },
      { label: 'Total Amount', key: 'total_amount', value: 'USD 128,450.00', confidence: 98 },
      { label: 'Invoice Date', key: 'invoice_date', value: '2026-03-10', confidence: 99 },
      { label: 'Product Details', key: 'product_details', value: 'Automotive spare parts — 450 units (Grade A)', confidence: 88 },
      { label: 'Payment Terms', key: 'payment_terms', value: 'Net 30 Days', confidence: 94 },
      { label: 'Ship To', key: 'ship_to', value: 'Hamburg Port, Germany', confidence: 96 },
    ],
  },
  packing_list: {
    documentType: 'Packing List',
    overallConfidence: 93,
    processedAt: new Date().toISOString(),
    pageCount: 3,
    fields: [
      { label: 'Invoice Number', key: 'invoice_number', value: 'PL-2026-8834', confidence: 97 },
      { label: 'Exporter Name', key: 'exporter_name', value: 'Sunrise Manufacturing Co.', confidence: 96 },
      { label: 'Importer Name', key: 'importer_name', value: 'Pacific Rim Traders LLC', confidence: 94 },
      { label: 'Total Amount', key: 'total_amount', value: 'USD 87,900.00', confidence: 91 },
      { label: 'Invoice Date', key: 'invoice_date', value: '2026-02-28', confidence: 98 },
      { label: 'Product Details', key: 'product_details', value: 'Electronic components — 1200 pcs, Net Wt: 340kg', confidence: 85 },
      { label: 'Container No.', key: 'container_number', value: 'TCKU3142857-6', confidence: 99 },
      { label: 'Gross Weight', key: 'gross_weight', value: '2,450 KG', confidence: 92 },
    ],
  },
  bill_of_lading: {
    documentType: 'Bill of Lading',
    overallConfidence: 91,
    processedAt: new Date().toISOString(),
    pageCount: 1,
    fields: [
      { label: 'Invoice Number', key: 'invoice_number', value: 'BL-MSCU-2026-773', confidence: 98 },
      { label: 'Exporter Name', key: 'exporter_name', value: 'Delta Logistics (India)', confidence: 93 },
      { label: 'Importer Name', key: 'importer_name', value: 'Eurotrade Sprl', confidence: 90 },
      { label: 'Total Amount', key: 'total_amount', value: 'USD 214,380.00', confidence: 87 },
      { label: 'Invoice Date', key: 'invoice_date', value: '2026-03-05', confidence: 97 },
      { label: 'Product Details', key: 'product_details', value: 'Industrial machinery, CNC parts — 15 crates', confidence: 82 },
      { label: 'Vessel Name', key: 'vessel_name', value: 'MSC AURORA', confidence: 95 },
      { label: 'Port of Loading', key: 'port_of_loading', value: 'Nhava Sheva, India', confidence: 96 },
    ],
  },
};

/* ─── Helpers ────────────────────────────────────────────────────────── */
function confidenceColor(v: number) {
  if (v >= 95) return { bar: '#10b981', text: '#065f46', bg: '#ecfdf5' };
  if (v >= 85) return { bar: '#14b8a6', text: '#115e59', bg: '#f0fdfa' };
  if (v >= 75) return { bar: '#f59e0b', text: '#78350f', bg: '#fffbeb' };
  return { bar: '#ef4444', text: '#7f1d1d', bg: '#fef2f2' };
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function DocumentOcrPage() {
  const [docCategory, setDocCategory] = useState<string>('invoice');
  const [stage, setStage] = useState<Stage>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const runOcr = (name: string) => {
    setFileName(name);
    setResult(null);
    setStage('uploading');
    setTimeout(() => {
      setStage('scanning');
      setTimeout(() => {
        setResult({ ...MOCK_OCR_RESULTS[docCategory], processedAt: new Date().toISOString() });
        setStage('done');
      }, 2400);
    }, 1200);
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) runOcr(f.name);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) runOcr(f.name);
  };

  const reset = () => {
    setStage('idle');
    setFileName(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const copyToClipboard = (key: string, value: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const exportAsJson = () => {
    if (!result) return;
    const data = Object.fromEntries(result.fields.map(f => [f.key, f.value]));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-extracted-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        @keyframes ocr-scan {
          0%   { top: 0; opacity: 0.9; }
          50%  { opacity: 0.5; }
          100% { top: calc(100% - 2px); opacity: 0.9; }
        }
        @keyframes ocr-fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ocr-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .ocr-animate { animation: ocr-fade-in 0.5s cubic-bezier(.4,0,.2,1) both; }
        .ocr-shimmer {
          background: linear-gradient(90deg, #e2e8f0 25%, #f8fafc 50%, #e2e8f0 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite linear;
          border-radius: 6px;
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>

      <main className="page-stack px-4 md:px-6">
        {/* Header */}
        <header className="dashboard-grid-header">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>
              Document AI — OCR Processing
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              Upload logistics documents to automatically extract key fields using AI-powered OCR
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* ── Upload Panel ── */}
          <div className="space-y-6">
            <article className="card-premium">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-slate-800 text-white shadow-md">
                  <AppIcon name="upload" className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Upload Document</h2>
                  <p className="text-[11px] text-slate-500">PDF, JPG, PNG supported</p>
                </div>
              </div>

              {/* Doc type */}
              <div className="mb-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Document Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'invoice', label: 'Invoice' },
                    { key: 'packing_list', label: 'Packing List' },
                    { key: 'bill_of_lading', label: 'Bill of Lading' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setDocCategory(opt.key)}
                      disabled={stage === 'uploading' || stage === 'scanning'}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        docCategory === opt.key
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/40 shadow-md'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all overflow-hidden ${
                  isDragOver
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/10'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30 hover:border-teal-400'
                }`}
              >
                {stage === 'scanning' && (
                  <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500 to-transparent" style={{ animation: 'ocr-scan 1.4s ease-in-out infinite' }} />
                )}
                <div className="flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500/10 to-slate-200/50 dark:from-teal-500/20 dark:to-slate-800/50 flex items-center justify-center">
                    <AppIcon name="file" className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {isDragOver ? 'Release to upload' : 'Drop your document here'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      or <span className="text-teal-600 font-semibold dark:text-teal-400">click to browse</span>
                    </p>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept=".pdf,image/png,image/jpeg" onChange={handleFile} className="hidden" />
              </div>

              {/* Status */}
              {stage !== 'idle' && (
                <div className={`mt-4 flex items-center gap-3 rounded-xl px-4 py-3 border ${
                  stage === 'done'
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/50'
                    : 'bg-teal-50/50 border-teal-200/50 dark:bg-teal-900/10 dark:border-teal-800/30'
                }`}>
                  {stage !== 'done' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth={2} strokeLinecap="round" className="h-5 w-5 shrink-0" style={{ animation: 'ocr-spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : (
                    <AppIcon name="check" className="h-5 w-5 text-emerald-600 shrink-0" strokeWidth={2.5} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${stage === 'done' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {stage === 'uploading' && 'Uploading document…'}
                      {stage === 'scanning' && 'Running AI OCR extraction…'}
                      {stage === 'done' && 'OCR extraction complete!'}
                    </p>
                    {fileName && <p className="text-[10px] text-slate-500 truncate mt-0.5">{fileName}</p>}
                  </div>
                  {stage === 'done' && (
                    <button onClick={e => { e.stopPropagation(); reset(); }} className="text-[10px] font-bold text-teal-600 hover:text-teal-500">Reset</button>
                  )}
                </div>
              )}

              {/* Shimmer */}
              {stage === 'scanning' && (
                <div className="mt-4 space-y-3">
                  {[70, 50, 80, 45, 65].map((w, i) => (
                    <div key={i} className="ocr-shimmer h-3" style={{ width: `${w}%` }} />
                  ))}
                </div>
              )}
            </article>

            {/* Document Preview Placeholder */}
            <article className="card-premium">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shadow-sm">
                  <AppIcon name="file" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Document Preview</h3>
                  <p className="text-[11px] text-slate-500">{fileName || 'No document uploaded'}</p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 h-64 flex items-center justify-center">
                {fileName ? (
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500/10 to-indigo-500/10 flex items-center justify-center mb-4">
                      <AppIcon name="file" className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{fileName}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {result ? `${result.pageCount} page(s) • ${result.documentType}` : 'Processing…'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center opacity-50">
                    <AppIcon name="file" className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                    <p className="text-xs text-slate-400">Upload a document to preview</p>
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* ── Extracted Fields Panel ── */}
          <div>
            {!result && stage !== 'scanning' && (
              <article className="card-premium h-full min-h-[500px] flex flex-col items-center justify-center gap-4 opacity-60">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500/10 to-indigo-500/10 flex items-center justify-center">
                  <AppIcon name="ai-extract" className="h-8 w-8 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-500">No Extracted Data</p>
                  <p className="text-xs text-slate-400 mt-1">Upload a document to see AI-extracted fields here</p>
                </div>
              </article>
            )}

            {stage === 'scanning' && (
              <article className="card-premium">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-3 w-3 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400">AI processing document…</span>
                </div>
                <div className="space-y-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="ocr-shimmer h-2.5" style={{ width: '35%' }} />
                      <div className="ocr-shimmer h-4" style={{ width: `${55 + i * 5}%` }} />
                    </div>
                  ))}
                </div>
              </article>
            )}

            {result && stage === 'done' && (
              <article className="card-premium ocr-animate">
                {/* Header Strip */}
                <div className="-mx-6 -mt-6 px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-800 rounded-t-2xl flex items-center justify-between flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                      <AppIcon name="ai-extract" className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">AI Extracted Data</p>
                      <p className="text-sm font-bold text-white">{result.documentType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-bold text-emerald-300">{result.overallConfidence}% Confidence</span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 mb-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>{result.pageCount} Page{result.pageCount > 1 ? 's' : ''} Processed</span>
                  <span>•</span>
                  <span>{result.fields.length} Fields Extracted</span>
                  <span>•</span>
                  <span>{new Date(result.processedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Field List */}
                <div className="space-y-1">
                  {result.fields.map((field, idx) => {
                    const cc = confidenceColor(field.confidence);
                    return (
                      <div
                        key={field.key}
                        className="ocr-animate group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{field.label}</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white break-words">{field.value}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: cc.bg }}>
                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cc.bar }} />
                            <span className="text-[10px] font-bold" style={{ color: cc.text }}>{field.confidence}%</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(field.key, field.value)}
                            className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-500/50 transition-all opacity-0 group-hover:opacity-100"
                            title="Copy value"
                          >
                            {copiedKey === field.key ? (
                              <AppIcon name="check" className="h-3 w-3 text-emerald-500" strokeWidth={3} />
                            ) : (
                              <AppIcon name="file" className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                  <button onClick={exportAsJson} className="btn-primary flex-1 justify-center">
                    <AppIcon name="share" className="h-4 w-4 mr-2" />
                    Export JSON
                  </button>
                  <button
                    onClick={() => {
                      alert('Fields have been auto-populated to the shipment form!');
                    }}
                    className="btn-secondary flex-1 justify-center"
                  >
                    <AppIcon name="create" className="h-4 w-4 mr-2" />
                    Auto-Fill Shipment
                  </button>
                  <button onClick={reset} className="btn-secondary px-4">
                    Reset
                  </button>
                </div>
              </article>
            )}
          </div>
        </div>

        {/* ── How It Works ── */}
        <article className="card-premium">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">How Document AI OCR Works</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Upload', desc: 'Drop invoice, packing list, or bill of lading', icon: 'upload' as const },
              { step: '02', title: 'OCR Scan', desc: 'AI reads all text regions with deep learning', icon: 'ai-extract' as const },
              { step: '03', title: 'Field Extraction', desc: 'Key-value pairs mapped automatically', icon: 'file' as const },
              { step: '04', title: 'Auto-Populate', desc: 'Fill shipment forms with one click', icon: 'check' as const },
            ].map(s => (
              <div key={s.step} className="rounded-xl bg-gradient-to-br from-teal-500/5 to-slate-100/50 dark:from-teal-500/10 dark:to-slate-800/30 border border-teal-500/10 dark:border-teal-500/20 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center">
                    <AppIcon name={s.icon} className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Step {s.step}</span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.title}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}
