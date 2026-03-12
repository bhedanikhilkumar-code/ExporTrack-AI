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
    // Base risk calculation: 
    // 15% for each missing required doc
    // 20% for each rejected doc
    // 10% if overall delayed
    let score = 0;
    const missingCount = checklist.filter((item) => item.status === 'Missing').length;
    const rejectedCount = shipment.documents.filter((doc) => doc.status === 'Rejected').length;
    
    score += missingCount * 15;
    score += rejectedCount * 20;
    if (shipment.delayed) score += 10;

    return Math.min(100, score);
  }, [shipment, checklist]);

  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-rose-600';
    if (score > 30) return 'text-amber-500';
    return 'text-emerald-500';
  };

  return (
    <>
      {/* Premium Animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressSweep {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-slide-up { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .hover-lift { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -15px rgba(13, 148, 136, 0.15); }
      `}</style>

      <div className="page-stack pb-12">
        <PageHeader
          title={`Shipment Details: ${shipment.id}`}
          subtitle={`${shipment.clientName} • ${shipment.destinationCountry} • Container ${shipment.containerNumber}`}
          action={
            <div className="flex gap-3">
              <Link to={`/shipments/${shipment.id}/ai-scan`} className="btn-secondary bg-white/80 border-teal-200 text-teal-700 hover:bg-teal-50">
                AI Scan Results
              </Link>
              <button type="button" onClick={() => window.alert('Exporting...')} className="btn-primary shadow-soft bg-gradient-to-r from-teal-600 to-navy-700 border-none">
                Export Bundle
              </button>
            </div>
          }
        />

        {/* ── Shipment Summary & Risk ── */}
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-5 animate-slide-up">
          <article className="card-panel relative overflow-hidden bg-gradient-to-br from-navy-800 to-navy-900 border-none text-white hover-lift">
            <p className="text-xs uppercase tracking-wider text-navy-200 font-semibold mb-3">Overall Progress</p>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold">{completion}%</span>
              <span className="text-sm text-navy-200 mb-1">Complete</span>
            </div>
            <div className="mt-4 bg-navy-900/50 rounded-full h-2.5 overflow-hidden border border-navy-700">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-300 transition-all duration-1000"
                style={{ width: `${completion}%` }}
              />
            </div>
          </article>

          {/* Risk Score Widget */}
          <article className="card-panel bg-gradient-to-br from-white to-slate-50 border-rose-100 hover-lift lg:col-span-1">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Shipment Risk Score</p>
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-bold ${getRiskColor(riskScore)}`}>{riskScore}%</span>
              <svg className={`w-8 h-8 ${riskScore > 50 ? 'text-rose-500' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Top Risk Factors</p>
              {riskFactors.length > 0 ? (
                riskFactors.slice(0, 3).map((factor, i) => (
                  <div key={i} className="flex items-center gap-1.5 overflow-hidden">
                    <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                    <span className="text-[11px] font-medium text-slate-600 truncate">{factor}</span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-emerald-600 font-medium italic">No active risk factors detected.</p>
              )}
            </div>
          </article>

          <article className="card-panel bg-white/70 backdrop-blur-md hover-lift flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Shipment Status</p>
              <StatusBadge value={shipment.status} />
            </div>
            <div className="space-y-1 mt-4 text-sm font-medium">
              <p className="flex justify-between"><span className="text-slate-500">Departure:</span> <span>{shipment.shipmentDate}</span></p>
              <p className="flex justify-between"><span className="text-slate-500">Deadline:</span> <span className="text-rose-600">{shipment.deadline}</span></p>
            </div>
          </article>

          <article className="card-panel bg-white/70 backdrop-blur-md hover-lift flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Priority / Owner</p>
              <StatusBadge value={shipment.priority} />
            </div>
            <div className="mt-4 flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
               <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                 {shipment.assignedTo.charAt(0)}
               </div>
               <span className="text-sm font-bold text-navy-800">{shipment.assignedTo}</span>
            </div>
          </article>

          <article className="card-panel bg-white/70 backdrop-blur-md hover-lift">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Document Pulse</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-center">
                <span className="block text-xl font-bold text-emerald-600">{verifiedDocs}</span>
                <span className="text-[10px] uppercase font-bold text-emerald-700">Verified</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 text-center">
                <span className="block text-xl font-bold text-amber-600">{pendingDocs}</span>
                <span className="text-[10px] uppercase font-bold text-amber-700">Pending</span>
              </div>
            </div>
          </article>
        </section>

        {/* ── Documents & Checklist ── */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] animate-slide-up delay-100">
          <article className="card-panel">
            <div className="mb-4 flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="text-lg font-bold text-navy-800">Uploaded Documents</h3>
              <div className="flex gap-2">
                <Link to={`/shipments/${shipment.id}/upload`} className="btn-primary btn-sm">Upload</Link>
                <Link to={`/shipments/${shipment.id}/checklist`} className="btn-secondary btn-sm">Checklist</Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase border-b border-slate-100">
                    <th className="px-2 py-3">Type</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-2 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {shipment.documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-2 py-3">
                        <p className="font-semibold text-navy-800">{doc.type}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{doc.fileName}</p>
                      </td>
                      <td className="px-2 py-3"><StatusBadge value={doc.status} /></td>
                      <td className="px-2 py-3 text-right">
                        <button type="button" className="text-teal-600 font-bold text-xs hover:underline">Download</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="card-panel border-t-4 border-t-teal-500">
            <h3 className="text-lg font-bold text-navy-800 mb-4">Required Checklist</h3>
            <div className="space-y-2">
              {checklist.map((item) => {
                const isVerified = item.status === 'Verified';
                return (
                  <div key={item.type} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${isVerified ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isVerified ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                        {isVerified && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{item.type}</span>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        {/* ── Timeline & Comments ── */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr] animate-slide-up delay-200">
          <article className="card-panel">
            <h3 className="text-lg font-bold text-navy-800 mb-6">Activity Timeline</h3>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {timeline.slice(0, 6).map((event) => (
                <div key={event.id} className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 -ml-2 rounded-full border-4 border-white bg-teal-500" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{event.time.slice(0, 16).replace('T', ' ')}</p>
                  <p className="text-sm font-bold text-navy-800">{event.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{event.note}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card-panel">
            <h3 className="text-lg font-bold text-navy-800 mb-4">Comments</h3>
            <form className="mb-6" onSubmit={handleCommentSubmit}>
              <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                rows={2} 
                className="input-field mb-2" 
                placeholder="Add a team note..." 
              />
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal
                </label>
                <button type="submit" className="btn-primary btn-sm">Post Note</button>
              </div>
            </form>
            <div className="space-y-4">
              {visibleComments.map((comment) => (
                <div key={comment.id} className={`p-4 rounded-xl border ${comment.internal ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-navy-800">{comment.author}</span>
                    <span className="text-[10px] text-slate-400">{comment.createdAt.slice(0, 10)}</span>
                  </div>
                  <p className="text-sm text-slate-600">{comment.message}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </>
  );
}
