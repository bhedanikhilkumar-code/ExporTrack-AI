import { ChangeEvent, DragEvent, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import AppIcon from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';
import { REQUIRED_DOCUMENT_TYPES, UploadDocumentInput } from '../types';
import AiDocumentSummary from '../components/AiDocumentSummary';

const detectFormat = (fileName: string): UploadDocumentInput['fileFormat'] => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) return 'PNG';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'JPG';
  return 'PDF';
};

export default function UploadDocumentsPage() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const {
    state: { shipments, user },
    addDocument
  } = useAppContext();

  const shipment = shipments.find((item) => item.id === shipmentId);
  const [documentType, setDocumentType] = useState<UploadDocumentInput['type']>(REQUIRED_DOCUMENT_TYPES[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const sortedDocs = useMemo(() => [...(shipment?.documents ?? [])].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)), [shipment?.documents]);

  if (!shipment) {
    return (
      <div className="card-panel">
        <h2 className="text-xl font-semibold text-navy-800 dark:text-white">Shipment not found</h2>
        <Link to="/dashboard" className="btn-primary mt-3">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const setIncomingFiles = (incoming: FileList | null) => setFiles(Array.from(incoming ?? []));

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    setIncomingFiles(event.dataTransfer.files);
  };

  const handleUpload = () => {
    if (!files.length) return;
    files.forEach((file) => {
      addDocument(shipment.id, { type: documentType, fileName: file.name, fileFormat: detectFormat(file.name), uploadedBy: user?.name ?? 'Staff' });
    });
    setFiles([]);
  };

  const handleDownloadAllFiles = () => {
    if (!sortedDocs.length) {
      alert('No documents to download.');
      return;
    }

    // Create a simple zip-like download structure or download each individually
    const doc = sortedDocs[0];
    const content = `Shipment ${shipment.id} - Document Manifest\n\nDocuments:\n${sortedDocs.map((d, i) => `${i + 1}. ${d.type} (${d.fileName}) - Status: ${d.status}`).join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${shipment.id}-documents-manifest.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadDocument = (doc: typeof sortedDocs[0]) => {
    const content = `${doc.type} Document\n\nFile: ${doc.fileName}\nStatus: ${doc.status}\nUploaded By: ${doc.uploadedBy}\nDate: ${doc.uploadedAt}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName || `${doc.type}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title={`Upload Documents: ${shipment.id}`}
        subtitle="Drag & drop on web, camera/file upload on mobile. Supports PDF, JPG, PNG."
        action={
          <Link to={`/shipments/${shipment.id}/ai-scan`} className="btn-secondary">
            Open AI Scan Results
          </Link>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="card-panel">
          <h3 className="card-title text-base md:text-lg">Document Upload</h3>
          <p className="card-subtitle">Queue files for AI extraction and verification checks.</p>
          <div className="mt-4">
            <label htmlFor="doc-type" className="input-label">
              Document Type
            </label>
            <select id="doc-type" value={documentType} onChange={(event) => setDocumentType(event.target.value as UploadDocumentInput['type'])} className="input-field">
              {REQUIRED_DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="Delivery Order">Delivery Order</option>
              <option value="Inspection Report">Inspection Report</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <label
            htmlFor="doc-files"
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`mt-4 block cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition ${isDragOver ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-400 dark:hover:border-slate-600'
              }`}
          >
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Drop files here or click to browse</p>
            <p className="mt-1 text-xs text-slate-500">Mobile: camera capture enabled automatically</p>
            <input id="doc-files" type="file" multiple capture="environment" accept=".pdf,image/png,image/jpeg" onChange={(event: ChangeEvent<HTMLInputElement>) => setIncomingFiles(event.target.files)} className="hidden" />
          </label>

          <div className="mt-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Queue ({files.length})</p>
              {files.length > 0 && (
                <button type="button" onClick={() => setFiles([])} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider">
                  Clear All
                </button>
              )}
            </div>
            <ul className="space-y-2">
              {files.length ? files.map((file, idx) => (
                <li key={`${file.name}-${idx}`} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-left-2">
                  <AppIcon name="upload" className="h-3.5 w-3.5 text-teal-500" />
                  <span className="truncate flex-1">{file.name}</span>
                  <span className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
                </li>
              )) : (
                <li className="text-xs text-slate-400 italic py-2">No files selected yet.</li>
              )}
            </ul>
          </div>

          <button type="button" onClick={handleUpload} className="btn-primary mt-4">
            Upload & Queue for Verification
          </button>
        </article>

        <article className="card-panel">
          <h3 className="mb-3 card-title text-base md:text-lg">Quick Actions</h3>
          <div className="space-y-3">
            <button type="button" onClick={handleDownloadAllFiles} className="btn-secondary w-full justify-center">
              Download Shipment Files
            </button>
            <Link to={`/shipments/${shipment.id}/checklist`} className="btn-secondary w-full justify-center">
              Open Verification Checklist
            </Link>
            <Link to={`/shipments/${shipment.id}`} className="btn-secondary w-full justify-center">
              Back to Shipment Details
            </Link>
          </div>
        </article>
      </section>

      <section className="card-panel">
        <h3 className="mb-3 card-title text-base md:text-lg">Recent Document Activity</h3>
        <div className="space-y-3">
          {sortedDocs.map((document) => (
            <div key={document.id} className="card-muted flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{document.type}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {document.fileName} • Uploaded by {document.uploadedBy} • {document.uploadedAt.slice(0, 10)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge value={document.status} />
                <button type="button" onClick={() => handleDownloadDocument(document)} className="btn-secondary btn-xs">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Document Summary  */}
      {sortedDocs.length > 0 && (
        <AiDocumentSummary
          fileName={sortedDocs[0].fileName}
          docType={sortedDocs[0].type}
          summary={{
            exporter: 'ABC Export Ltd.',
            importer: 'XYZ Import Co.',
            amount: '50,000',
            currency: 'USD',
            hsCode: '8704.2290',
            productDescription: 'Commercial vehicles for cargo transport',
            shipmentDetails: '2 containers via Singapore Port, ETA 15 days',
            confidence: 0.92
          }}
        />
      )}
    </div>
  );
}

