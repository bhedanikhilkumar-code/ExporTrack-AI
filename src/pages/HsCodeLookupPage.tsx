/**
 * Customs HS Code Lookup Page
 * Harmonized System (HS) Code lookup for export compliance
 * Helps exporters find correct HS codes for their products
 */
import { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import AppIcon from '../components/AppIcon';

interface HsCodeEntry {
    code: string;
    description: string;
    category: string;
    dutyRate: string;
    gstRate: string;
    exportPolicy: 'Free' | 'Restricted' | 'Prohibited' | 'STE';
    notes?: string;
}

// Comprehensive HS Code database for common Indian exports
const HS_CODE_DATABASE: HsCodeEntry[] = [
    // Textiles
    { code: '5208.11', description: 'Woven fabrics of cotton, plain weave, unbleached', category: 'Textiles', dutyRate: '0%', gstRate: '5%', exportPolicy: 'Free' },
    { code: '6109.10', description: 'T-shirts, singlets and other vests of cotton, knitted', category: 'Textiles', dutyRate: '0%', gstRate: '12%', exportPolicy: 'Free' },
    { code: '6204.62', description: "Women's trousers of cotton", category: 'Textiles', dutyRate: '0%', gstRate: '12%', exportPolicy: 'Free' },
    { code: '5407.61', description: 'Woven fabrics of synthetic filament yarn', category: 'Textiles', dutyRate: '0%', gstRate: '5%', exportPolicy: 'Free' },
    { code: '6302.21', description: 'Bed linen of cotton, printed', category: 'Textiles', dutyRate: '0%', gstRate: '5%', exportPolicy: 'Free' },

    // Electronics
    { code: '8471.30', description: 'Portable automatic data processing machines (laptops)', category: 'Electronics', dutyRate: '0%', gstRate: '18%', exportPolicy: 'Free' },
    { code: '8517.12', description: 'Telephones for cellular networks (mobile phones)', category: 'Electronics', dutyRate: '0%', gstRate: '18%', exportPolicy: 'Free' },
    { code: '8542.31', description: 'Electronic integrated circuits — processors', category: 'Electronics', dutyRate: '0%', gstRate: '18%', exportPolicy: 'Free' },
    { code: '8528.72', description: 'Color television receivers', category: 'Electronics', dutyRate: '0%', gstRate: '28%', exportPolicy: 'Free' },
    { code: '8544.42', description: 'Electric conductors, voltage ≤ 1000V, fitted with connectors', category: 'Electronics', dutyRate: '0%', gstRate: '18%', exportPolicy: 'Free' },

    // Pharmaceuticals
    { code: '3004.90', description: 'Medicaments for therapeutic use, mixed or unmixed', category: 'Pharmaceuticals', dutyRate: '0%', gstRate: '12%', exportPolicy: 'Free', notes: 'Requires drug export license' },
    { code: '3002.12', description: 'Vaccines for human medicine', category: 'Pharmaceuticals', dutyRate: '0%', gstRate: '5%', exportPolicy: 'Restricted', notes: 'Prior approval from CDSCO required' },
    { code: '3003.20', description: 'Medicaments containing antibiotics', category: 'Pharmaceuticals', dutyRate: '0%', gstRate: '12%', exportPolicy: 'Free' },
    { code: '3006.60', description: 'Chemical contraceptive preparations', category: 'Pharmaceuticals', dutyRate: '0%', gstRate: '12%', exportPolicy: 'Free' },

    // Agricultural Products
    { code: '1006.30', description: 'Semi-milled or wholly milled rice', category: 'Agriculture', dutyRate: '0%', gstRate: '0%', exportPolicy: 'Restricted', notes: 'Subject to MEP (Minimum Export Price)' },
    { code: '1001.19', description: 'Durum wheat, other than seed', category: 'Agriculture', dutyRate: '0%', gstRate: '0%', exportPolicy: 'Restricted' },
    { code: '0803.90', description: 'Bananas, fresh or dried', category: 'Agriculture', dutyRate: '0%', gstRate: '0%', exportPolicy: 'Free' },
    { code: '0901.11', description: 'Coffee, not roasted, not decaffeinated', category: 'Agriculture', dutyRate: '0%', gstRate: '0%', exportPolicy: 'Free' },
    { code: '0902.10', description: 'Green tea (not fermented)', category: 'Agriculture', dutyRate: '0%', gstRate: '5%', exportPolicy: 'Free' },
    { code: '0803.10', description: 'Plantains, fresh or dried', category: 'Agriculture', dutyRate: '0%', gstRate: '0%', exportPolicy: 'Free' },
    { code: '2401.10', description: 'Tobacco, not stemmed/stripped', category: 'Agriculture', dutyRate: '0%', gstRate: '28%', exportPolicy: 'Free' },

    // Chemicals
    { code: '2902.20', description: 'Benzene', category: 'Chemicals', dutyRate: '0%', gstRate: '18%', exportPolicy: 'Free', notes: 'Hazardous material — special packaging required' },
    { code: '2814.10', description: 'Anhydrous ammonia', category: 'Chemicals', dutyRate: '0%', gstRate: '18%', exportPolicy: 'Restricted' },
    { code: '3102.10', description: 'Urea, whether or not in aqueous solution', category: 'Chemicals', dutyRate: '0%', gstRate: '5%', exportPolicy: 'Restricted', notes: 'Canalized through STE' },
    { code: '2804.10', description: 'Hydrogen', category: 'Chemicals', dutyRate: '0%', gstRate: '18%', exportPolicy: 'Free' },

    // Gems & Jewelry
    { code: '7102.31', description: 'Diamonds, non-industrial, unworked or simply sawn', category: 'Gems & Jewelry', dutyRate: '0%', gstRate: '0.25%', exportPolicy: 'Free', notes: 'Kimberley Process Certificate required' },
    { code: '7113.19', description: 'Articles of jewelry of other precious metal', category: 'Gems & Jewelry', dutyRate: '0%', gstRate: '3%', exportPolicy: 'Free' },
    { code: '7108.12', description: 'Gold in non-monetary form, other unwrought forms', category: 'Gems & Jewelry', dutyRate: '0%', gstRate: '3%', exportPolicy: 'Restricted' },

    // Machinery
    { code: '8429.51', description: 'Front-end shovel loaders (construction machinery)', category: 'Machinery', dutyRate: '0%', gstRate: '28%', exportPolicy: 'Free' },
    { code: '8481.80', description: 'Taps, cocks, valves and similar appliances', category: 'Machinery', dutyRate: '0%', gstRate: '18%', exportPolicy: 'Free' },
    { code: '8413.11', description: 'Pumps for dispensing fuel or lubricants', category: 'Machinery', dutyRate: '0%', gstRate: '18%', exportPolicy: 'Free' },

    // Automotive
    { code: '8703.23', description: 'Motor cars with spark-ignition engine, 1000-1500cc', category: 'Automotive', dutyRate: '0%', gstRate: '28%', exportPolicy: 'Free' },
    { code: '8708.29', description: 'Parts and accessories of motor vehicles', category: 'Automotive', dutyRate: '0%', gstRate: '28%', exportPolicy: 'Free' },
    { code: '4011.10', description: 'New pneumatic tyres of rubber for motor cars', category: 'Automotive', dutyRate: '0%', gstRate: '28%', exportPolicy: 'Free' },

    // Food Products
    { code: '1602.32', description: 'Prepared or preserved meat of fowls', category: 'Food', dutyRate: '0%', gstRate: '12%', exportPolicy: 'Free' },
    { code: '2106.90', description: 'Food preparations not elsewhere specified', category: 'Food', dutyRate: '0%', gstRate: '18%', exportPolicy: 'Free' },
    { code: '1905.31', description: 'Sweet biscuits', category: 'Food', dutyRate: '0%', gstRate: '18%', exportPolicy: 'Free' },
    { code: '2009.11', description: 'Orange juice, frozen', category: 'Food', dutyRate: '0%', gstRate: '12%', exportPolicy: 'Free' },

    // Leather
    { code: '4203.10', description: 'Articles of apparel of leather', category: 'Leather', dutyRate: '0%', gstRate: '18%', exportPolicy: 'Free' },
    { code: '6403.99', description: 'Footwear with outer soles of rubber/plastics, leather uppers', category: 'Leather', dutyRate: '0%', gstRate: '18%', exportPolicy: 'Free' },
    { code: '4202.11', description: 'Trunks, suit-cases, vanity-cases of leather', category: 'Leather', dutyRate: '0%', gstRate: '28%', exportPolicy: 'Free' },
];

const CATEGORIES = ['All', ...Array.from(new Set(HS_CODE_DATABASE.map((h) => h.category))).sort()];

const POLICY_COLORS: Record<string, string> = {
    Free: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Restricted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Prohibited: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    STE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function HsCodeLookupPage() {
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedEntry, setSelectedEntry] = useState<HsCodeEntry | null>(null);
    const [copied, setCopied] = useState('');

    const results = useMemo(() => {
        return HS_CODE_DATABASE.filter((entry) => {
            const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory;
            if (!query.trim()) return matchesCategory;
            const q = query.toLowerCase();
            return (
                matchesCategory &&
                (entry.code.includes(q) ||
                    entry.description.toLowerCase().includes(q) ||
                    entry.category.toLowerCase().includes(q))
            );
        });
    }, [query, selectedCategory]);

    function copyCode(code: string) {
        navigator.clipboard.writeText(code).catch(() => { });
        setCopied(code);
        setTimeout(() => setCopied(''), 2000);
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <PageHeader
                title="HS Code Lookup"
                subtitle="Find Harmonized System codes for export compliance — search by product name or HS code"
            />

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
                <AppIcon name="shield" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Export Compliance Tool</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                        HS codes are required on all export documents (Invoice, Shipping Bill, Bill of Lading).
                        Incorrect HS codes can lead to customs delays or penalties.
                    </p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <AppIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by product name or HS code (e.g. 'cotton', '8471', 'laptop')..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Stats */}
            <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{results.length}</span> of {HS_CODE_DATABASE.length} HS codes
            </div>

            {/* Results Grid */}
            <div className="grid gap-3">
                {results.map((entry) => (
                    <div
                        key={entry.code}
                        onClick={() => setSelectedEntry(selectedEntry?.code === entry.code ? null : entry)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:border-teal-300 dark:hover:border-teal-600 transition-all"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-sm font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded">
                                        {entry.code}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                        {entry.category}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${POLICY_COLORS[entry.exportPolicy]}`}>
                                        {entry.exportPolicy}
                                    </span>
                                </div>
                                <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300">{entry.description}</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); copyCode(entry.code); }}
                                className="flex-shrink-0 p-2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                                title="Copy HS Code"
                            >
                                <AppIcon name={copied === entry.code ? 'check' : 'copy'} className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Expanded details */}
                        {selectedEntry?.code === entry.code && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Duty Rate</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{entry.dutyRate}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">GST Rate</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{entry.gstRate}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Export Policy</p>
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium mt-1 ${POLICY_COLORS[entry.exportPolicy]}`}>
                                        {entry.exportPolicy}
                                    </span>
                                </div>
                                {entry.notes && (
                                    <div className="col-span-2 md:col-span-4">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Important Notes</p>
                                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1 flex items-start gap-1.5">
                                            <AppIcon name="alert-triangle" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            {entry.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {results.length === 0 && (
                    <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <AppIcon name="search" className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">No HS codes found for "{query}"</p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Try different keywords or browse by category</p>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Export Policy Legend:</p>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(POLICY_COLORS).map(([policy, color]) => (
                        <span key={policy} className={`text-xs px-2 py-1 rounded font-medium ${color}`}>
                            {policy} — {
                                policy === 'Free' ? 'No restrictions' :
                                    policy === 'Restricted' ? 'Prior approval needed' :
                                        policy === 'Prohibited' ? 'Export not allowed' :
                                            'State Trading Enterprise only'
                            }
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
