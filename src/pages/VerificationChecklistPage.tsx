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
      <div className="card-panel">
        <h2 className="text-xl font-semibold text-navy-800">Shipment not found</h2>
        <Link to="/dashboard" className="btn-primary mt-3">
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

      <section className="card-panel">
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

      <section className="card-panel">
        <div className="table-shell">
          <table className="data-table min-w-[760px]">
            <thead>
              <tr>
                <th>Required Document</th>
                <th>Current File</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {checklist.map((item) => (
                <tr key={item.type}>
                  <td className="font-semibold text-navy-700">{item.type}</td>
                  <td>{item.document?.fileName ?? 'Not uploaded'}</td>
                  <td>
                    <StatusBadge value={item.status} />
                  </td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(event) => handleStatusChange(item.type, event)}
                      className="input-field py-2 text-xs"
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

