import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';

export default function AiScanResultsPage() {
  const [isReRunning, setIsReRunning] = useState(false);
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const {
    state: { shipments }
  } = useAppContext();

  const shipment = shipments.find((item) => item.id === shipmentId);

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

  return (
    <div className="page-stack">
      <PageHeader
        title={`AI Scan Results: ${shipment.id}`}
        subtitle="Mock OCR extraction fields generated from uploaded documents."
        action={
          <button
            type="button"
            onClick={() => {
              setIsReRunning(true);
              setTimeout(() => {
                setIsReRunning(false);
                alert(`✅ OCR re-scan completed for shipment ${shipment.id}. Updated results are displayed above.`);
              }, 1500);
            }}
            disabled={isReRunning}
            className="btn-primary bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isReRunning ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                Running...
              </>
            ) : (
              <>Re-run OCR</>
            )}
          </button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2">
        {shipment.aiScan.map((result) => (
          <article key={result.id} className="card-panel">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="card-title text-base md:text-lg">{result.documentType}</h3>
              <StatusBadge value={result.confidence >= 95 ? 'Verified' : 'Pending'} />
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Invoice Number</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">{result.invoiceNumber}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Date</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">{result.date}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Buyer Name</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">{result.buyerName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Shipment Value</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">{result.shipmentValue}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Destination</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">{result.destination}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Confidence</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">{result.confidence}%</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <section className="flex flex-wrap gap-3">
        <Link to={`/shipments/${shipment.id}/checklist`} className="btn-primary">
          Continue to Verification Checklist
        </Link>
        <Link to={`/shipments/${shipment.id}/upload`} className="btn-secondary">
          Upload More Files
        </Link>
      </section>
    </div>
  );
}

