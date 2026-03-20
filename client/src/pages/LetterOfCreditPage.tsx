/**
 * Letter of Credit (LC) Management Page
 * Manage export finance documents — LC tracking, status, and compliance
 */
import { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import AppIcon from '../components/AppIcon';
import StatusBadge from '../components/StatusBadge';

export type LCStatus =
    | 'Draft'
    | 'Submitted to Bank'
    | 'Under Review'
    | 'Approved'
    | 'Discrepancy Found'
    | 'Negotiated'
    | 'Payment Received'
    | 'Expired';

export interface LetterOfCredit {
    id: string;
    lcNumber: string;
    shipmentId: string;
    clientName: string;
    issuingBank: string;
    advisingBank: string;
    amount: number;
    currency: string;
    expiryDate: string;
    latestShipmentDate: string;
    portOfLoading: string;
    portOfDischarge: string;
    status: LCStatus;
    lcType: 'Sight' | 'Usance' | 'Revolving' | 'Standby';
    documents: LCDocument[];
    discrepancies: string[];
    createdAt: string;
    notes?: string;
}

export interface LCDocument {
    name: string;
    required: boolean;
    submitted: boolean;
    copies: number;
}

const REQUIRED_LC_DOCS: LCDocument[] = [
    { name: 'Commercial Invoice', required: true, submitted: false, copies: 3 },
    { name: 'Bill of Lading', required: true, submitted: false, copies: 3 },
    { name: 'Packing List', required: true, submitted: false, copies: 2 },
    { name: 'Certificate of Origin', required: true, submitted: false, copies: 2 },
    { name: 'Insurance Certificate', required: true, submitted: false, copies: 1 },
    { name: 'Inspection Certificate', required: false, submitted: false, copies: 1 },
    { name: 'Weight Certificate', required: false, submitted: false, copies: 1 },
    { name: 'Phytosanitary Certificate', required: false, submitted: false, copies: 1 },
];

const STORAGE_KEY = 'exportrack_lc_records';

function getLCRecords(): LetterOfCredit[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : getSampleLCs();
    } catch {
        return getSampleLCs();
    }
}

