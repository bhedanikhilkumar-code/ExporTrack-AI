import { useMemo } from 'react';
import AppIcon from './AppIcon';

interface AiDelayPredictionProps {
  shipmentId: string;
}

export default function AiDelayPrediction({ shipmentId }: AiDelayPredictionProps) {
  // Mock logic to generate data based on shipmentId
  const prediction = useMemo(() => {
    // Deterministic mock data based on ID string
    const id = shipmentId || '';
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const probability = (hash % 85) + 5; // 5% to 90%
    
    let risk: 'Low' | 'Medium' | 'High' = 'Low';
    let color = 'text-emerald-500';
    let bg = 'bg-emerald-50 dark:bg-emerald-900/20';
    let border = 'border-emerald-100 dark:border-emerald-800/40';

    if (probability > 70) {
      risk = 'High';
      color = 'text-rose-600 dark:text-rose-400';
      bg = 'bg-rose-50 dark:bg-rose-900/20';
      border = 'border-rose-100 dark:border-rose-800/40';
    } else if (probability > 35) {
      risk = 'Medium';
      color = 'text-amber-600 dark:text-amber-400';
      bg = 'bg-amber-50 dark:bg-amber-900/20';
      border = 'border-amber-100 dark:border-amber-800/40';
    }

    const allReasons = [
      'Port congestion at destination transshipment point',
      'Pending customs clearance for high-value items',
      'Weather-related slow steaming in North Atlantic',
      'Missing secondary commercial documentation',
      'Vessel maintenance delay at origin port',
      'Holiday backlog at regional distribution center'
    ];

    // Select 2-3 reasons based on hash
    const reasons = [
      allReasons[hash % allReasons.length],
      allReasons[(hash + 2) % allReasons.length]
    ];

    return { probability, risk, color, bg, border, reasons };
  }, [shipmentId]);

  return (
    <article className={`card-panel group relative overflow-hidden border-2 transition-all hover:shadow-xl ${prediction.border} ${prediction.bg}`}>
      <div className="absolute -right-4 -top-4 opacity-5 transition-transform group-hover:scale-110 group-hover:rotate-12">
        <AppIcon name="clock" className="h-24 w-24" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-white/50 dark:bg-slate-800/50 ${prediction.color}`}>
              <AppIcon name="ai-extract" className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800 dark:text-slate-100">Delay Prediction</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current ${prediction.color} bg-white/40 dark:bg-slate-900/40`}>
            {prediction.risk} Risk
          </span>
        </div>

        <div className="flex items-end gap-3 mb-6">
          <span className={`text-5xl font-black tracking-tighter ${prediction.color}`}>
            {prediction.probability}%
          </span>
          <div className="mb-1.5">
            <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 leading-none">Probability</p>
            <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-1">Calculated via Neural Engine v2.4</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-200/50 dark:border-slate-700/50 pt-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Contributing Factors</p>
          {prediction.reasons.map((reason, i) => (
            <div key={i} className="flex gap-3 items-start">
               <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${prediction.probability > 35 ? 'bg-amber-500' : 'bg-teal-500'}`} />
               <p className="text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
                 {reason}
               </p>
            </div>
          ))}
        </div>

        <button className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
          prediction.risk === 'High' 
            ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200 dark:shadow-rose-950/20' 
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}>
          Route Mitigation Strategy
        </button>
      </div>
    </article>
  );
}
