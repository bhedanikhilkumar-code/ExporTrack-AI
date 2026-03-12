import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import AppIcon from '../components/AppIcon';
import StatusBadge from '../components/StatusBadge';
import { REQUIRED_DOCUMENT_TYPES, Shipment } from '../types';

interface ComplianceReport {
  shipmentId: string;
  client: string;
  status: 'Safe' | 'Warning' | 'Risk';
  issues: string[];
  recommendations: string[];
}

export default function AiComplianceCopilotPage() {
  const { state: { shipments } } = useAppContext();

  const reports = useMemo(() => {
    return shipments.map((shipment: Shipment): ComplianceReport => {
      const issues: string[] = [];
      const recommendations: string[] = [];
      let status: 'Safe' | 'Warning' | 'Risk' = 'Safe';

      // Check for missing mandatory documents
      for (const type of REQUIRED_DOCUMENT_TYPES) {
        const doc = shipment.documents.find(d => d.type === type);
        if (!doc || doc.status === 'Missing') {
          issues.push(`Mandatory document ${type} is missing.`);
          recommendations.push(`Upload the ${type} as soon as possible.`);
          status = 'Risk';
        } else if (doc.status === 'Rejected') {
          issues.push(`Mandatory document ${type} was rejected.`);
          recommendations.push(`Review the rejection reason for ${type} and re-upload.`);
          status = 'Risk';
        } else if (doc.status === 'Pending') {
          if (status !== 'Risk') {
            status = 'Warning';
          }
          issues.push(`${type} is awaiting verification.`);
          recommendations.push(`Verify the ${type} to move to safe status.`);
        }
      }

      // Additional logic for delays
      if (shipment.delayed) {
        if (status !== 'Risk') status = 'Warning';
        issues.push('Shipment is currently delayed.');
        recommendations.push('Contact logistics provider for status update.');
      }

      if (issues.length === 0) {
        recommendations.push('All documents are in order. No action required.');
      }

      return {
        shipmentId: shipment.id,
        client: shipment.clientName,
        status,
        issues,
        recommendations
      };
    });
  }, [shipments]);

  return (
    <div className="page-stack">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-navy-800 dark:text-white">AI Compliance Copilot</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Intelligent document audit and risk mitigation for your shipments.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-teal-50 dark:bg-teal-900/20 px-4 py-2 border border-teal-100 dark:border-teal-800">
           <AppIcon name="shield" className="h-5 w-5 text-teal-600 dark:text-teal-400" />
           <span className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-widest">AI Audit Active</span>
        </div>
      </div>

      <div className="grid gap-6">
        {reports.map((report) => (
          <article key={report.shipmentId} className={`card-panel border-l-4 ${
            report.status === 'Risk' ? 'border-l-rose-500' : 
            report.status === 'Warning' ? 'border-l-amber-500' : 
            'border-l-emerald-500'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                  report.status === 'Risk' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 
                  report.status === 'Warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 
                  'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}>
                  <AppIcon name="shield" className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-800 dark:text-white">{report.shipmentId}</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{report.client}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${
                  report.status === 'Risk' ? 'bg-rose-100 text-rose-600 dark:bg-rose-600 dark:text-white' : 
                  report.status === 'Warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-600 dark:text-white' : 
                  'bg-emerald-100 text-emerald-600 dark:bg-emerald-600 dark:text-white'
                }`}>
                  {report.status}
                </span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Detected Issues</h4>
                <ul className="space-y-2">
                  {report.issues.map((issue, i) => (
                    <li key={i} className="flex gap-2 items-start text-sm font-medium text-slate-700 dark:text-slate-200">
                      <AppIcon name="warning" className={`h-4 w-4 mt-0.5 shrink-0 ${report.status === 'Risk' ? 'text-rose-500' : 'text-amber-500'}`} />
                      {issue}
                    </li>
                  ))}
                  {report.issues.length === 0 && (
                    <li className="flex gap-2 items-start text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <AppIcon name="check" className="h-4 w-4 mt-0.5 shrink-0" />
                      No compliance issues detected.
                    </li>
                  )}
                </ul>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">AI Recommendations</h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <ul className="space-y-3">
                    {report.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <div className="h-5 w-5 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">{i + 1}</span>
                        </div>
                        <p className="text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300">{rec}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button className="btn-secondary btn-sm">Generate Full Audit Log</button>
            </div>
          </article>
        ))}
      </div>

      <article className="card-panel bg-navy-900 border-none text-white mt-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <AppIcon name="shield" className="h-32 w-32" />
        </div>
        <div className="relative">
          <h3 className="text-xl font-bold mb-2">Automated Compliance Monitoring</h3>
          <p className="text-navy-300 text-sm max-w-2xl">
            The AI Compliance Copilot runs real-time audits on every shipment. It uses deep learning to identify missing data patterns and potential regulatory bottlenecks before they cause delays in your export operations.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex-1 min-w-[200px]">
              <p className="text-[10px] font-bold uppercase text-navy-400 mb-1">Global Audit Node</p>
              <p className="text-lg font-bold">Node-04 Active</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex-1 min-w-[200px]">
              <p className="text-[10px] font-bold uppercase text-navy-400 mb-1">Last Full Scan</p>
              <p className="text-lg font-bold">2 Minutes Ago</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
