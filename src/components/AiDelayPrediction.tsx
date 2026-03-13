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
    let colorClass = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400';
    let progressColor = 'bg-emerald-500';

    if (probability > 70) {
      risk = 'High';
      colorClass = 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400';
      progressColor = 'bg-rose-500';
    } else if (probability > 35) {
      risk = 'Medium';
      colorClass = 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400';
      progressColor = 'bg-amber-500';
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

    return { probability, risk, colorClass, progressColor, reasons };
  }, [shipmentId]);

    return (
        <article className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden group shadow-sm transition-all hover:shadow-md h-full flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative flex flex-col h-full">
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 shadow-sm transition-transform group-hover:scale-105">
                            <AppIcon name="ai-extract" className="h-5 w-5" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Neural Prediction</span>
                    </div>
                    <span className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest shadow-sm ${prediction.colorClass}`}>
                        {prediction.risk} Risk
                    </span>
                </div>

                <div className="mb-6">
                    <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">{prediction.probability}%</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Delay Prob.</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner">
                        <div 
                            className={`h-full transition-all duration-1000 ${prediction.progressColor} ${prediction.probability > 70 ? 'animate-pulse' : ''}`} 
                            style={{ width: `${prediction.probability}%` }} 
                        />
                    </div>
                </div>

                <div className="flex-1 space-y-3 mb-6">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">Primary Factors</p>
                    <div className="space-y-2.5">
                        {prediction.reasons.map((reason, i) => (
                            <div key={i} className="flex gap-2.5 items-start">
                                <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${prediction.progressColor} opacity-70`} />
                                <p className="text-[11px] font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                                    {reason}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all hover:bg-teal-50 dark:hover:bg-teal-900/40 hover:text-teal-700 dark:hover:text-teal-400 hover:shadow-sm mt-auto group/btn">
                    View Mitigation Plan
                    <AppIcon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" strokeWidth={3} />
                </button>
            </div>
        </article>
    );
}
