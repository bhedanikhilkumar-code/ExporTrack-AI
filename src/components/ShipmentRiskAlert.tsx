import React from 'react';
import AppIcon from './AppIcon';

interface ShipmentRiskAlertProps {
  shipmentId: string;
  isDelayed?: boolean;
}

export default function ShipmentRiskAlert({ shipmentId, isDelayed }: ShipmentRiskAlertProps) {
  // Mock risk detection logic
  const id = shipmentId || '';
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hasRisk = (hash % 5) === 0 || isDelayed; // Deterministic risk for demo
  
  if (!hasRisk) return null;

  const risks = [
    { reason: 'Severe tropical storm in East Pacific lane', delay: '+24h' },
    { reason: 'Vessel scheduling conflict at primary transshipment hub', delay: '+12.5h' },
    { reason: 'Customs backlog at destination port', delay: '+36h' },
    { reason: 'Incomplete secondary documentation (Form 22-B)', delay: '+8h' }
  ];

  const selectedRisk = risks[hash % risks.length];

  return (
    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-5 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 shadow-sm animate-pulse">
          <AppIcon name="warning" className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black uppercase tracking-widest text-rose-800 dark:text-rose-400">⚠ Delivery Delay Risk</h4>
            <span className="text-[10px] font-black uppercase tracking-widest bg-rose-600 text-white px-2 py-0.5 rounded shadow-sm">Critical Alert</span>
          </div>
          <p className="text-xs font-bold text-rose-700 dark:text-rose-300 leading-relaxed">
            {selectedRisk.reason}
          </p>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-rose-200/50 dark:border-rose-800/50">
             <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-rose-500/70">Est. Delay</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400">{selectedRisk.delay}</span>
             </div>
             <div className="h-6 w-px bg-rose-200/50 dark:border-rose-800/50 mx-1" />
             <button className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:text-rose-500 transition-colors underline decoration-2 underline-offset-4">
                View Mitigation Protocol
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
