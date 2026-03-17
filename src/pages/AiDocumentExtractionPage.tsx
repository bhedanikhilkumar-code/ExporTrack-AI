import { ChangeEvent, DragEvent, useRef, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import AppIcon from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';

/* ─── Types ──────────────────────────────────────────────────────────── */
type DocType = 'Bill of Lading' | 'Commercial Invoice' | 'Packing List';
type DocStatus = 'Verified' | 'Pending Review' | 'Flagged';
type Stage = 'idle' | 'uploading' | 'scanning' | 'done';

interface ExtractedData {
  invoice_number: string;
  exporter_name: string;
  importer_name: string;
  total_amount: string;
  invoice_date: string;
  product_details: string;
  shipmentId: string;
  destinationCountry: string;
  containerNumber: string;
  documentStatus: DocStatus;
  docType: DocType;
  confidence: number;
  extractedAt: string;
}

/* ─── Mock extractor ─────────────────────────────────────────────────── */
const MOCK_DATA: Record<DocType, ExtractedData> = {
  'Bill of Lading': {
    invoice_number: 'BL-99-XJ-12',
    exporter_name: 'Apex Retail Imports',
    importer_name: 'Global Trade GmbH',
    total_amount: '$42,500.00',
    invoice_date: '2026-03-10',
    product_details: 'Premium Electronics Hub x 40 Units',
    shipmentId: 'EXP-2026-001',
    destinationCountry: 'Germany',
    containerNumber: 'MSCU1234567',
    documentStatus: 'Verified',
    docType: 'Bill of Lading',
    confidence: 97,
    extractedAt: new Date().toISOString(),
  },
  'Commercial Invoice': {
    invoice_number: 'INV-2026-014',
    exporter_name: 'Sunrise Manufacturing Co.',
    importer_name: 'Pacific Rim Traders LLC',
    total_amount: '$12,840.50',
    invoice_date: '2026-03-12',
    product_details: 'Industrial Grade Solar Panels',
    shipmentId: 'SHP-20260312-INV',
    destinationCountry: 'United States',
    containerNumber: 'MSCU4812960-2',
    documentStatus: 'Pending Review',
    docType: 'Commercial Invoice',
    confidence: 91,
    extractedAt: new Date().toISOString(),
  },
  'Packing List': {
    invoice_number: 'PKL-33451',
    exporter_name: 'Delta Logistics (India)',
    importer_name: 'Eurotrade Sprl',
    total_amount: 'N/A',
    invoice_date: '2026-03-11',
    product_details: 'Mixed Textiles - 120 Cartons',
    shipmentId: 'SHP-20260312-PKL',
    destinationCountry: 'Belgium',
    containerNumber: 'HLCU7294013-9',
    documentStatus: 'Flagged',
    docType: 'Packing List',
    confidence: 78,
    extractedAt: new Date().toISOString(),
  },
};

/* ─── Sub-components ─────────────────────────────────────────────────── */
const ConfidenceBar = memo(({ value }: { value: number }) => {
  const isHigh = value >= 90;
  const isMed = value >= 75;
  const colorClass = isHigh ? 'bg-emerald-500' : isMed ? 'bg-amber-500' : 'bg-rose-500';
  const textClass = isHigh ? 'text-emerald-500' : isMed ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`text-xs font-black min-w-[36px] text-right ${textClass}`}>
        {value}%
      </span>
    </div>
  );
});
ConfidenceBar.displayName = 'ConfidenceBar';

