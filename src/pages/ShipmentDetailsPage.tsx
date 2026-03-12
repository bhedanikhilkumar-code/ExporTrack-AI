import { FormEvent, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import AppIcon from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';
import { REQUIRED_DOCUMENT_TYPES } from '../types';
import AiDelayPrediction from '../components/AiDelayPrediction';
import ShipmentTimeline from '../components/ShipmentTimeline';

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

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .hover-lift { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-4px); }
      `}</style>

      <div className="page-stack pb-12">
        <PageHeader
          title={`Shipment Details: ${shipment.id}`}
          subtitle={`${shipment.clientName} • ${shipment.destinationCountry} • Container ${shipment.containerNumber}`}
          action={
            <div className="flex gap-3">
              <Link to={`/ai-extraction`} className="btn-secondary dark:bg-slate-800 dark:border-slate-700 dark:text-teal-400">
                AI Extraction
              </Link>
              <button type="button" className="btn-primary shadow-soft bg-gradient-to-r from-teal-600 to-navy-700 border-none">
                Export Data
              </button>
            </div>
          }
        />

        {/* ── Shipment Summary & Risk ── */}
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-5 animate-slide-up">
          <article className="card-panel relative overflow-hidden bg-gradient-to-br from-navy-800 to-navy-900 border-none text-white hover-lift">
            <p className="text-[11px] uppercase tracking-wider text-navy-200 font-bold mb-3">Overall Progress</p>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold">{completion}%</span>
              <span className="text-xs text-navy-200 mb-1">Verified</span>
            </div>
            <div className="mt-4 bg-navy-900/50 rounded-full h-2.5 overflow-hidden border border-navy-700">
              <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-300 transition-all duration-1000" style={{ width: `${completion}%` }} />
            </div>
          </article>

          {/* Risk Score Widget */}
          <article className="card-panel bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-900/30 hover-lift lg:col-span-1">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-2">Shipment Risk Score</p>
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-bold ${getRiskColor(riskScore)}`}>{riskScore}%</span>
              <svg className={`w-8 h-8 ${riskScore > 50 ? 'text-rose-500' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="mt-3 space-y-1">
              {riskFactors.length > 0 ? (
                riskFactors.slice(0, 3).map((factor, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate">{factor}</span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold italic">No active risks.</p>
              )}
            </div>
          </article>

          <article className="card-panel bg-white/70 backdrop-blur-md dark:bg-slate-900/70 hover-lift flex flex-col justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-3">Status</p>
              <StatusBadge value={shipment.status} />
            </div>
            <div className="space-y-1 mt-4 text-xs font-bold text-slate-600 dark:text-slate-300">
              <p className="flex justify-between"><span>Departure:</span> <span>{shipment.shipmentDate}</span></p>
              <p className="flex justify-between"><span>Deadline:</span> <span className="text-rose-600 dark:text-rose-400">{shipment.deadline}</span></p>
            </div>
          </article>

          <article className="card-panel bg-white/70 backdrop-blur-md dark:bg-slate-900/70 hover-lift">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-3">Priority / Handler</p>
            <StatusBadge value={shipment.priority} />
            <div className="mt-4 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-[10px]">
                {shipment.assignedTo.charAt(0)}
              </div>
              <span className="text-xs font-bold text-navy-800 dark:text-slate-200">{shipment.assignedTo}</span>
            </div>
          </article>

          <article className="card-panel bg-white/70 backdrop-blur-md dark:bg-slate-900/70 hover-lift">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-3">Verification Info</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded p-2 text-center">
                <span className="block text-lg font-bold text-emerald-600 dark:text-emerald-400">{verifiedDocs}</span>
                <span className="text-[8px] uppercase font-bold text-emerald-700 dark:text-emerald-500">Passed</span>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded p-2 text-center">
                <span className="block text-lg font-bold text-amber-600 dark:text-amber-400">{pendingDocs}</span>
                <span className="text-[8px] uppercase font-bold text-amber-700 dark:text-amber-500">Wait</span>
              </div>
            </div>
          </article>
        </section>

        {/* ── AI Insights Row ── */}
        <section className="mt-6 grid gap-6 lg:grid-cols-3 animate-slide-up delay-75">
          <div className="lg:col-span-1">
            <AiDelayPrediction shipmentId={shipment.id} />
          </div>

          <article className="lg:col-span-2 card-panel bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-teal-100 dark:border-teal-900/30">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-6">
              <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30">
                <AppIcon name="ai-extract" className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider">AI Route Intelligence</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-3 tracking-widest">Efficiency Benchmark</p>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full border-4 border-teal-100 dark:border-teal-900/30 flex items-center justify-center">
                    <span className="text-xl font-black text-navy-800 dark:text-teal-400">92%</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Above Average</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Performance vs Peer Lanes</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Dynamic Recommendations</p>
                <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-900/20 border border-teal-100/50 dark:border-teal-900/30">
                  <p className="text-xs font-semibold text-teal-800 dark:text-teal-300">Alternate port suggested for transshipment to save ~14h lead time.</p>
                </div>
                <button className="text-xs font-black text-teal-600 dark:text-teal-400 hover:underline uppercase tracking-widest">
                  View Optimal Route Maps →
                </button>
              </div>
            </div>
          </article>
        </section>

        {/* ── Documents & Checklist ── */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] animate-slide-up delay-100">
          <article className="card-panel">
            <div className="mb-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-navy-800 dark:text-slate-100 uppercase tracking-wide">Documents Log</h3>
              <Link to={`/shipments/${shipment.id}/upload`} className="btn-primary btn-sm">Upload New</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase border-b border-slate-100 dark:border-slate-800">
                    <th className="px-2 py-3">Document Type</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-2 py-3 text-right">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {shipment.documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-2 py-3">
                        <p className="font-bold text-navy-800 dark:text-slate-200">{doc.type}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">{doc.fileName}</p>
                      </td>
                      <td className="px-2 py-3"><StatusBadge value={doc.status} /></td>
                      <td className="px-2 py-3 text-right">
                        <button type="button" className="text-teal-600 dark:text-teal-400 font-bold text-xs">View Original</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="card-panel border-t-4 border-t-teal-500">
            <h3 className="text-base font-bold text-navy-800 dark:text-slate-100 mb-4 uppercase tracking-wide">Mandatory Checklist</h3>
            <div className="space-y-2">
              {checklist.map((item) => {
                const isVerified = item.status === 'Verified';
                return (
                  <div key={item.type} className={`p-2.5 rounded-xl border flex items-center justify-between ${isVerified ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isVerified ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        {isVerified && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.type}</span>
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
          <ShipmentTimeline events={timeline} />

          <article className="card-panel">
            <h3 className="text-base font-bold text-navy-800 dark:text-slate-100 mb-4 uppercase tracking-wide">Collaboration</h3>
            <form className="mb-6" onSubmit={handleCommentSubmit}>
              <textarea
                value={message} onChange={(e) => setMessage(e.target.value)}
                rows={2} className="input-field mb-2 text-xs"
                placeholder="Team message..."
              />
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase cursor-pointer">
                  <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Private Note
                </label>
                <button type="submit" className="btn-primary btn-sm px-4">Post</button>
              </div>
            </form>
            <div className="space-y-3">
              {visibleComments.map((comment) => (
                <div key={comment.id} className={`p-3 rounded-xl border ${comment.internal ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30' : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-navy-800 dark:text-slate-200">{comment.author}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{comment.createdAt.slice(8, 10)}-{comment.createdAt.slice(5, 7)}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{comment.message}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </>
  );
}
