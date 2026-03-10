import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';

export default function AiScanResultsPage() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const {
    state: { shipments }
  } = useAppContext();

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

  return (
    <div>
      <PageHeader
        title={`AI Scan Results: ${shipment.id}`}
        subtitle="Mock OCR extraction fields generated from uploaded documents."
        action={
          <button
            type="button"
            onClick={() => window.alert(`AI re-scan queued for shipment ${shipment.id}.`)}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Re-run OCR
          </button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2">
        {shipment.aiScan.map((result) => (
          <article key={result.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-navy-800">{result.documentType}</h3>
              <StatusBadge value={result.confidence >= 95 ? 'Verified' : 'Pending'} />
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Invoice Number</dt>
                <dd className="font-medium text-slate-800">{result.invoiceNumber}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Date</dt>
                <dd className="font-medium text-slate-800">{result.date}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Buyer Name</dt>
                <dd className="font-medium text-slate-800">{result.buyerName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Shipment Value</dt>
                <dd className="font-medium text-slate-800">{result.shipmentValue}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Destination</dt>
                <dd className="font-medium text-slate-800">{result.destination}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Confidence</dt>
                <dd className="font-medium text-slate-800">{result.confidence}%</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/shipments/${shipment.id}/checklist`}
          className="rounded-xl bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          Continue to Verification Checklist
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

