import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import PageHeader from '../components/PageHeader';
import AppIcon from '../components/AppIcon';

type ValidationStatus = 'Passed' | 'Warning' | 'Failed';

interface ValidationError {
  id: string;
  field: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

interface ValidationReport {
  status: ValidationStatus;
  score: number;
  errors: ValidationError[];
  suggestions: string[];
  docType: string;
  fileName: string;
  timestamp: string;
}

const MOCK_REPORT: ValidationReport = {
  status: 'Warning',
  score: 72,
  docType: 'Commercial Invoice',
  fileName: 'INV_2026_993.pdf',
  timestamp: new Date().toISOString(),
  errors: [
    { id: '1', field: 'Tax ID', message: 'Exporter Tax ID placeholder found (000-000-000).', severity: 'high' },
    { id: '2', field: 'Due Date', message: 'Due date is in the past (2025-12-01).', severity: 'medium' },
    { id: '3', field: 'Currency', message: 'Currency code missing, assumed USD from context.', severity: 'low' },
  ],
  suggestions: [
    'Update the Exporter Tax ID with a valid registered number.',
    'Verify the payment terms and adjust the Due Date to a future date.',
    'Explicitly state the currency (e.g., USD, EUR) to avoid processing delays.',
    'Check if the signature field requires a digital timestamp.'
  ]
};

export default function AiDocumentValidatorPage() {
  const [stage, setStage] = useState<'idle' | 'uploading' | 'analyzing' | 'done'>('idle');
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (name: string) => {
    setStage('uploading');
    setTimeout(() => {
      setStage('analyzing');
      setTimeout(() => {
        setReport({ ...MOCK_REPORT, fileName: name, timestamp: new Date().toISOString() });
        setStage('done');
      }, 2500);
    }, 1200);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0].name);
    }
  };

  const onDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0].name);
    }
  };

  const reset = () => {
    setStage('idle');
    setReport(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="page-stack">
      <style>{`
        @keyframes ring-draw {
          from { stroke-dashoffset: 251.2; }
          to { stroke-dashoffset: ${251.2 - (251.2 * (report?.score || 0)) / 100}; }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-draw { animation: ring-draw 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-report { animation: slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .bg-glass { backdrop-filter: blur(12px); background: rgba(255, 255, 255, 0.7); }
        .dark .bg-glass { background: rgba(15, 23, 42, 0.7); }
      `}</style>

      <PageHeader
        title="AI Document Validator"
        subtitle="Validate logistics documents against global compliance standards using neural analysis."
      />

      {stage === 'idle' && (
        <section 
          className={`card-panel group relative flex min-h-[400px] cursor-pointer flex-col items-center justify-center border-2 border-dashed transition-all ${
            dragActive ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20' : 'border-slate-300 hover:border-slate-400 dark:border-slate-700'
          }`}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-colors group-hover:bg-teal-100 group-hover:text-teal-600 dark:bg-slate-800 dark:group-hover:bg-teal-900/30">
            <AppIcon name="upload" className="h-10 w-10" />
          </div>
          <h3 className="mt-6 text-xl font-bold text-navy-800 dark:text-white">Drop document to validate</h3>
          <p className="mt-2 text-center text-slate-500 dark:text-slate-400">
            AI will scan for compliance errors, missing data, and <br /> verify against international trade regulations.
          </p>
          <div className="mt-8 flex gap-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span className="rounded-lg border border-slate-200 px-3 py-1 dark:border-slate-700">PDF</span>
            <span className="rounded-lg border border-slate-200 px-3 py-1 dark:border-slate-700">JPG</span>
            <span className="rounded-lg border border-slate-200 px-3 py-1 dark:border-slate-700">PNG</span>
          </div>
          <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".pdf,image/*" />
        </section>
      )}

      {(stage === 'uploading' || stage === 'analyzing') && (
        <section className="card-panel flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600 dark:border-slate-800 dark:border-t-teal-400"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AppIcon name="ai-extract" className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <h3 className="mt-8 text-2xl font-bold text-navy-800 dark:text-white">
            {stage === 'uploading' ? 'Uploading Document...' : 'Neural Analysis in Progress...'}
          </h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Cross-referencing extracted data with over 450+ regulatory rules.
          </p>
          <div className="mt-10 h-1.5 w-64 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full bg-teal-600 dark:bg-teal-400 transition-all duration-1000 ${stage === 'analyzing' ? 'w-3/4' : 'w-1/4'}`}></div>
          </div>
        </section>
      )}

      {stage === 'done' && report && (
        <div className="grid gap-6 lg:grid-cols-3 animate-report stagger-in">
          {/* Main Report Column */}
          <div className="lg:col-span-2 space-y-6">
            <section className="card-panel overflow-hidden border-none bg-gradient-to-br from-navy-800 to-navy-950 p-0 text-white dark:from-slate-900 dark:to-navy-950 shadow-2xl">
              <div className="flex flex-col md:flex-row">
                {/* Score Section */}
                <div className="flex flex-col items-center justify-center bg-white/5 p-8 md:w-64">
                   <div className="relative h-32 w-32">
                     <svg className="h-full w-full" viewBox="0 0 100 100">
                       <circle className="stroke-white/10" cx="50" cy="50" r="40" strokeWidth="8" fill="transparent" />
                       <circle 
                         className="animate-draw stroke-teal-400" 
                         cx="50" cy="50" r="40" strokeWidth="8" fill="transparent" 
                         strokeDasharray="251.2" 
                         strokeDashoffset="251.2"
                         strokeLinecap="round"
                         transform="rotate(-90 50 50)"
                       />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-black">{report.score}</span>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Score</span>
                     </div>
                   </div>
                   <div className="mt-4 text-center">
                     <div className={`rounded-full px-4 py-1 text-xs font-bold uppercase tracking-tighter ${
                       report.status === 'Passed' ? 'bg-emerald-500/20 text-emerald-400' : 
                       report.status === 'Warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                     }`}>
                       {report.status} Result
                     </div>
                   </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="eyebrow text-white/50">Compliance Report</span>
                      <h2 className="mt-1 text-2xl font-bold text-white uppercase tracking-tight">{report.docType}</h2>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
                        <div className="flex items-center gap-2">
                           <AppIcon name="shipments" className="h-4 w-4" />
                           {report.fileName}
                        </div>
                        <div className="flex items-center gap-2">
                           <AppIcon name="notifications" className="h-4 w-4" />
                           {new Date(report.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button onClick={reset} className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
                      <AppIcon name="create" className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Errors</p>
                      <p className="mt-1 text-xl font-bold text-rose-400">{report.errors.length}</p>
                    </div>
                    <div className="border-x border-white/10">
                      <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Warnings</p>
                      <p className="mt-1 text-xl font-bold text-amber-400">2</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Flags</p>
                      <p className="mt-1 text-xl font-bold text-teal-400">0</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4 stagger-in">
              <h3 className="card-title text-base">Detected Issues ({report.errors.length})</h3>
              <div className="grid gap-3">
                {report.errors.map((err) => (
                  <div key={err.id} className="card-surface flex items-start gap-4 border-l-4 border-l-rose-500 p-4 dark:border-l-rose-600 transition-all hover:translate-x-1">
                    <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      err.severity === 'high' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                      err.severity === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      <span className="text-xs font-bold">!</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{err.field}</span>
                        <span className="text-[10px] font-bold uppercase text-rose-500 dark:text-rose-400">{err.severity} Risk</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{err.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Suggestions Column */}
          <aside className="space-y-6">
            <section className="card-panel bg-teal-50/50 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/30">
               <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                 <AppIcon name="ai-extract" className="h-5 w-5" />
                 <h3 className="text-sm font-bold uppercase tracking-wider">AI Suggestions</h3>
               </div>
               <div className="mt-6 space-y-4">
                 {report.suggestions.map((s, i) => (
                   <div key={i} className="flex gap-3">
                     <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500 dark:bg-teal-400"></span>
                     <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{s}</p>
                   </div>
                 ))}
               </div>
               <button onClick={reset} className="btn-primary mt-8 w-full shadow-lg shadow-teal-500/20">
                 Fix & Re-validate
               </button>
            </section>

            <section className="card-panel card-muted">
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Legal Context</h3>
               <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                 This document contains patterns that may violate the <strong>UCC Section 2-201</strong> regarding statute of frauds for the sale of goods over $500.
               </p>
               <button onClick={() => alert('Viewing regulatory reference documentation...')} className="mt-4 text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                 View Regulations Reference →
               </button>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
