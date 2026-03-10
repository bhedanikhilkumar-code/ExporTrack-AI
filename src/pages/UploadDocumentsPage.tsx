import { ChangeEvent, DragEvent, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';
import { REQUIRED_DOCUMENT_TYPES, UploadDocumentInput } from '../types';

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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-navy-800">Shipment not found</h2>
        <Link to="/dashboard" className="mt-3 inline-flex rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">Return to Dashboard</Link>
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

  return (
    <div>
      <PageHeader title={`Upload Documents: ${shipment.id}`} subtitle="Drag & drop on web, camera/file upload on mobile. Supports PDF, JPG, PNG." action={<Link to={`/shipments/${shipment.id}/ai-scan`} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Open AI Scan Results</Link>} />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-navy-800">Document Upload</h3>
          <div className="mt-4">
            <label htmlFor="doc-type" className="mb-1 block text-sm font-medium text-slate-700">Document Type</label>
            <select id="doc-type" value={documentType} onChange={(event) => setDocumentType(event.target.value as UploadDocumentInput['type'])} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-200 focus:ring">
              {REQUIRED_DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
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
            className={`mt-4 block cursor-pointer rounded-xl border-2 border-dashed p-5 text-center ${isDragOver ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-slate-50'}`}
          >
            <p className="text-sm font-semibold text-slate-800">Drop files here or click to browse</p>
            <p className="mt-1 text-xs text-slate-500">Mobile: camera capture enabled automatically</p>
            <input id="doc-files" type="file" multiple capture="environment" accept=".pdf,image/png,image/jpeg" onChange={(event: ChangeEvent<HTMLInputElement>) => setIncomingFiles(event.target.files)} className="hidden" />
          </label>

          <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
            <p className="font-semibold">Selected files ({files.length})</p>
            <ul className="mt-2 space-y-1 text-xs">{files.length ? files.map((file) => <li key={file.name}>{file.name}</li>) : <li>No files selected yet.</li>}</ul>
          </div>

          <button type="button" onClick={handleUpload} className="mt-4 rounded-xl bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">Upload & Queue for Verification</button>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="mb-3 text-lg font-semibold text-navy-800">Quick Actions</h3>
          <div className="space-y-3">
            <button type="button" onClick={() => window.alert(`Downloading all files for ${shipment.id} (mock).`)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Download Shipment Files</button>
            <Link to={`/shipments/${shipment.id}/checklist`} className="block rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100">Open Verification Checklist</Link>
            <Link to={`/shipments/${shipment.id}`} className="block rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100">Back to Shipment Details</Link>
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h3 className="mb-3 text-lg font-semibold text-navy-800">Recent Document Activity</h3>
        <div className="space-y-3">
          {sortedDocs.map((document) => (
            <div key={document.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{document.type}</p>
                <p className="text-xs text-slate-500">{document.fileName} • Uploaded by {document.uploadedBy} • {document.uploadedAt.slice(0, 10)}</p>
              </div>
              <div className="flex items-center gap-2"><StatusBadge value={document.status} /><button type="button" onClick={() => window.alert(`Downloading ${document.fileName} (mock).`)} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100">Download</button></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
