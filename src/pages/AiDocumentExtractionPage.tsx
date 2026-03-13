import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import PageHeader from '../components/PageHeader';

/* ─── Types ──────────────────────────────────────────────────────────── */
type DocType = 'Bill of Lading' | 'Commercial Invoice' | 'Packing List';
type DocStatus = 'Verified' | 'Pending Review' | 'Flagged';
type Stage = 'idle' | 'uploading' | 'scanning' | 'done';

interface ExtractedData {
  exporter: string;
  importer: string;
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
    exporter: 'Apex Retail Imports',
    importer: 'Global Trade GmbH',
    shipmentId: 'EXP-2026-001',
    destinationCountry: 'Germany',
    containerNumber: 'MSCU1234567',
    documentStatus: 'Verified',
    docType: 'Bill of Lading',
    confidence: 97,
    extractedAt: new Date().toISOString(),
  },
  'Commercial Invoice': {
    exporter: 'Sunrise Manufacturing Co.',
    importer: 'Pacific Rim Traders LLC',
    shipmentId: 'SHP-20260312-INV',
    destinationCountry: 'United States',
    containerNumber: 'MSCU4812960-2',
    documentStatus: 'Pending Review',
    docType: 'Commercial Invoice',
    confidence: 91,
    extractedAt: new Date().toISOString(),
  },
  'Packing List': {
    exporter: 'Delta Logistics (India)',
    importer: 'Eurotrade Sprl',
    shipmentId: 'SHP-20260312-PKL',
    destinationCountry: 'Belgium',
    containerNumber: 'HLCU7294013-9',
    documentStatus: 'Flagged',
    docType: 'Packing List',
    confidence: 78,
    extractedAt: new Date().toISOString(),
  },
};

/* ─── Helpers ────────────────────────────────────────────────────────── */
function statusColor(status: DocStatus) {
  if (status === 'Verified')
    return { dot: '#10b981', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' };
  if (status === 'Pending Review')
    return { dot: '#f59e0b', bg: '#fffbeb', text: '#78350f', border: '#fde68a' };
  return { dot: '#ef4444', bg: '#fef2f2', text: '#7f1d1d', border: '#fecaca' };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ─── Sub-components ─────────────────────────────────────────────────── */
function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 90 ? '#10b981' : value >= 75 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div
        style={{
          flex: 1,
          height: '6px',
          borderRadius: '9999px',
          background: '#e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background: color,
            borderRadius: '9999px',
            transition: 'width 1s cubic-bezier(.4,0,.2,1)',
          }}
        />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, color, minWidth: '36px', textAlign: 'right' }}>
        {value}%
      </span>
    </div>
  );
}

function FieldRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '14px 0',
        borderBottom: '1px solid #f1f5f9',
      }}
    >
      <span
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#94a3b8',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#0f172a',
          fontFamily: mono ? '"JetBrains Mono", "Fira Code", monospace' : 'inherit',
          letterSpacing: mono ? '0.04em' : 'normal',
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* Refactored inline styles into reusable CSS classes */
const styles = {
  pulsingDot: {
    width: '17px',
    height: '17px',
    fill: 'none',
    stroke: 'white',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: '9999px',
  },
};

