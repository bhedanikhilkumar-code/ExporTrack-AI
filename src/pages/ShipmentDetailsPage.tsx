import { FormEvent, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import AppIcon from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';
import { REQUIRED_DOCUMENT_TYPES, ShipmentStatus } from '../types';
import AiDelayPrediction from '../components/AiDelayPrediction';
import ShipmentTimeline from '../components/ShipmentTimeline';

export default function ShipmentDetailsPage() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const {
    state: { shipments, user },
    addComment,
    updateShipmentStatus,
    assignDriver
  } = useAppContext();
  const navigate = useNavigate();
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
        <h2 className="text-xl font-semibold text-navy-800 dark:text-slate-100">Shipment not found</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">The shipment ID is invalid or was removed.</p>
        <Link to="/dashboard" className="btn-primary mt-4">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const verifiedDocs = shipment.documents.filter((doc) => doc.status === 'Verified').length;
  const pendingDocs = shipment.documents.filter((doc) => doc.status === 'Pending').length;
  const completion = Math.round((verifiedDocs / Math.max(1, REQUIRED_DOCUMENT_TYPES.length)) * 100);

  const handleCommentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    addComment(shipment.id, message.trim(), internal && canViewInternalNotes);
    setMessage('');
    setInternal(false);
  };

  const riskFactors = useMemo(() => {
    const factors: string[] = [];
    if (!shipment) return factors;

    const missingDocs = checklist.filter((item) => item.status === 'Missing').map((item) => item.type);
    const rejectedDocs = shipment.documents.filter((doc) => doc.status === 'Rejected').map((doc) => doc.type);
    const delayed = shipment.delayed;

    missingDocs.forEach((doc) => factors.push(`Missing ${doc}`));
    rejectedDocs.forEach((doc) => factors.push(`Rejected ${doc}`));
    if (delayed) factors.push('Shipment is marked as delayed');

    return factors;
  }, [shipment, checklist]);

  const riskScore = useMemo(() => {
    if (!shipment) return 0;
    let score = 0;
    const missingCount = checklist.filter((item) => item.status === 'Missing').length;
    const rejectedCount = shipment.documents.filter((doc) => doc.status === 'Rejected').length;

    score += missingCount * 15;
    score += rejectedCount * 20;
    if (shipment.delayed) score += 10;

    return Math.min(100, score);
  }, [shipment, checklist]);

  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-rose-600 dark:text-rose-400';
    if (score > 30) return 'text-amber-500';
    return 'text-emerald-500 dark:text-emerald-400';
  };

  const statusStages: ShipmentStatus[] = [
    'Shipment Created',
    'Driver Assigned',
    'Picked Up',
    'In Transit',
    'Reached Hub',
    'Out For Delivery',
    'Delivered'
  ];

  const currentStageIndex = statusStages.indexOf(shipment.status);

  const handleNextStage = () => {
    if (currentStageIndex < statusStages.length - 1) {
      updateShipmentStatus(shipment.id, statusStages[currentStageIndex + 1]);
    }
  };

  const handleAssignDriver = () => {
    const name = window.prompt('Enter Driver Name:', 'John Doe');
    const phone = window.prompt('Enter Driver Phone:', '+1 555-0123');
    const vehicle = window.prompt('Enter Vehicle Number:', 'TRK-9900');
    if (name && phone && vehicle) {
      assignDriver(shipment.id, { name, phone, vehicle });
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* ── Journey Stepper ── */}
      <section className="card-premium py-8 px-6 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[800px] px-4">
          {statusStages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div key={stage} className="flex flex-col items-center flex-1 relative group">
                {/* Connector Line */}
                {idx < statusStages.length - 1 && (
                  <div className={`absolute left-1/2 top-4 w-full h-0.5 transition-colors duration-500 ${
                    idx < currentStageIndex ? 'bg-teal-500' : 'bg-slate-100 dark:bg-slate-800'
                  }`} />
                )}
                
                {/* Node */}
                <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  isCompleted ? 'bg-teal-500 border-teal-500 text-white' : 
                  isCurrent ? 'bg-white border-teal-500 text-teal-600 scale-110 shadow-lg dark:bg-slate-900' : 
                  'bg-white border-slate-200 text-slate-300 dark:bg-slate-900 dark:border-slate-800'
                }`}>
                  {isCompleted ? (
                    <AppIcon name="check" className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  )}
                </div>
                
                {/* Labels */}
                <p className={`mt-3 text-[10px] font-bold uppercase tracking-wider text-center ${
                  isCurrent ? 'text-teal-600' : isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                }`}>
                  {stage}
                </p>
                {isCurrent && (
                  <span className="mt-1 flex h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Page Header ── */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <Link to="/shipments" className="hover:text-teal-600 transition-colors">Shipments Pipeline</Link>
            <AppIcon name="chevron-right" className="h-2 w-2" />
            <span className="text-slate-900 dark:text-white">Active Freight</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Shipment {shipment.id}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {shipment.clientName} • Container {shipment.containerNumber}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link to={`/shipments/${shipment.id}/tracking`} className="btn-secondary btn-sm sm:btn-base group border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:border-teal-900/50 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/40">
             <span className="relative flex h-2 w-2 mr-1.5 sm:mr-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
             </span>
             <span className="hidden sm:inline">Live </span>Tracking
          </Link>
          <button
            onClick={() => navigate(`/shipments/${shipment.id}/upload`)}
            className="btn-secondary btn-sm sm:btn-base"
          >
            <AppIcon name="upload" className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Upload </span>Manifest
          </button>
          <button
            onClick={() => {
              const csvContent = [
                'Document Type,File Name,Status,Uploaded By,Uploaded At'
              ];
              shipment.documents.forEach(doc => {
                csvContent.push(`"${doc.type}","${doc.fileName}","${doc.status}","${doc.uploadedBy}","${doc.uploadedAt}"`);
              });
              const header = `Shipment: ${shipment.id}\nClient: ${shipment.clientName}\nDestination: ${shipment.destinationCountry}\nContainer: ${shipment.containerNumber}\nStatus: ${shipment.status}\n\n`;
              const element = document.createElement('a');
              element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + csvContent.join('\n')));
              element.setAttribute('download', `shipment-report-${shipment.id}-${new Date().toISOString().split('T')[0]}.csv`);
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            className="btn-primary btn-sm sm:btn-base"
          >
            <span className="hidden sm:inline">Export </span>Report
          </button>
          {currentStageIndex < statusStages.length - 1 && (
            <button
              onClick={handleNextStage}
              className="btn-primary btn-sm sm:btn-base bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <AppIcon name="chevron-right" className="mr-1 sm:mr-2 h-4 w-4" />
              Next Stage
            </button>
          )}
        </div>
      </header>

      {/* ── Key Indicators ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-premium">
          <div className="mb-4 flex items-center justify-between">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Compliance</span>
             <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600">
                <AppIcon name="shield" className="h-4 w-4" />
             </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{completion}%</span>
            <div className="mb-1.5 h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full bg-teal-500" style={{ width: `${completion}%` }} />
            </div>
          </div>
          <p className="mt-2 text-[11px] font-medium text-slate-500">{verifiedDocs} of {REQUIRED_DOCUMENT_TYPES.length} documents verified</p>
        </div>

        <div className="card-premium">
          <div className="mb-4 flex items-center justify-between">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Network Risk</span>
             <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600">
                <AppIcon name="warning" className="h-4 w-4" />
             </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${getRiskColor(riskScore)}`}>{riskScore}%</span>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold uppercase text-rose-600 dark:bg-rose-900/20">
              {riskScore > 50 ? 'Critical' : riskScore > 20 ? 'Monitor' : 'Stable'}
            </span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-slate-500 truncate">
            {riskFactors[0] || 'No immediate risk factors detected'}
          </p>
        </div>

        <div className="card-premium">
          <div className="mb-4 flex items-center justify-between">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Status</span>
             <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                <AppIcon name="clock" className="h-4 w-4" />
             </div>
          </div>
          <div className="flex flex-col gap-1">
            <StatusBadge value={shipment.status} />
            <span className="mt-1 text-[11px] font-bold text-slate-500">EtD: {shipment.shipmentDate}</span>
          </div>
        </div>

        <div className="card-premium">
          <div className="mb-4 flex items-center justify-between">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Driver & Vehicle</span>
             <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                <AppIcon name="team" className="h-4 w-4" />
             </div>
          </div>
          {shipment.driverName ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-bold text-teal-400 shadow-sm border border-white/10">
                  {shipment.driverName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{shipment.driverName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{shipment.vehicleNumber}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
                <a href={`tel:${shipment.driverPhone}`} className="text-[10px] font-bold text-teal-600 hover:text-teal-500 transition-colors flex items-center gap-1.5 group">
                   <div className="h-5 w-5 bg-teal-50 dark:bg-teal-900/20 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AppIcon name="user" className="h-3 w-3" />
                   </div>
                   {shipment.driverPhone}
                </a>
                {shipment.estimatedDeliveryTime && (
                  <span className="text-[9px] font-bold text-slate-400">ETA: {new Date(shipment.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                )}
              </div>
            </div>
          ) : (
            <button 
              onClick={handleAssignDriver}
              className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:border-indigo-500/30 hover:text-indigo-600 transition-all flex flex-col items-center gap-2"
            >
              <AppIcon name="team" className="h-5 w-5 opacity-40" />
              Assign Logistics Driver
            </button>
          )}
        </div>
      </section>

      {/* ── Content Grid ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Span - AI and Docs */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Intelligence Spotlight */}
          <article className="card-premium overflow-hidden border-none bg-slate-900 text-white dark:bg-teal-900/10">
            <div className="flex flex-col gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-teal-400">
                    <AppIcon name="ai-extract" className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Neural Route Optimization</span>
                </div>
                <h3 className="text-lg font-bold mb-3">Predicted Lane Performance</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Our neural engine has analyzed the Current transshipment hub performance and historical data for {shipment.destinationCountry}.
                </p>
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">94%</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Stability</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-teal-400">-12h</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">EtA Delta</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <AiDelayPrediction shipmentId={shipment.id} />
              </div>
            </div>
          </article>

          {/* Document Management */}
          <article className="card-premium">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Manifest Repository</h3>
              <Link to="/ai-validator" className="text-xs font-bold text-teal-600 hover:underline">
                Run Validation Scan
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 dark:border-slate-800">
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Document</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {shipment.documents.map((doc) => (
                    <tr key={doc.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-slate-400 dark:bg-slate-800">
                            <AppIcon name="file" className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{doc.type}</p>
                            <p className="text-[10px] text-slate-400">{doc.fileName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <StatusBadge value={doc.status} />
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => window.alert(`📄 ${doc.type}\n\nFile: ${doc.fileName}\nStatus: ${doc.status}\nUploaded by: ${doc.uploadedBy}\nUploaded at: ${new Date(doc.uploadedAt).toLocaleString()}`)}
                          className="text-[10px] font-bold text-teal-600 hover:text-teal-500 transition-colors uppercase tracking-widest"
                        >
                          Full View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        {/* Right Span - Checklist and Feed */}
        <div className="space-y-6">
          <article className="card-premium">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-500 text-center">Mandatory Compliance</h3>
            <div className="space-y-2">
              {checklist.map((item) => {
                const isVerified = item.status === 'Verified';
                return (
                  <div key={item.type} className={`p-3 rounded-xl border flex items-center justify-between group transition-all hover:border-teal-500/30 ${
                    isVerified 
                      ? 'bg-emerald-50/20 border-emerald-100 dark:border-emerald-900/20' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                        isVerified ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700'
                      }`}>
                         {isVerified && <AppIcon name="check" className="h-3 w-3" strokeWidth={3} />}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item.type}</span>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>
                );
              })}
            </div>
          </article>

          {/* Collaboration Hub */}
          <article className="card-premium">
             <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-500">Lane Feed</h3>
             <form className="mb-8" onSubmit={handleCommentSubmit}>
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-24 rounded-xl border-slate-200 bg-slate-50 p-4 pb-12 text-xs font-medium placeholder-slate-400 focus:border-teal-500 focus:ring-0 dark:border-slate-800 dark:bg-slate-900/50"
                    placeholder="Broadcast message to team..."
                  />
                  <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/40 backdrop-blur-sm p-1 px-2 rounded-lg">
                     <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={internal} 
                          onChange={(e) => setInternal(e.target.checked)} 
                          className="rounded border-slate-300 text-teal-600 focus:ring-0 dark:border-slate-800 h-3 w-3"
                        />
                        <span className="text-[9px] font-bold uppercase text-slate-500 group-hover:text-amber-500 transition-colors">Private Note</span>
                     </label>
                     <button type="submit" className="btn-primary py-1 px-3 text-[10px] font-bold rounded-lg h-7">
                        Broadcast
                     </button>
                  </div>
                </div>
             </form>

             <div className="space-y-4">
               {visibleComments.map((comment) => (
                 <div key={comment.id} className={`p-4 rounded-xl border relative ${
                   comment.internal 
                     ? 'bg-amber-50/30 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20' 
                     : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                 }`}>
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                       <span className="text-[11px] font-bold text-slate-900 dark:text-white">{comment.author}</span>
                       {comment.internal && <span className="text-[8px] font-black uppercase text-amber-600">Internal</span>}
                     </div>
                     <span className="text-[10px] font-bold text-slate-400">
                      {comment.createdAt.split('T')[0]}
                     </span>
                   </div>
                   <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {comment.message}
                   </p>
                 </div>
               ))}
             </div>
          </article>
        </div>
      </div>

      <div className="mt-6">
        <ShipmentTimeline events={timeline} />
      </div>
    </div>
  );
}
