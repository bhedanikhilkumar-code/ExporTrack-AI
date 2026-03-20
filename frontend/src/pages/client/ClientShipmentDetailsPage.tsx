import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import AppIcon from '../../components/AppIcon';
import StatusBadge from '../../components/StatusBadge';

export default function ClientShipmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { state: { shipments, user } } = useAppContext();
  const navigate = useNavigate();

  const shipment = shipments.find(s => s.id === id);

  // Security check: ensure this shipment belongs to the client
  const isAuthorized = shipment?.clientName.toLowerCase().includes(user?.name.toLowerCase() || '');

  if (!shipment || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AppIcon name="warning" className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shipment Not Found</h2>
        <p className="text-slate-500 mt-2">The shipment record you are looking for does not exist or you don't have access.</p>
        <button onClick={() => navigate('/client/shipments')} className="btn-secondary mt-6">
          Back to My Shipments
        </button>
      </div>
    );
  }

  return (
    <div className="page-stack px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
            <Link to="/client/shipments" className="text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
              <AppIcon name="trend-up" className="h-3 w-3 -rotate-135" />
              Back to Shipments
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>
            Shipment {shipment.id}
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Container: {shipment.containerNumber} • Destination: {shipment.destinationCountry}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/track/${shipment.id}`} className="btn-primary flex items-center gap-2">
            <AppIcon name="shipments" className="h-4 w-4" />
            Live Tracker
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Card */}
          <div className="card-premium">
            <h2 className="section-title mb-6">Shipment Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
                  <StatusBadge value={shipment.status} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Expected Delivery</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {new Date(shipment.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Destination</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{shipment.destinationCountry}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Container Number</p>
                  <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">{shipment.containerNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Shipment Date</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {new Date(shipment.shipmentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Priority</p>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${shipment.priority === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40' :
                      shipment.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800'
                    }`}>
                    {shipment.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>          {/* Documents Card */}
          <div className="card-premium">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Shipment Documents</h2>
              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600">
                {shipment.documents.length} Files
              </span>
            </div>

            {shipment.documents.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-slate-500">No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shipment.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm text-slate-400">
                        <AppIcon name="folder" className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{doc.type}</p>
                        <p className="text-[10px] text-slate-500">{doc.fileName} • {doc.fileFormat}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge value={doc.status} />
                      <button
                        onClick={() => alert(`Downloading ${doc.fileName}...`)}
                        className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                        title="Download Document"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Document Insights */}
          {shipment.aiScan && shipment.aiScan.length > 0 && (
            <div className="card-premium border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-slate-950">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                  <AppIcon name="ai-extract" className="h-4 w-4" />
                </div>
                <h2 className="section-title !mb-0">AI Document Insights</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shipment.aiScan.map(scan => (
                  <div key={scan.id} className="p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 bg-white/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">{scan.documentType}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                        {scan.confidence}% Confidence
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[10px] text-slate-500 font-medium">Invoice #</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{scan.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] text-slate-500 font-medium">Value</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{scan.shipmentValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] text-slate-500 font-medium">Date</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{scan.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeline & Analytics Column */}
        <div className="space-y-8">
          {/* Shipping Analytics Widget */}
          <div className="card-premium border-l-4 border-l-teal-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/20">
                <AppIcon name="trend-up" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Shipping Analytics</h2>
                <p className="text-[10px] text-slate-500">ML-Powered ETA Tracking</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Tracking Confidence</span>
                  <span className="text-xs font-bold text-teal-600">94%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full w-[94%] bg-teal-500" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-teal-600">
                    <AppIcon name="shield" className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">On-Time Performance</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Route analysis indicates high probability of meeting the target deadline.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-premium space-y-2">
          {shipment.comments.filter(c => !c.internal).map((comment, idx) => (
            <div key={comment.id} className="relative pl-6">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" />
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{comment.author}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{comment.message}</p>
            </div>
          ))}
          <div className="relative pl-6">
            <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-900" />
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
              {new Date(shipment.shipmentDate).toLocaleDateString()}
            </p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Shipment Created</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Record established by logistics team.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