const FieldRow = memo(({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="py-4 border-b border-slate-100 dark:border-slate-800/50 group/row hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors px-2 -mx-2 rounded-lg">
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
      {label}
    </span>
    <span className={`text-sm font-bold text-slate-900 dark:text-slate-100 ${mono ? 'font-mono tracking-wider' : ''}`}>
      {value}
    </span>
  </div>
));
FieldRow.displayName = 'FieldRow';

const StatusBadge = memo(({ status }: { status: DocStatus }) => {
  const styles: Record<DocStatus, string> = {
    Verified: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    'Pending Review': 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    Flagged: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400'
  };

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </div>
  );
});
StatusBadge.displayName = 'StatusBadge';

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function AiDocumentExtractionPage() {
  const [docType, setDocType] = useState<DocType>('Bill of Lading');
  const [stage, setStage] = useState<Stage>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runExtraction = (name: string) => {
    setFileName(name);
    setExtracted(null);
    setStage('uploading');

    setTimeout(() => {
      setStage('scanning');
      setTimeout(() => {
        setExtracted(MOCK_DATA[docType]);
        setStage('done');
      }, 2200);
    }, 1100);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runExtraction(file.name);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) runExtraction(file.name);
  };

  const navigate = useNavigate();
  const { state: { shipments } } = useAppContext();

  const handleCommit = () => {
    if (!extracted) return;
    
    // Redirect to create shipment with extracted data as state
    navigate('/shipments/create', { 
      state: { 
        prefill: {
          clientName: extracted.importer_name,
          destinationCountry: extracted.destinationCountry,
          containerNumber: extracted.containerNumber,
          // We can pack more data into state if needed
        },
        message: `Extracted data from ${fileName} has been pre-filled.`
      } 
    });
  };

  const reset = () => {
    setStage('idle');
    setFileName(null);
    setExtracted(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main className="page-stack animate-in fade-in duration-500">
      <PageHeader
        title="AI Document Extraction"
        subtitle="Upload a logistics document for instant AI-powered field extraction and verification."
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start stagger-in">
        {/* ── Upload Panel ── */}
        <div className="space-y-6">
          <section className="card-premium relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-slate-900 text-white shadow-xl">
                <AppIcon name="upload" className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Upload Manifest</h2>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Intelligent OCR Capture</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-3">Document Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Bill of Lading', 'Commercial Invoice', 'Packing List'] as DocType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setDocType(type)}
                      disabled={stage === 'uploading' || stage === 'scanning'}
                      className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        docType === type
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/40 shadow-lg'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                      }`}
                    >
                      {type.split(' ').map(w => w[0]).join('')} <span className="hidden sm:inline-block ml-1">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/10'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30 hover:border-teal-400'
                }`}
              >
                {stage === 'scanning' && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(20,184,166,0.6)]" />
                )}
                
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 flex items-center justify-center shadow-inner">
                    <AppIcon name="file" className="h-8 w-8" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {isDragOver ? 'Release to upload' : 'Drop your document here'}
                    </p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
                      or <span className="text-teal-600">click to browse</span>
                    </p>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/png,image/jpeg" onChange={handleFileChange} />
              </div>

              {stage !== 'idle' && (
                <div className={`flex items-center gap-4 p-4 rounded-2xl border animate-in slide-in-from-top-2 duration-300 ${
                  stage === 'done' ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50' : 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                }`}>
                  <div className="relative">
                    {stage === 'done' ? (
                      <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                        <AppIcon name="check" className="h-4 w-4" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-lg border-2 border-slate-200 border-t-teal-500 animate-spin" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      {stage === 'uploading' && 'Uploading Source...'}
                      {stage === 'scanning' && 'Neural OCR Extraction...'}
                      {stage === 'done' && 'Extraction Verified'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">{fileName}</p>
                  </div>
                  {stage === 'done' && (
                    <button onClick={reset} className="text-[10px] font-black text-teal-600 hover:text-teal-500 uppercase tracking-widest">Reset</button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Guidelines */}
          <section className="card-premium">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Extraction Engine Workflow</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { step: '01', title: 'Upload', desc: 'Secure document ingress', icon: 'upload' },
                { step: '02', title: 'Neural L1', desc: 'OCR Layout Analysis', icon: 'ai-extract' },
                { step: '03', title: 'Data L2', desc: 'Semantic Field Mapping', icon: 'file' },
                { step: '04', title: 'Verify', desc: 'Compliance Validation', icon: 'shield' },
              ].map(item => (
                <div key={item.step} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group hover:border-teal-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-teal-600 border border-teal-500/20 px-1.5 py-0.5 rounded-lg">{item.step}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{item.title}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Result Panel ── */}
        <div className="space-y-6">
          {!extracted && stage !== 'scanning' && (
            <div className="card-premium h-full min-h-[460px] flex flex-col items-center justify-center opacity-40 group hover:opacity-100 transition-opacity">
               <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-800 mb-6 group-hover:scale-110 transition-transform">
                 <AppIcon name="ai-extract" className="h-10 w-10" />
               </div>
               <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-center max-w-[200px] leading-relaxed">
                  Initiate upload to populate neural fields
               </p>
            </div>
          )}

          {stage === 'scanning' && (
            <div className="card-premium h-full min-h-[460px] space-y-8 animate-pulse">
               <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-teal-500" />
                  <span className="text-xs font-black text-teal-600 uppercase tracking-widest">Scanning Document Structures...</span>
               </div>
               <div className="space-y-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="h-4 w-full bg-slate-50 dark:bg-slate-900 rounded" />
                    </div>
                  ))}
               </div>
            </div>
          )}

          {extracted && stage === 'done' && (
            <article className="card-premium p-0 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 shadow-2xl">
              <header className="bg-slate-900 dark:bg-black p-6 pb-20 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-indigo-600 opacity-20" />
                <div className="absolute right-0 top-0 p-8">
                   <div className="relative">
                      <div className="absolute inset-0 bg-teal-400/20 blur-2xl rounded-full" />
                      <AppIcon name="ai-extract" className="h-24 w-24 text-teal-400/10 relative" strokeWidth={1} />
                   </div>
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <AppIcon name="ai-extract" className="h-6 w-6 text-teal-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Neural Sync</p>
                      <h3 className="text-xl font-black text-white">{extracted.docType}</h3>
                    </div>
                  </div>
                  <StatusBadge status={extracted.documentStatus} />
                </div>
              </header>

              <div className="p-6 pt-0 relative -mt-12 group/content">
                <div className="card-premium border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Engine Confidence</span>
                    <span className="text-[10px] font-bold text-slate-500">v4.2 Analysis</span>
                  </div>
                  <ConfidenceBar value={extracted.confidence} />
                </div>

                <div className="space-y-1">
                  <FieldRow label="Invoice / Reference" value={extracted.invoice_number} mono />
                  <FieldRow label="Exporter" value={extracted.exporter_name} />
                  <FieldRow label="Importer" value={extracted.importer_name} />
                  <FieldRow label="Amount" value={extracted.total_amount} />
                  <FieldRow label="Date" value={extracted.invoice_date} />
                  <FieldRow label="Product Details" value={extracted.product_details} />
                </div>

                <footer className="mt-8 flex gap-3">
                  <button onClick={handleCommit} className="btn-primary flex-1 py-4 justify-center shadow-lg shadow-teal-500/20">
                     Commit to Pipeline
                  </button>
                  <button onClick={reset} className="btn-secondary px-6 py-4">
                     Back
                  </button>
                </footer>
              </div>
            </article>
          )}
        </div>
      </div>
    </main>
  );
}
