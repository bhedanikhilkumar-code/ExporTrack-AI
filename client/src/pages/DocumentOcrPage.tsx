import { ChangeEvent, DragEvent, useRef, useState, memo } from 'react';
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
const ConfidenceIndicator = memo(({ value }: { value: number }) => {
  const isHigh = value >= 95;
  const isMed = value >= 85;
  const isLow = value >= 75;
  
  const colorClass = isHigh ? 'text-emerald-500 bg-emerald-500/10' : isMed ? 'text-teal-500 bg-teal-500/10' : isLow ? 'text-amber-500 bg-amber-500/10' : 'text-rose-500 bg-rose-500/10';

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black ${colorClass}`}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {value}%
    </div>
  );
});
ConfidenceIndicator.displayName = 'ConfidenceIndicator';

/* ─── Main Page ──────────────────────────────────────────────────────── */
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
    <main className="page-stack animate-in fade-in duration-500">
      <header className="dashboard-grid-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.04em' }}>
            Document AI <span className="text-teal-500 font-medium">OCR</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Enterprise-grade OCR for global logistics documentation.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-3 py-1.5 rounded-xl border border-teal-500/20 bg-teal-500/5 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">Secure Processing</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* ── Left Column: Controls ── */}
        <div className="space-y-6">
          <section className="card-premium group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-teal-500/10 dark:text-teal-400 shadow-lg">
                <AppIcon name="upload" className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Source Ingest</h2>
                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Multi-Format Compatible</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-4">Document Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'invoice', label: 'Invoice' },
                    { key: 'packing_list', label: 'Packing' },
                    { key: 'bill_of_lading', label: 'B/L' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setDocCategory(opt.key)}
                      disabled={stage === 'uploading' || stage === 'scanning'}
                      className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        docCategory === opt.key
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/40 shadow-xl'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/10'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30 hover:border-teal-400'
                }`}
              >
                {stage === 'scanning' && (
                  <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
                )}
                
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 flex items-center justify-center shadow-inner">
                    <AppIcon name="file" className="h-8 w-8" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {isDragOver ? 'Release to upload' : 'Ingest Document'}
                    </p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
                       PDF • JPG • PNG
                    </p>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept=".pdf,image/png,image/jpeg" onChange={handleFile} className="hidden" />
              </div>

              {stage !== 'idle' && (
                <div className={`flex items-center gap-4 p-4 rounded-2xl border animate-in slide-in-from-top-2 duration-300 ${
                  stage === 'done' ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50' : 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                }`}>
                  <div className="relative">
                    {stage === 'done' ? (
                      <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <AppIcon name="check" className="h-4.5 w-4.5" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="h-9 w-9 rounded-xl border-2 border-slate-200 border-t-teal-500 animate-spin" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      {stage === 'uploading' && 'Stream Ingress...'}
                      {stage === 'scanning' && 'AI OCR Mapping...'}
                      {stage === 'done' && 'OCR Extraction Verified'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5 uppercase tracking-tighter">{fileName}</p>
                  </div>
                  {stage === 'done' && (
                    <button onClick={reset} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
                       <AppIcon name="x" className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          <article className="card-premium">
             <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400">
                  <AppIcon name="file" className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Source Preview</h3>
             </div>
             <div className="aspect-[4/3] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-8 text-center">
                {!fileName ? (
                  <div className="opacity-30">
                     <AppIcon name="file" className="h-16 w-16 mx-auto mb-4" strokeWidth={1} />
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Document Data Stream</p>
                  </div>
                ) : (
                  <div className="space-y-4 w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                     <div className="relative group/preview">
                        <div className="absolute inset-x-0 h-1 bg-teal-500/20 rounded-full blur-xl group-hover:bg-teal-500/40 transition-all" />
                        <AppIcon name="file" className="h-24 w-24 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white break-all max-w-[200px]">{fileName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                           {result ? `${result.pageCount} Pages • Processed` : 'Neural Processing...'}
                        </p>
                     </div>
                  </div>
                )}
             </div>
          </article>
        </div>

        {/* ── Right Column: Results ── */}
        <div className="space-y-6">
          {!result && stage !== 'scanning' && (
            <div className="card-premium h-full min-h-[560px] flex flex-col items-center justify-center opacity-40 group hover:opacity-100 transition-opacity">
               <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-800 mb-6 group-hover:scale-110 transition-transform shadow-inner">
                 <AppIcon name="ai-extract" className="h-10 w-10" />
               </div>
               <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-center max-w-[220px] leading-relaxed">
                  Data extraction pipeline is idle. Awaiting document stream.
               </p>
            </div>
          )}

          {stage === 'scanning' && (
            <article className="card-premium h-full min-h-[560px] space-y-8 animate-pulse">
               <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-teal-500" />
                  <span className="text-xs font-black text-teal-600 uppercase tracking-widest">Neural Mapping Engine Active...</span>
               </div>
               <div className="space-y-6 px-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="h-4 w-full bg-slate-50 dark:bg-slate-900 rounded" />
                    </div>
                  ))}
               </div>
            </article>
          )}

          {result && stage === 'done' && (
            <article className="card-premium p-0 border-none bg-slate-100 dark:bg-slate-950/20 animate-in fade-in slide-in-from-right-4 duration-500 shadow-2xl overflow-hidden relative group">
               {/* Decorative background glow */}
               <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full group-hover:bg-teal-500/20 transition-all duration-1000" />
               
               <header className="p-6 bg-white dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30">
                        <AppIcon name="ai-extract" className="h-5 w-5" strokeWidth={2.5} />
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">{result.documentType}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">v4.2 Analysis Engine</p>
                     </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest leading-none mb-1">Confidence</span>
                     <div className="px-3 py-1.5 rounded-xl bg-teal-500 text-white text-sm font-black shadow-lg shadow-teal-500/20">
                        {result.overallConfidence}%
                     </div>
                  </div>
               </header>

               <div className="p-6 max-h-[480px] overflow-y-auto relative z-10 custom-scrollbar">
                  <div className="grid grid-cols-1 gap-1">
                     {result.fields.map((field, idx) => (
                       <div 
                         key={field.key} 
                         className="group/field py-3 px-4 rounded-xl hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/20 animate-in fade-in slide-in-from-bottom-2"
                         style={{ animationDelay: `${idx * 50}ms` }}
                       >
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover/field:text-teal-500 transition-colors">{field.label}</span>
                                <ConfidenceIndicator value={field.confidence} />
                             </div>
                             <button
                               onClick={() => copyToClipboard(field.key, field.value)}
                               className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-500/50 transition-all opacity-0 group-hover/field:opacity-100"
                             >
                               {copiedKey === field.key ? (
                                 <AppIcon name="check" className="h-3 w-3 text-emerald-500" strokeWidth={3} />
                               ) : (
                                 <AppIcon name="file" className="h-3 w-3" />
                               )}
                             </button>
                          </div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words group-hover/field:text-slate-900 dark:group-hover/field:text-white transition-colors">
                            {field.value}
                          </p>
                       </div>
                     ))}
                  </div>
               </div>

               <footer className="p-6 bg-white dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800/60 flex gap-4 relative z-10">
                  <button onClick={exportAsJson} className="btn-primary flex-1 h-14 justify-center shadow-lg shadow-teal-500/20">
                     <AppIcon name="share" className="h-5 w-5 mr-3" />
                     Ingest Pipeline
                  </button>
                  <button onClick={() => alert('Form synced!')} className="btn-secondary h-14 flex-1 justify-center">
                     <AppIcon name="create" className="h-5 w-5 mr-3" />
                     Auto-Fill
                  </button>
                  <button onClick={reset} className="h-14 w-14 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                       <AppIcon name="x" className="h-5 w-5" />
                  </button>
               </footer>
            </article>
          )}
        </div>
      </div>

      <section className="card-premium">
         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 px-2">Compliance Network Nodes</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { id: 'ocr-1', label: 'Layout Scan', status: 'Optimal' },
              { id: 'ocr-2', label: 'Vision Synthesis', status: 'Active' },
              { id: 'ocr-3', label: 'Semantic Hash', status: 'Verified' },
              { id: 'ocr-4', label: 'Logic Ingest', status: 'Ready' },
            ].map(node => (
              <div key={node.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 flex flex-col gap-3">
                 <div className="flex items-center justify-between">
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{node.id}</span>
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-800 dark:text-white">{node.label}</p>
                    <p className="text-[10px] font-bold text-teal-600 mt-1 uppercase tracking-widest">{node.status}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>
    </main>
  );
}
