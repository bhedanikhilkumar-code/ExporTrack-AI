import { ChangeEvent, useState, memo } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import AppIcon from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';
import { DocStatus, REQUIRED_DOCUMENT_TYPES } from '../types';

const statusOptions: DocStatus[] = ['Pending', 'Verified', 'Missing', 'Rejected'];

export default function VerificationChecklistPage() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const {
    state: { shipments },
    updateDocumentStatus
  } = useAppContext();

  const [isExporting, setIsExporting] = useState(false);

  const shipment = shipments.find((item) => item.id === shipmentId);

  if (!shipment) {
    return (
      <main className="page-stack flex items-center justify-center py-20">
        <div className="card-premium max-w-md text-center">
           <div className="mx-auto h-20 w-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
             <AppIcon name="warning" className="h-10 w-10" />
           </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Shipment not found</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">The shipment you are looking for does not exist or has been archived.</p>
          <Link to="/dashboard" className="btn-primary w-full justify-center">
            Return to Dashboard
          </Link>
        </div>
      </main>
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

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      window.alert(`Compliance Report for ${shipment.id} generated and downloaded.`);
    }, 1500);
  };

  return (
    <main className="page-stack animate-in fade-in duration-500">
      <header className="dashboard-grid-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Link to={`/shipments/${shipment.id}`} className="text-[10px] font-black uppercase tracking-widest text-teal-600 hover:opacity-80 transition-opacity">
                Shipment {shipment.id}
             </Link>
             <AppIcon name="chevron-right" className="h-2 w-2 text-slate-400" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>
            Compliance Audit
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Mandatory document verification and export compliance checklist
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button
             onClick={handleExport}
             disabled={isExporting}
             className="btn-secondary inline-flex items-center gap-2"
           >
             {isExporting ? (
               <div className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
             ) : (
               <AppIcon name="file" className="h-4 w-4" />
             )}
             {isExporting ? 'Generating...' : 'Export Audit'}
           </button>
        </div>
      </header>

      <section className="card-premium overflow-hidden group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verification Integrity Score</p>
             <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mt-1">{progressPercent}% Completed</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 shadow-sm">
             <AppIcon name="shield" className="h-6 w-6" strokeWidth={2.5} />
          </div>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-teal-500 transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(20,184,166,0.4)]" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
        <p className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
           {verifiedCount} of {checklist.length} mandatory documents verified
        </p>
      </section>

      <section className="card-premium p-0 overflow-hidden shadow-xl border-slate-200/60 dark:border-slate-800/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Document Classification</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Reference</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {checklist.map((item) => (
                <tr key={item.type} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-300">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                         item.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-600' :
                         item.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                         'bg-slate-100 dark:bg-slate-800 text-slate-400'
                       }`}>
                          <AppIcon name={item.document ? 'check' : 'file'} className="h-4 w-4" strokeWidth={2.5} />
                       </div>
                       <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {item.document?.fileName ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="scale-90 origin-left">
                      <StatusBadge value={item.status} />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <select
                      value={item.status}
                      onChange={(event) => handleStatusChange(item.type, event)}
                      className="input-field py-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 dark:bg-slate-950 focus:border-teal-500 focus:ring-teal-500/20 w-44 transition-all"
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option.toUpperCase()}
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

      <footer className="flex flex-wrap items-center justify-between gap-6 pt-6">
        <div className="flex gap-3">
          <Link to={`/shipments/${shipment.id}`} className="btn-secondary py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest">
            <AppIcon name="shipments" className="h-4 w-4 mr-2" />
            Back to Shipment
          </Link>
          <Link to={`/shipments/${shipment.id}/ai-scan`} className="btn-secondary py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest">
            <AppIcon name="ai-extract" className="h-4 w-4 mr-2" />
            Neural Extraction
          </Link>
        </div>
        <button 
           onClick={() => window.alert('Compliance Audit Finalized and Saved.')}
           className="btn-primary py-3 px-10 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-500/20"
        >
          Finalize Audit
        </button>
      </footer>
    </main>
  );
}
