import AppIcon from './AppIcon';

interface DocumentSummary {
    exporter: string;
    importer: string;
    amount: string;
    currency: string;
    hsCode: string;
    productDescription: string;
    shipmentDetails: string;
    confidence: number;
}

interface AiDocumentSummaryProps {
    fileName: string;
    docType: string;
    summary: DocumentSummary;
    isLoading?: boolean;
}

export default function AiDocumentSummary({ fileName, docType, summary, isLoading }: AiDocumentSummaryProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden group shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center gap-3 mb-6 relative">
                    <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center animate-pulse shadow-sm">
                        <AppIcon name="ai-extract" className="h-5 w-5 text-teal-600 dark:text-teal-400" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">AI Summary Generation</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Analyzing Document...</p>
                    </div>
                </div>
                <div className="space-y-4 relative">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded flex-shrink-0 animate-pulse" />
                            <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shadow-sm">
                            <AppIcon name="ai-extract" className="h-5 w-5 text-teal-600 dark:text-teal-400" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">AI Summary</h3>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mt-0.5">{docType}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 shadow-sm w-fit transition-transform hover:scale-105">
                        <AppIcon name="check" className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            {Math.round(summary.confidence * 100)}% Confidence
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Exporter */}
                    <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/40 transition-colors">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                            Exporter
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {summary.exporter || '—'}
                        </p>
                    </div>

                    {/* Importer */}
                    <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/40 transition-colors">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                            Importer
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {summary.importer || '—'}
                        </p>
                    </div>

                    {/* Amount */}
                    <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/40 transition-colors">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                            Amount
                        </p>
                        <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                            {summary.currency} {summary.amount} 
                        </p>
                    </div>

                    {/* HS Code */}
                    <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/40 transition-colors">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                            HS Code
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                            {summary.hsCode || '—'}
                        </p>
                    </div>
                </div>

                {/* Product Description */}
                <div className="mt-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/40 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                        Product Description
                    </p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                        {summary.productDescription || 'No description available'}
                    </p>
                </div>

                {/* Shipment Details */}
                <div className="mt-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/40 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                        Shipment Details
                    </p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                        {summary.shipmentDetails || 'No details available'}
                    </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-slate-400">
                    <AppIcon name="ai-extract" className="h-3 w-3" strokeWidth={3} />
                    <span>Summary generated from {fileName}</span>
                </div>
            </div>
        </div>
    );
}
