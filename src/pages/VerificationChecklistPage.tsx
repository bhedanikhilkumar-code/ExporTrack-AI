import { ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';
import { DocStatus, REQUIRED_DOCUMENT_TYPES } from '../types';

const statusOptions: DocStatus[] = ['Pending', 'Verified', 'Missing', 'Rejected'];

export default function VerificationChecklistPage() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const {
    state: { shipments }
  } = useAppContext();
  const { updateDocumentStatus } = useAppContext();

  const shipment = shipments.find((item) => item.id === shipmentId);

  if (!shipment) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-navy-800">Shipment not found</h2>
        <Link to="/dashboard" className="mt-3 inline-flex rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const checklist = REQUIRED_DOCUMENT_TYPES.map((type) => {
    const document = shipment.documents.find((doc) => doc.type === type);
    return {
      type,
      document,
      status: document?.status ?? ('Missing' as DocStatus)
    };
  });

  const verifiedCount = checklist.filter((item) => item.status === 'Verified').length;
  const progressPercent = Math.round((verifiedCount / checklist.length) * 100);

  const handleStatusChange = (type: (typeof REQUIRED_DOCUMENT_TYPES)[number], event: ChangeEvent<HTMLSelectElement>) => {
    updateDocumentStatus(shipment.id, type, event.target.value as DocStatus);
  };

  return (
    <div>
      <PageHeader
        title={`Verification Checklist: ${shipment.id}`}
        subtitle="Validate all mandatory export documents and update status for compliance readiness."
        action={
          <button
            type="button"
            onClick={() => window.alert(`Verification summary exported for ${shipment.id}.`)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Export Checklist
          </button>
        }
      />

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">Verification Progress</p>
          <p className="text-sm font-semibold text-navy-800">
            {verifiedCount} / {checklist.length} verified ({progressPercent}%)
          </p>
        </div>
        <div className="h-2 rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-teal-600" style={{ width: `${progressPercent}%` }} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 font-medium">Required Document</th>
                <th className="pb-2 font-medium">Current File</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {checklist.map((item) => (
                <tr key={item.type} className="border-b border-slate-100 last:border-none">
                  <td className="py-3 font-semibold text-navy-700">{item.type}</td>
                  <td className="py-3 text-slate-700">{item.document?.fileName ?? 'Not uploaded'}</td>
                  <td className="py-3">
                    <StatusBadge value={item.status} />
                  </td>
                  <td className="py-3">
                    <select
                      value={item.status}
                      onChange={(event) => handleStatusChange(item.type, event)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none ring-teal-200 focus:ring"
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/shipments/${shipment.id}`}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Back to Shipment
        </Link>
        <Link
          to={`/shipments/${shipment.id}/ai-scan`}
          className="rounded-xl bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          View AI Extraction
        </Link>
      </div>
    </div>
  );
}