function PulsingDot() {
  return (
    <svg viewBox="0 0 24 24" style={styles.pulsingDot}>
      <circle cx="12" cy="12" r="3" />
      <path d="M3 12h2m14 0h2M12 3v2m0 14v2m-6.36-4.64 1.42 1.42M17.95 6.05l1.41 1.41M6.05 6.05 4.63 7.47M17.95 17.95l1.41-1.41" />
    </svg>
  );
}

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

  const reset = () => {
    setStage('idle');
    setFileName(null);
    setExtracted(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sc = extracted ? statusColor(extracted.documentStatus) : null;

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(20,184,166,0.55); }
          70%  { box-shadow: 0 0 0 8px rgba(20,184,166,0); }
          100% { box-shadow: 0 0 0 0 rgba(20,184,166,0); }
        }
        @keyframes scan-sweep {
          0%   { top: 0; opacity: 0.9; }
          50%  { opacity: 0.5; }
          100% { top: calc(100% - 2px); opacity: 0.9; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .ai-card-animate { animation: fade-in-up 0.5s cubic-bezier(.4,0,.2,1) both; }
        .shimmer-line {
          background: linear-gradient(90deg, #e2e8f0 25%, #f8fafc 50%, #e2e8f0 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite linear;
          border-radius: 6px;
        }
      `}</style>

      <div className="page-stack">
        <PageHeader
          title="AI Document Extraction"
          subtitle="Upload a logistics document for instant AI-powered field extraction and verification."
        />

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))' }}>

          {/* ── Upload Panel ── */}
          <section className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg,#0d9488,#112c45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                  <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M12 12V4m0 0-4 4m4-4 4 4" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Upload Document</h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Supports PDF, JPG, PNG</p>
              </div>
            </div>

            {/* Document type selector */}
            <div>
              <label htmlFor="ai-doc-type" className="input-label">Document Type</label>
              <select
                id="ai-doc-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocType)}
                className="input-field"
                disabled={stage === 'uploading' || stage === 'scanning'}
              >
                <option>Bill of Lading</option>
                <option>Commercial Invoice</option>
                <option>Packing List</option>
              </select>
            </div>

            {/* Drop zone */}
            <div
              id="ai-drop-zone"
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragOver ? '#0d9488' : '#cbd5e1'}`,
                borderRadius: '14px',
                background: isDragOver ? 'rgba(20,184,166,0.06)' : '#f8fafc',
                padding: '36px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Animated scan line when scanning */}
              {stage === 'scanning' && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #14b8a6, transparent)',
                    animation: 'scan-sweep 1.4s ease-in-out infinite',
                  }}
                />
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(13,148,136,0.12), rgba(17,44,69,0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{ width: '26px', height: '26px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                    {isDragOver ? 'Release to upload' : 'Drop your document here'}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    or <span style={{ color: '#0d9488', fontWeight: 600 }}>click to browse</span>
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                id="ai-file-input"
                accept=".pdf,image/png,image/jpeg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Status strip */}
            {stage !== 'idle' && (
              <div
                style={{
                  borderRadius: '12px',
                  padding: '14px 16px',
                  background: stage === 'done' ? '#ecfdf5' : 'rgba(20,184,166,0.08)',
                  border: `1px solid ${stage === 'done' ? '#a7f3d0' : 'rgba(20,184,166,0.25)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                {stage !== 'done' ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth={2}
                    strokeLinecap="round"
                    style={{ width: '18px', height: '18px', animation: 'spin-slow 1s linear infinite', flexShrink: 0 }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', flexShrink: 0 }}>
                    <path d="M5 12.5 10 17l9-10" />
                  </svg>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: stage === 'done' ? '#065f46' : '#0f172a' }}>
                    {stage === 'uploading' && 'Uploading document…'}
                    {stage === 'scanning' && 'AI scanning in progress…'}
                    {stage === 'done' && 'Extraction complete!'}
                  </p>
                  {fileName && (
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fileName}
                    </p>
                  )}
                </div>
                {stage === 'done' && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    style={{ fontSize: '11px', fontWeight: 600, color: '#0d9488', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', flexShrink: 0 }}
                  >
                    Reset
                  </button>
                )}
              </div>
            )}

            {/* Scanning skeleton */}
            {stage === 'scanning' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[80, 55, 70, 50, 65].map((w, i) => (
                  <div key={i} className="shimmer-line" style={{ height: '12px', width: `${w}%` }} />
                ))}
              </div>
            )}
          </section>

          {/* ── AI Extraction Result Panel ── */}
          <section>
            {!extracted && stage !== 'scanning' && (
              <div
                className="card-panel"
                style={{
                  height: '100%',
                  minHeight: '320px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '14px',
                  opacity: 0.6,
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg,rgba(13,148,136,0.1),rgba(17,44,69,0.08))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M9 9h1m5 0h1M9 12h6M9 15h4" />
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>
                  Upload a document to see<br />AI extracted data here
                </p>
              </div>
            )}

            {stage === 'scanning' && (
              <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PulsingDot />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0d9488' }}>AI scanning document…</span>
                </div>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="shimmer-line" style={{ height: '10px', width: '40%' }} />
                    <div className="shimmer-line" style={{ height: '14px', width: `${60 + i * 6}%` }} />
                  </div>
                ))}
              </div>
            )}

            {extracted && stage === 'done' && sc && (
              <article
                className="card-panel ai-card-animate"
                style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
              >
                {/* Card header */}
                <div
                  style={{
                    margin: '-24px -24px 0',
                    padding: '18px 24px',
                    background: 'linear-gradient(135deg,#0f172a 0%,#112c45 55%,#0d9488 100%)',
                    borderRadius: '16px 16px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '9px',
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: '17px', height: '17px' }}>
                        <circle cx="12" cy="12" r="3" />
                        <path d="M3 12h2m14 0h2M12 3v2m0 14v2m-6.36-4.64 1.42 1.42M17.95 6.05l1.41 1.41M6.05 6.05 4.63 7.47M17.95 17.95l1.41-1.41" />
                      </svg>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
                        AI Extracted Data
                      </p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'white' }}>
                        {extracted.docType}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      background: sc.bg,
                      border: `1px solid ${sc.border}`,
                    }}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: sc.text }}>
                      {extracted.documentStatus}
                    </span>
                  </div>
                </div>

                {/* Confidence bar */}
                <div
                  style={{
                    margin: '0 -24px',
                    padding: '14px 24px',
                    background: 'linear-gradient(90deg,rgba(13,148,136,0.06),rgba(17,44,69,0.04))',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
                      AI Confidence
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Extracted at {formatTime(extracted.extractedAt)}
                    </span>
                  </div>
                  <ConfidenceBar value={extracted.confidence} />
                </div>

                {/* Fields */}
                <div style={{ marginTop: '4px' }}>
                  <FieldRow label="Exporter" value={extracted.exporter} />
                  <FieldRow label="Importer" value={extracted.importer} />
                  <FieldRow label="Shipment ID" value={extracted.shipmentId} mono />
                  <FieldRow label="Destination Country" value={extracted.destinationCountry} />
                  <FieldRow label="Container Number" value={extracted.containerNumber} mono />
                  <div style={{ paddingTop: '14px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}>
                      Document Status
                    </span>
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 14px',
                          borderRadius: '9999px',
                          background: sc.bg,
                          border: `1px solid ${sc.border}`,
                          fontSize: '13px',
                          fontWeight: 700,
                          color: sc.text,
                        }}
                      >
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: sc.dot }} />
                        {extracted.documentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => window.alert('Exporting extracted data as JSON…')}
                    className="btn-primary"
                    style={{ flex: 1, minWidth: '120px', justifyContent: 'center' }}
                  >
                    Export Data
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="btn-secondary"
                    style={{ flex: 1, minWidth: '120px', justifyContent: 'center' }}
                  >
                    Upload Another
                  </button>
                </div>
              </article>
            )}
          </section>
        </div>

        {/* ── How it works strip ── */}
        <section className="card-panel">
          <h3 className="card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>How AI Extraction Works</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px' }}>
            {[
              { step: '01', title: 'Upload', desc: 'Drop a PDF, JPG or PNG logistics document' },
              { step: '02', title: 'OCR Scan', desc: 'AI reads and parses all text regions' },
              { step: '03', title: 'Field Mapping', desc: 'Smart extraction maps data to fields' },
              { step: '04', title: 'Verify', desc: 'Confidence score flags anomalies instantly' },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg,rgba(13,148,136,0.05),rgba(17,44,69,0.04))',
                  border: '1px solid rgba(13,148,136,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0d9488' }}>
                  Step {step}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{title}</span>
                <span style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{desc}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
