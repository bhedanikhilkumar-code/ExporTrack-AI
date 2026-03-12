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
            <div className="card-surface p-6">
                <div className="flex items-center gap-2 mb-4">
                    <AppIcon name="ai-extract" className="h-5 w-5 text-teal-600 dark:text-teal-400 animate-icon-pulse" />
                    <h3 className="text-lg font-bold text-navy-800 dark:text-slate-100">AI Document Summary</h3>
                </div>
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                            <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card-surface p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <AppIcon name="ai-extract" className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-navy-800 dark:text-slate-100">AI Summary</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{docType}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <AppIcon name="check" className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {Math.round(summary.confidence * 100)}% Confidence
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Exporter */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                        Exporter
                    </p>
                    <p className="text-sm font-semibold text-navy-800 dark:text-slate-100 truncate">
                        {summary.exporter || '—'}
                    </p>
                </div>

                {/* Importer */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                        Importer
                    </p>
                    <p className="text-sm font-semibold text-navy-800 dark:text-slate-100 truncate">
                        {summary.importer || '—'}
                    </p>
                </div>

                {/* Amount */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                        Amount
                    </p>
                    <p className="text-sm font-semibold text-navy-800 dark:text-slate-100">
                        {summary.amount} {summary.currency}
                    </p>
                </div>

                {/* HS Code */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                        HS Code
                    </p>
                    <p className="text-sm font-semibold text-navy-800 dark:text-slate-100">
                        {summary.hsCode || '—'}
                    </p>
                </div>
            </div>

            {/* Product Description */}
            <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                    Product Description
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                    {summary.productDescription || 'No description available'}
                </p>
            </div>

            {/* Shipment Details */}
            <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                    Shipment Details
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                    {summary.shipmentDetails || 'No details available'}
                </p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                ✨ Summary generated by AI from {fileName}
            </p>
        </div>
    );
}
