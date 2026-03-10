import { FormEvent, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';
import { REQUIRED_DOCUMENT_TYPES } from '../types';

export default function ShipmentDetailsPage() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const {
    state: { shipments, user },
    addComment
  } = useAppContext();
  const [message, setMessage] = useState('');
  const [internal, setInternal] = useState(false);

  const shipment = shipments.find((item) => item.id === shipmentId);

  const canViewInternalNotes = user?.role === 'Admin' || user?.role === 'Manager';
  const visibleComments = useMemo(
    () => shipment?.comments.filter((comment) => (canViewInternalNotes ? true : !comment.internal)) ?? [],
    [shipment?.comments, canViewInternalNotes]
  );

  const checklist = useMemo(
    () =>
      REQUIRED_DOCUMENT_TYPES.map((docType) => {
        const latest = shipment?.documents.find((doc) => doc.type === docType);
        return { type: docType, status: latest?.status ?? 'Missing' };
      }),
    [shipment]
  );

  const timeline = useMemo(() => {
    if (!shipment) return [];
    return [
      {
        id: `TL-${shipment.id}-created`,
        time: `${shipment.shipmentDate}T08:00:00.000Z`,
        title: 'Shipment created',
        note: `${shipment.id} was registered for ${shipment.destinationCountry}`
      },
      ...shipment.documents.map((doc) => ({
        id: `TL-${doc.id}`,
        time: doc.uploadedAt,
        title: `${doc.type} • ${doc.status}`,
        note: `${doc.fileName} uploaded by ${doc.uploadedBy}`
      })),
      ...shipment.comments.map((comment) => ({
        id: `TL-${comment.id}`,
        time: comment.createdAt,
        title: `${comment.author} added a ${comment.internal ? 'private' : 'team'} note`,
        note: comment.message
      }))
    ].sort((a, b) => b.time.localeCompare(a.time));
  }, [shipment]);

  if (!shipment) {
    return (
      <div className="card-panel">
        <h2 className="text-xl font-semibold text-navy-800">Shipment not found</h2>
        <p className="mt-2 text-sm text-slate-600">The shipment ID is invalid or was removed.</p>
        <Link to="/dashboard" className="btn-primary mt-4">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const verifiedDocs = shipment.documents.filter((doc) => doc.status === 'Verified').length;
  const pendingDocs = shipment.documents.filter((doc) => doc.status === 'Pending').length;
  const blockedDocs = shipment.documents.filter((doc) => doc.status === 'Missing' || doc.status === 'Rejected').length;
  const completion = Math.round((verifiedDocs / Math.max(1, REQUIRED_DOCUMENT_TYPES.length)) * 100);

  const handleCommentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    addComment(shipment.id, message.trim(), internal && canViewInternalNotes);
    setMessage('');
    setInternal(false);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title={`Shipment Details: ${shipment.id}`}
        subtitle={`${shipment.clientName} • ${shipment.destinationCountry} • Container ${shipment.containerNumber}`}
        action={
          <button type="button" onClick={() => window.alert(`Export started for ${shipment.id}.`)} className="btn-secondary">
            Export Shipment Bundle
          </button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="card-panel surface-glow bg-gradient-to-br from-white to-slate-50">
          <p className="text-xs uppercase tracking-wide text-slate-500">Compliance Score</p>
          <p className="mt-2 text-3xl font-bold text-navy-800">{completion}%</p>
          <p className="mt-1 text-xs text-slate-500">
            {verifiedDocs}/{REQUIRED_DOCUMENT_TYPES.length} required documents verified
          </p>
          <div className="mt-3 h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-teal-600" style={{ width: `${completion}%` }} />
          </div>
        </article>
        <article className="card-panel">
          <p className="text-xs uppercase tracking-wide text-slate-500">Shipment Status</p>
          <div className="mt-2">
            <StatusBadge value={shipment.status} />
          </div>
          <p className="mt-3 text-xs text-slate-500">Shipment date: {shipment.shipmentDate}</p>
          <p className="mt-1 text-xs text-slate-500">Deadline: {shipment.deadline}</p>
        </article>
        <article className="card-panel">
          <p className="text-xs uppercase tracking-wide text-slate-500">Priority / Owner</p>
          <div className="mt-2">
            <StatusBadge value={shipment.priority} />
          </div>
          <p className="mt-3 text-sm font-semibold text-navy-800">{shipment.assignedTo}</p>
          <p className="mt-1 text-xs text-slate-500">Container {shipment.containerNumber}</p>
        </article>
        <article className="card-panel">
          <p className="text-xs uppercase tracking-wide text-slate-500">Document Pulse</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-2">
              <p className="text-[11px] uppercase text-emerald-700">Verified</p>
              <p className="text-base font-semibold text-emerald-700">{verifiedDocs}</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-2">
              <p className="text-[11px] uppercase text-amber-700">Pending</p>
              <p className="text-base font-semibold text-amber-700">{pendingDocs}</p>
            </div>
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-2 py-2">
              <p className="text-[11px] uppercase text-rose-700">Blocked</p>
              <p className="text-base font-semibold text-rose-700">{blockedDocs}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <article className="card-panel">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="card-title text-base md:text-lg">Uploaded Documents</h3>
              <p className="card-subtitle">Latest file versions, validation state, and download actions.</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/shipments/${shipment.id}/upload`} className="btn-primary btn-sm">
                Upload Document
              </Link>
              <Link to={`/shipments/${shipment.id}/checklist`} className="btn-secondary btn-sm">
                Open Checklist
              </Link>
            </div>
          </div>
          <div className="table-shell">
            <table className="data-table min-w-[760px]">
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>File Name</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shipment.documents.map((document) => (
                  <tr key={document.id}>
                    <td className="font-semibold text-slate-800">{document.type}</td>
                    <td>{document.fileName}</td>
                    <td>{document.fileFormat}</td>
                    <td>
                      <StatusBadge value={document.status} />
                    </td>
                    <td>{document.uploadedBy}</td>
                    <td>{document.uploadedAt.slice(0, 10)}</td>
                    <td>
                      <button type="button" onClick={() => window.alert(`Downloading ${document.fileName}.`)} className="btn-secondary btn-xs">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card-panel">
          <h3 className="card-title text-base md:text-lg">Document Checklist</h3>
          <p className="card-subtitle">Mandatory export files with real-time status visibility.</p>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wide text-slate-500">Readiness</span>
              <span className="font-semibold text-slate-700">{completion}% complete</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-teal-600" style={{ width: `${completion}%` }} />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {checklist.map((item) => (
              <div key={item.type} className="card-muted flex items-center justify-between">
                <span className="text-sm text-slate-700">{item.type}</span>
                <StatusBadge value={item.status} />
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="card-panel">
          <h3 className="card-title text-base md:text-lg">Status Timeline</h3>
          <p className="card-subtitle">Chronological activity across files and collaboration notes.</p>
          <div className="space-y-3">
            {timeline.slice(0, 8).map((event) => (
              <div key={event.id} className="timeline-item">
                <p className="text-xs text-slate-500">{event.time.slice(0, 16).replace('T', ' ')}</p>
                <p className="text-sm font-semibold text-slate-800">{event.title}</p>
                <p className="text-xs text-slate-600">{event.note}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card-panel">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="card-title text-base md:text-lg">Comments & Notes</h3>
            <StatusBadge value={user?.role ?? 'Staff'} />
          </div>
          <form className="mb-4 space-y-3" onSubmit={handleCommentSubmit}>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} className="textarea-field" placeholder="Add operational comment or internal note..." />
            <label className="check-row">
              <input type="checkbox" checked={internal} disabled={!canViewInternalNotes} onChange={(event) => setInternal(event.target.checked)} /> Internal note (Admin/Manager only)
            </label>
            <button type="submit" className="btn-primary btn-sm">
              Save Note
            </button>
          </form>
          <div className="space-y-3">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="card-muted">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{comment.author}</p>
                  <p className="text-xs text-slate-500">{comment.createdAt.slice(0, 16).replace('T', ' ')}</p>
                </div>
                <p className="text-xs text-slate-500">
                  {comment.role} {comment.internal ? '• Internal' : '• Team'}
                </p>
                <p className="mt-2 text-sm text-slate-700">{comment.message}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