function saveLCRecords(records: LetterOfCredit[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch { /* ignore */ }
}

function getSampleLCs(): LetterOfCredit[] {
    return [
        {
            id: 'LC-001',
            lcNumber: 'LC/2024/001234',
            shipmentId: 'SHP-001',
            clientName: 'Global Traders LLC',
            issuingBank: 'HSBC Bank, Dubai',
            advisingBank: 'State Bank of India, Mumbai',
            amount: 125000,
            currency: 'USD',
            expiryDate: '2024-06-30',
            latestShipmentDate: '2024-06-15',
            portOfLoading: 'JNPT, Mumbai',
            portOfDischarge: 'Jebel Ali, Dubai',
            status: 'Approved',
            lcType: 'Sight',
            documents: REQUIRED_LC_DOCS.map((d) => ({ ...d, submitted: d.required })),
            discrepancies: [],
            createdAt: '2024-03-01',
            notes: 'Partial shipments allowed. Transhipment not allowed.',
        },
        {
            id: 'LC-002',
            lcNumber: 'LC/2024/005678',
            shipmentId: 'SHP-002',
            clientName: 'Euro Imports GmbH',
            issuingBank: 'Deutsche Bank, Frankfurt',
            advisingBank: 'ICICI Bank, Chennai',
            amount: 87500,
            currency: 'EUR',
            expiryDate: '2024-07-15',
            latestShipmentDate: '2024-07-01',
            portOfLoading: 'Chennai Port',
            portOfDischarge: 'Hamburg Port',
            status: 'Discrepancy Found',
            lcType: 'Usance',
            documents: REQUIRED_LC_DOCS.map((d, i) => ({ ...d, submitted: i < 3 })),
            discrepancies: [
                'Invoice amount mismatch — LC amount USD 87,500 but invoice shows USD 88,200',
                'Bill of Lading date exceeds latest shipment date',
            ],
            createdAt: '2024-03-10',
        },
        {
            id: 'LC-003',
            lcNumber: 'LC/2024/009012',
            shipmentId: 'SHP-003',
            clientName: 'Asia Pacific Trading Co.',
            issuingBank: 'DBS Bank, Singapore',
            advisingBank: 'Axis Bank, Delhi',
            amount: 45000,
            currency: 'SGD',
            expiryDate: '2024-08-31',
            latestShipmentDate: '2024-08-15',
            portOfLoading: 'Mundra Port',
            portOfDischarge: 'Singapore Port',
            status: 'Under Review',
            lcType: 'Sight',
            documents: REQUIRED_LC_DOCS.map((d) => ({ ...d, submitted: false })),
            discrepancies: [],
            createdAt: '2024-03-15',
        },
    ];
}

const STATUS_COLORS: Partial<Record<LCStatus, string>> = {
    'Draft': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    'Submitted to Bank': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Under Review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Approved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Discrepancy Found': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Negotiated': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Payment Received': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    'Expired': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function LetterOfCreditPage() {
    const [records, setRecords] = useState<LetterOfCredit[]>(getLCRecords);
    const [selectedLC, setSelectedLC] = useState<LetterOfCredit | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState<LCStatus | 'all'>('all');
    const [newLC, setNewLC] = useState({
        lcNumber: '',
        shipmentId: '',
        clientName: '',
        issuingBank: '',
        advisingBank: '',
        amount: '',
        currency: 'USD',
        expiryDate: '',
        latestShipmentDate: '',
        portOfLoading: '',
        portOfDischarge: '',
        lcType: 'Sight' as LetterOfCredit['lcType'],
        notes: '',
    });

    const filtered = useMemo(() => {
        if (filterStatus === 'all') return records;
        return records.filter((r) => r.status === filterStatus);
    }, [records, filterStatus]);

    const stats = useMemo(() => ({
        total: records.length,
        approved: records.filter((r) => r.status === 'Approved').length,
        discrepancy: records.filter((r) => r.status === 'Discrepancy Found').length,
        pending: records.filter((r) => ['Draft', 'Submitted to Bank', 'Under Review'].includes(r.status)).length,
        totalValue: records.reduce((sum, r) => sum + r.amount, 0),
    }), [records]);

    function handleCreate() {
        if (!newLC.lcNumber || !newLC.clientName || !newLC.amount) return;
        const lc: LetterOfCredit = {
            id: `LC-${Date.now()}`,
            lcNumber: newLC.lcNumber,
            shipmentId: newLC.shipmentId,
            clientName: newLC.clientName,
            issuingBank: newLC.issuingBank,
            advisingBank: newLC.advisingBank,
            amount: parseFloat(newLC.amount),
            currency: newLC.currency,
            expiryDate: newLC.expiryDate,
            latestShipmentDate: newLC.latestShipmentDate,
            portOfLoading: newLC.portOfLoading,
            portOfDischarge: newLC.portOfDischarge,
            status: 'Draft',
            lcType: newLC.lcType,
            documents: REQUIRED_LC_DOCS.map((d) => ({ ...d })),
            discrepancies: [],
            createdAt: new Date().toISOString().split('T')[0],
            notes: newLC.notes,
        };
        const updated = [lc, ...records];
        setRecords(updated);
        saveLCRecords(updated);
        setShowCreateForm(false);
        setNewLC({ lcNumber: '', shipmentId: '', clientName: '', issuingBank: '', advisingBank: '', amount: '', currency: 'USD', expiryDate: '', latestShipmentDate: '', portOfLoading: '', portOfDischarge: '', lcType: 'Sight', notes: '' });
    }

    function updateStatus(id: string, status: LCStatus) {
        const updated = records.map((r) => r.id === id ? { ...r, status } : r);
        setRecords(updated);
        saveLCRecords(updated);
        if (selectedLC?.id === id) setSelectedLC({ ...selectedLC, status });
    }

    function toggleDocument(lcId: string, docName: string) {
        const updated = records.map((r) => {
            if (r.id !== lcId) return r;
            return {
                ...r,
                documents: r.documents.map((d) =>
                    d.name === docName ? { ...d, submitted: !d.submitted } : d
                ),
            };
        });
        setRecords(updated);
        saveLCRecords(updated);
        const updatedLC = updated.find((r) => r.id === lcId);
        if (updatedLC && selectedLC?.id === lcId) setSelectedLC(updatedLC);
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <PageHeader
                title="Letter of Credit"
                subtitle="Manage export LC documents, track bank submissions, and resolve discrepancies"
                action={
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        <AppIcon name="plus" className="w-4 h-4" />
                        New LC
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Total LCs', value: stats.total, color: 'text-slate-700 dark:text-slate-200', bg: 'bg-slate-100 dark:bg-slate-800' },
                    { label: 'Approved', value: stats.approved, color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Discrepancies', value: stats.discrepancy, color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                    { label: 'Pending', value: stats.pending, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Total Value', value: `$${(stats.totalValue / 1000).toFixed(0)}K`, color: 'text-teal-700 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
                ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'Draft', 'Submitted to Bank', 'Under Review', 'Approved', 'Discrepancy Found', 'Payment Received'] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${filterStatus === s
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                    >
                        {s === 'all' ? 'All' : s}
                    </button>
                ))}
            </div>

            {/* LC List */}
            <div className="space-y-3">
                {filtered.map((lc) => (
                    <div
                        key={lc.id}
                        onClick={() => setSelectedLC(selectedLC?.id === lc.id ? null : lc)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:border-teal-300 dark:hover:border-teal-600 transition-all"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{lc.lcNumber}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[lc.status]}`}>
                                        {lc.status}
                                    </span>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                                        {lc.lcType} LC
                                    </span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{lc.clientName}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span>{lc.currency} {lc.amount.toLocaleString()}</span>
                                    <span>Expires: {lc.expiryDate}</span>
                                    <span>{lc.portOfLoading} → {lc.portOfDischarge}</span>
                                </div>
                                {lc.discrepancies.length > 0 && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                                        <AppIcon name="alert-triangle" className="w-3.5 h-3.5" />
                                        {lc.discrepancies.length} discrepanc{lc.discrepancies.length > 1 ? 'ies' : 'y'} found
                                    </div>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {lc.documents.filter((d) => d.submitted).length}/{lc.documents.length} docs
                                </div>
                                <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                                    <div
                                        className="bg-teal-500 h-1.5 rounded-full"
                                        style={{ width: `${(lc.documents.filter((d) => d.submitted).length / lc.documents.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Expanded */}
                        {selectedLC?.id === lc.id && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                                {/* Bank Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Issuing Bank</p>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">{lc.issuingBank}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Advising Bank</p>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">{lc.advisingBank}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Latest Shipment Date</p>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">{lc.latestShipmentDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Shipment ID</p>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">{lc.shipmentId || '—'}</p>
                                    </div>
                                </div>

                                {/* Documents Checklist */}
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-2">Required Documents</p>
                                    <div className="space-y-1.5">
                                        {lc.documents.map((doc) => (
                                            <div
                                                key={doc.name}
                                                onClick={(e) => { e.stopPropagation(); toggleDocument(lc.id, doc.name); }}
                                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                                            >
                                                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${doc.submitted
                                                    ? 'bg-green-500 text-white'
                                                    : 'border-2 border-slate-300 dark:border-slate-600'
                                                    }`}>
                                                    {doc.submitted && <AppIcon name="check" className="w-3 h-3" />}
                                                </div>
                                                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{doc.name}</span>
                                                <span className="text-xs text-slate-400">{doc.copies} cop{doc.copies > 1 ? 'ies' : 'y'}</span>
                                                {doc.required && (
                                                    <span className="text-xs text-red-500 dark:text-red-400">Required</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Discrepancies */}
                                {lc.discrepancies.length > 0 && (
                                    <div>
                                        <p className="text-xs text-red-600 dark:text-red-400 uppercase font-medium mb-2">Discrepancies</p>
                                        <div className="space-y-1.5">
                                            {lc.discrepancies.map((d, i) => (
                                                <div key={i} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                    <AppIcon name="alert-triangle" className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-xs text-red-700 dark:text-red-400">{d}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {lc.notes && (
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Notes</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{lc.notes}</p>
                                    </div>
                                )}

                                {/* Status Actions */}
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-2">Update Status</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(['Submitted to Bank', 'Approved', 'Negotiated', 'Payment Received'] as LCStatus[]).map((s) => (
                                            <button
                                                key={s}
                                                onClick={(e) => { e.stopPropagation(); updateStatus(lc.id, s); }}
                                                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${lc.status === s
                                                        ? 'bg-teal-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <AppIcon name="file-text" className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">No LC records found</p>
                    </div>
                )}
            </div>

            {/* Create LC Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl my-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Create New LC</h3>
                            <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <AppIcon name="x" className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'LC Number', key: 'lcNumber', placeholder: 'LC/2024/001234' },
                                { label: 'Shipment ID', key: 'shipmentId', placeholder: 'SHP-001' },
                                { label: 'Client Name', key: 'clientName', placeholder: 'Client company name' },
                                { label: 'Issuing Bank', key: 'issuingBank', placeholder: 'Bank name and location' },
                                { label: 'Advising Bank', key: 'advisingBank', placeholder: 'Bank name and location' },
                                { label: 'Port of Loading', key: 'portOfLoading', placeholder: 'JNPT, Mumbai' },
                                { label: 'Port of Discharge', key: 'portOfDischarge', placeholder: 'Jebel Ali, Dubai' },
                            ].map(({ label, key, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                                    <input
                                        type="text"
                                        placeholder={placeholder}
                                        value={newLC[key as keyof typeof newLC]}
                                        onChange={(e) => setNewLC({ ...newLC, [key]: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Amount</label>
                                    <input
                                        type="number"
                                        placeholder="100000"
                                        value={newLC.amount}
                                        onChange={(e) => setNewLC({ ...newLC, amount: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Currency</label>
                                    <select
                                        value={newLC.currency}
                                        onChange={(e) => setNewLC({ ...newLC, currency: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        {['USD', 'EUR', 'GBP', 'SGD', 'AED', 'JPY', 'INR'].map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={newLC.expiryDate}
                                        onChange={(e) => setNewLC({ ...newLC, expiryDate: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">LC Type</label>
                                    <select
                                        value={newLC.lcType}
                                        onChange={(e) => setNewLC({ ...newLC, lcType: e.target.value as LetterOfCredit['lcType'] })}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        {['Sight', 'Usance', 'Revolving', 'Standby'].map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Notes</label>
                                <textarea
                                    placeholder="Special conditions, partial shipment allowed, etc."
                                    value={newLC.notes}
                                    onChange={(e) => setNewLC({ ...newLC, notes: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                            >
                                Create LC
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}