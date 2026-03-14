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
      <div className="card-premium">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Shipment not found</h2>
        <Link to="/dashboard" className="btn-primary mt-3 inline-flex items-center gap-2">
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
    <div className="page-stack">
      <PageHeader
        title={`Verification Checklist: ${shipment.id}`}
        subtitle="Validate all mandatory export documents and update status for compliance readiness."
        action={
          <button
            type="button"
            onClick={() => window.alert(`Verification summary exported for ${shipment.id}.`)}
            className="btn-secondary"
          >
            Export Checklist
          </button>
        }
      />

      <section className="card-premium">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verification Progress</p>
          <p className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
            {verifiedCount} / {checklist.length} verified ({progressPercent}%)
          </p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
        </div>
      </section>

      <section className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Required Document</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Current File</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {checklist.map((item) => (
                <tr key={item.type} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-4 font-bold text-slate-900 dark:text-slate-100">{item.type}</td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{item.document?.fileName ?? 'Not uploaded'}</td>
                  <td className="px-4 py-4">
                    <StatusBadge value={item.status} />
                  </td>
                  <td className="px-4 py-4 text-right flex justify-end">
                    <select
                      value={item.status}
                      onChange={(event) => handleStatusChange(item.type, event)}
                      className="input-field py-1.5 px-3 rounded-lg text-xs font-semibold border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-teal-500 focus:ring-teal-500/20 w-32"
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

      <div className="flex flex-wrap gap-3">
        <Link to={`/shipments/${shipment.id}`} className="btn-secondary">
          Back to Shipment
        </Link>
        <Link to={`/shipments/${shipment.id}/ai-scan`} className="btn-primary">
          View AI Extraction
        </Link>
      </div>
    </div>
  );
}
