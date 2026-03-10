import { FormEvent, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';

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

  if (!shipment) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-navy-800">Shipment not found</h2>
        <p className="mt-2 text-sm text-slate-600">The shipment ID is invalid or was removed.</p>
        <Link to="/dashboard" className="mt-4 inline-flex rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleCommentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }
    addComment(shipment.id, message.trim(), internal && canViewInternalNotes);
    setMessage('');
    setInternal(false);
  };

  const handleExport = () => {
    window.alert(`Export started for shipment bundle: ${shipment.id} (mock).`);
  };

  return (
    <div>
      <PageHeader
        title={`Shipment Details: ${shipment.id}`}
        subtitle={`${shipment.clientName} • ${shipment.destinationCountry} • Container ${shipment.containerNumber}`}
        action={
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Export Shipment Bundle
          </button>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-slate-500">Shipment Date</p>
          <p className="mt-2 text-lg font-semibold text-navy-800">{shipment.shipmentDate}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
          <div className="mt-2">
            <StatusBadge value={shipment.status} />
          </div>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-slate-500">Priority</p>
          <div className="mt-2">
            <StatusBadge value={shipment.priority} />
          </div>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-slate-500">Deadline</p>
          <p className="mt-2 text-lg font-semibold text-navy-800">{shipment.deadline}</p>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-navy-800">Uploaded Documents</h3>
            <div className="flex gap-2">
              <Link
                to={`/shipments/${shipment.id}/upload`}
                className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
              >
                Upload Document
              </Link>
              <Link
                to={`/shipments/${shipment.id}/checklist`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Open Checklist
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            {shipment.documents.map((document) => (
              <div key={document.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">{document.type}</p>
                    <p className="text-xs text-slate-500">
                      {document.fileName} • {document.fileFormat} • {document.uploadedAt.slice(0, 10)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={document.status} />
                    <button
                      type="button"
                      onClick={() => window.alert(`Downloading ${document.fileName} (mock).`)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-navy-800">Comments & Notes</h3>
            <StatusBadge value={user?.role ?? 'Coordinator'} />
          </div>
          <form className="mb-4 space-y-3" onSubmit={handleCommentSubmit}>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-200 focus:ring"
              placeholder="Add internal or operational note..."
            />
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={internal}
                disabled={!canViewInternalNotes}
                onChange={(event) => setInternal(event.target.checked)}
              />
              Internal note (Admin/Manager only)
            </label>
            <button type="submit" className="rounded-lg bg-navy-700 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-800">
              Save Note
            </button>
          </form>
          <div className="space-y-3">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
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

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/shipments/${shipment.id}/ai-scan`}
          className="rounded-xl bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          View AI Scan Results
        </Link>
        <Link
          to={`/shipments/${shipment.id}/upload`}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Upload More Files
        </Link>
      </section>
    </div>
  );
}
