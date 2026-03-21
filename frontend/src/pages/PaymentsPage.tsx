import React, { useState, useEffect, useMemo } from 'react';
import AppIcon from '../components/AppIcon';
import { Payment } from '../types/payment';

// Dummy data for testing offline or loading states
const DUMMY_PAYMENTS: Payment[] = [
  {
    id: 'PAY-1',
    referenceNo: 'UTR-XYZ-102938',
    buyerId: 'b-1',
    invoiceId: 'INV-2024-001',
    amount: 150000.00,
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    method: 'Wire Transfer',
    status: 'Completed',
    notes: 'Advance payment for Order #100'
  },
  {
    id: 'PAY-2',
    referenceNo: 'LC-9988776655',
    buyerId: 'b-2',
    amount: 45000.00,
    currency: 'EUR',
    date: new Date().toISOString().split('T')[0],
    method: 'Letter of Credit',
    status: 'Pending',
  }
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  // New Payment Form State
  const [formData, setFormData] = useState<Partial<Payment>>({
    referenceNo: '',
    buyerId: '',
    invoiceId: '',
    amount: 0,
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    method: 'Wire Transfer',
    status: 'Pending',
    notes: ''
  });

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payments/list');
      if (res.ok) {
        const json = await res.json();
        setPayments(json.data && json.data.length > 0 ? json.data : DUMMY_PAYMENTS);
      } else {
        setPayments(DUMMY_PAYMENTS);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setPayments(DUMMY_PAYMENTS);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const query = searchQuery.toLowerCase();
      return p.referenceNo.toLowerCase().includes(query) || 
             p.buyerId.toLowerCase().includes(query) ||
             p.invoiceId?.toLowerCase().includes(query);
    });
  }, [payments, searchQuery]);

  const metrics = useMemo(() => {
    const totalReceived = payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
    return { totalReceived, totalPending, count: payments.length };
  }, [payments]);

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast('Payment recorded successfully');
        fetchPayments();
        setIsDrawerOpen(false);
        setFormData({ referenceNo: '', buyerId: '', invoiceId: '', amount: 0, currency: 'USD', date: new Date().toISOString().split('T')[0], method: 'Wire Transfer', status: 'Pending', notes: '' });
      } else {
        const errorData = await res.json();
        showToast(errorData.message || 'Failed to save', 'error');
      }
    } catch (err) {
      showToast('Network error while saving payment', 'error');
    }
  };

  const deletePayment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    try {
      const res = await fetch(`/api/payments/delete?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Deleted successfully');
        fetchPayments();
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'Failed': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Payments & Remittances</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Track incoming SWIFT transfers, LCs, and general remittances.</p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-teal-500/20 transition-all hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <AppIcon name="plus" className="h-4 w-4" />
          Log Payment
        </button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-premium p-5 border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Received</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            <span className="text-emerald-500 mr-1">$</span>
            {metrics.totalReceived.toLocaleString()}
          </h3>
        </div>
        <div className="card-premium p-5 border-l-4 border-l-amber-500">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pending</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            <span className="text-amber-500 mr-1">$</span>
            {metrics.totalPending.toLocaleString()}
          </h3>
        </div>
        <div className="card-premium p-5 border-l-4 border-l-indigo-500">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Records</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.count}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="card-premium p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <AppIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by UTR, buyer, or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white/50 pl-10 pr-4 py-2.5 text-sm font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-900/50 dark:border-slate-800 dark:text-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPayments.map(payment => (
            <div key={payment.id} className="card-premium p-5 flex flex-col h-full hover:shadow-xl hover:border-teal-500/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-2 truncate font-mono text-sm" title={payment.referenceNo}>
                    {payment.referenceNo}
                  </h3>
                </div>
                <button onClick={() => deletePayment(payment.id)} className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AppIcon name="x" className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 font-medium">Amount</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{payment.currency} {payment.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500 font-medium">Date</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{payment.date}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500 font-medium">Method</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{payment.method}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500 font-medium">Buyer ID</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{payment.buyerId}</span>
                </div>
                {payment.invoiceId && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500 font-medium">Invoice</span>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 truncate max-w-[120px]">{payment.invoiceId}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredPayments.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <AppIcon name="link" className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No payments found</h3>
              <p className="text-sm text-slate-500 mt-1">Log a new payment to get started tracking remittances.</p>
            </div>
          )}
        </div>
      )}

      {/* Slide-over Drawer for Log Payment */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative z-50 w-full max-w-md bg-white shadow-2xl h-full flex flex-col dark:bg-slate-900 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-5">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Log Payment</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <AppIcon name="x" className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              <form id="payment-form" onSubmit={handleSavePayment} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Reference No (UTR / SWIFT)</label>
                  <input required
                    type="text" value={formData.referenceNo} onChange={e => setFormData({...formData, referenceNo: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none transition-all" 
                    placeholder="e.g. UTR-123456789"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Buyer ID</label>
                    <input required
                      type="text" value={formData.buyerId} onChange={e => setFormData({...formData, buyerId: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none transition-all" 
                      placeholder="e.g. b-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Linked Invoice (Optional)</label>
                    <input
                      type="text" value={formData.invoiceId} onChange={e => setFormData({...formData, invoiceId: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none transition-all" 
                      placeholder="e.g. INV-2024-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Amount</label>
                    <input required
                      type="number" step="0.01" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Currency</label>
                    <select required
                      value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none transition-all" 
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="AED">AED</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Date</label>
                    <input required
                      type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Status</label>
                    <select required
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none transition-all" 
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Payment Method</label>
                  <select required
                    value={formData.method} onChange={e => setFormData({...formData, method: e.target.value as any})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none transition-all" 
                  >
                    <option value="Wire Transfer">Wire Transfer</option>
                    <option value="Letter of Credit">Letter of Credit</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Notes (Optional)</label>
                  <textarea
                    value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none transition-all resize-none h-24" 
                    placeholder="Add details about currency conversion, correspondent bank charges, etc."
                  />
                </div>
              </form>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-6 py-5">
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" form="payment-form" className="flex-1 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white hover:bg-teal-500 shadow-lg shadow-teal-500/20 transition-all">
                  Save Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom duration-300 ${toast.type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-rose-600 text-white shadow-rose-600/20'}`}>
          <div className="flex items-center gap-2">
            <AppIcon name={toast.type === 'success' ? 'check' : 'warning'} className="h-4 w-4" />
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
