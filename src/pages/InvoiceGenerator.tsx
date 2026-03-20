/**
 * Commercial Invoice Generator Page
 * Multi-step form: Exporter → Buyer → Shipment → Items → Preview
 */
import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';
import {
  CommercialInvoice,
  InvoiceItem,
  createEmptyInvoice,
  INCOTERMS,
  CURRENCIES,
  UNITS,
} from '../types/invoice';
import { numberToWords, formatCurrency, getDocumentStatusClasses, DocumentStatus } from '../utils/documentUtils';
import { generateInvoicePDF } from '../utils/invoicePdfGenerator';
import ShowForPermission from '../components/ShowForPermission';

const STEPS = ['Exporter Details', 'Buyer Details', 'Shipment Details', 'Line Items', 'Bank & Preview'];

export default function InvoiceGenerator() {
  const { state, saveInvoice, deleteInvoice, getNextDocumentNumber } = useAppContext();
  const invoices = state.invoices;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [showList, setShowList] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState(createEmptyInvoice());

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleNew = () => {
    setForm(createEmptyInvoice());
    setEditingId(null);
    setStep(0);
    setShowList(false);
  };

  const handleEdit = (invoice: CommercialInvoice) => {
    if (invoice.status === 'Final') {
      showToast('Finalized invoices cannot be edited', 'error');
      return;
    }
    setForm({
      invoiceDate: invoice.invoiceDate,
      status: invoice.status,
      exporterDetails: { ...invoice.exporterDetails },
      buyerDetails: { ...invoice.buyerDetails },
      shipmentDetails: { ...invoice.shipmentDetails },
      items: invoice.items.map(i => ({ ...i })),
      bankDetails: { ...invoice.bankDetails },
      declaration: invoice.declaration,
      authorizedSignatory: invoice.authorizedSignatory,
      copyType: invoice.copyType,
      linkedDocuments: invoice.linkedDocuments || [],
    });
    setEditingId(invoice.id);
    setStep(0);
    setShowList(false);
  };

  const handleDuplicate = (invoice: CommercialInvoice) => {
    setForm({
      invoiceDate: new Date().toISOString().slice(0, 10),
      status: 'Draft',
      exporterDetails: { ...invoice.exporterDetails },
      buyerDetails: { ...invoice.buyerDetails },
      shipmentDetails: { ...invoice.shipmentDetails },
      items: invoice.items.map(i => ({ ...i })),
      bankDetails: { ...invoice.bankDetails },
      declaration: invoice.declaration,
      authorizedSignatory: invoice.authorizedSignatory,
      copyType: 'Original',
      linkedDocuments: [],
    });
    setEditingId(null);
    setStep(0);
    setShowList(false);
    showToast('Invoice duplicated as new draft');
  };

  const handleSave = () => {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      if (editingId) {
        const inv = invoices.find(i => i.id === editingId);
        if (inv) {
          saveInvoice({ ...inv, ...form, updatedAt: now });
          showToast('Invoice updated successfully');
        }
      } else {
        const newInvoice: CommercialInvoice = {
          ...form,
          id: `inv-${Date.now()}`,
          invoiceNumber: getNextDocumentNumber('INV'),
          createdAt: now,
          updatedAt: now,
        };
        saveInvoice(newInvoice);
        setEditingId(newInvoice.id);
        showToast('Invoice saved successfully');
      }
    } catch (e) {
      showToast('Failed to save invoice', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      saveInvoice({ ...inv, status: 'Final', updatedAt: new Date().toISOString() });
      showToast('Invoice finalized');
    }
  };

  const handleCancel = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      saveInvoice({ ...inv, status: 'Cancelled', updatedAt: new Date().toISOString() });
      showToast('Invoice cancelled');
    }
  };

  const handleDelete = (id: string) => {
    deleteInvoice(id);
    showToast('Invoice deleted');
  };

  const handleDownloadPDF = (invoice: CommercialInvoice) => {
    generateInvoicePDF(invoice);
    showToast('PDF downloaded');
  };

  // Items management
  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { srNo: prev.items.length + 1, description: '', hsCode: '', quantity: 0, unit: 'PCS', unitPrice: 0, totalPrice: 0, netWeight: 0, grossWeight: 0 }],
    }));
  };

  const removeItem = (idx: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx).map((item, i) => ({ ...item, srNo: i + 1 })),
    }));
  };

  const updateItem = (idx: number, field: keyof InvoiceItem, value: any) => {
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        items[idx].totalPrice = items[idx].quantity * items[idx].unitPrice;
      }
      return { ...prev, items };
    });
  };

  const totalAmount = useMemo(() => form.items.reduce((s, i) => s + i.totalPrice, 0), [form.items]);
  const totalNetWt = useMemo(() => form.items.reduce((s, i) => s + i.netWeight, 0), [form.items]);
  const totalGrossWt = useMemo(() => form.items.reduce((s, i) => s + i.grossWeight, 0), [form.items]);

  // ── Common input classes ──
  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-teal-500';
  const labelCls = 'block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5';
  const selectCls = inputCls + ' appearance-none';

  // ── INVOICE LIST VIEW ──
  if (showList) {
    return (
      <main className="page-stack animate-in fade-in duration-500">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Commercial Invoices</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create, manage, and export GST-compliant invoices</p>
          </div>
          <ShowForPermission permission="manage_documents">
            <button onClick={handleNew} className="btn-primary inline-flex items-center gap-2">
              <AppIcon name="create" className="h-4 w-4" /> New Invoice
            </button>
          </ShowForPermission>
        </header>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 shadow-lg">
              <AppIcon name="file-text" className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-2">No Invoices Yet</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">Create your first commercial invoice to get started.</p>
            <ShowForPermission permission="manage_documents">
              <button onClick={handleNew} className="btn-primary inline-flex items-center gap-2">
                <AppIcon name="create" className="h-4 w-4" /> Create First Invoice
              </button>
            </ShowForPermission>
          </div>
        ) : (
          <div className="grid gap-4">
            {invoices.map(inv => {
              const statusCls = getDocumentStatusClasses(inv.status);
              return (
                <div key={inv.id} className="card-premium p-5 flex flex-col sm:flex-row sm:items-center gap-4 group hover:shadow-lg transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusCls.bg} ${statusCls.text} ${statusCls.border}`}>{inv.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {inv.buyerDetails.name || 'No buyer'} • {inv.shipmentDetails.currency} {inv.items.reduce((s, i) => s + i.totalPrice, 0).toFixed(2)} • {inv.invoiceDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleDownloadPDF(inv)} className="btn-secondary btn-sm" title="Download PDF">
                      <AppIcon name="download" className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDuplicate(inv)} className="btn-secondary btn-sm" title="Duplicate">
                      <AppIcon name="copy" className="h-3.5 w-3.5" />
                    </button>
                    {inv.status === 'Draft' && (
                      <>
                        <button onClick={() => handleEdit(inv)} className="btn-secondary btn-sm" title="Edit">
                          <AppIcon name="edit" className="h-3.5 w-3.5" />
                        </button>
                        <ShowForPermission permission="approve_documents">
                          <button onClick={() => handleFinalize(inv.id)} className="btn-primary btn-sm text-[10px]">Finalize</button>
                        </ShowForPermission>
                        <ShowForPermission permission="manage_documents">
                          <button onClick={() => handleDelete(inv.id)} className="btn-sm text-[10px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-2 py-1">Delete</button>
                        </ShowForPermission>
                      </>
                    )}
                    {inv.status === 'Final' && (
                      <ShowForPermission permission="approve_documents">
                        <button onClick={() => handleCancel(inv.id)} className="btn-sm text-[10px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-2 py-1">Cancel</button>
                      </ShowForPermission>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom duration-300 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.message}
          </div>
        )}
      </main>
    );
  }

  // ── FORM VIEW ──
  return (
    <main className="page-stack animate-in fade-in duration-500">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowList(true)} className="btn-secondary btn-sm">
            <AppIcon name="chevron-left" className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {editingId ? 'Edit Invoice' : 'New Invoice'}
            </h1>
            <p className="text-[11px] text-slate-500">{STEPS[step]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving} className="btn-secondary btn-sm">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${i === step
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
              : i < step
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
              }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${i === step ? 'bg-white/20' : i < step ? 'bg-teal-200 dark:bg-teal-800' : 'bg-slate-200 dark:bg-slate-700'}`}>{i + 1}</span>
            <span className="hidden sm:inline">{s}</span>
          </button>
        ))}
      </div>

      {/* Step 0: Exporter Details */}
      {step === 0 && (
        <div className="card-premium p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Exporter / Shipper Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Company Name *</label><input className={inputCls} value={form.exporterDetails.name} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, name: e.target.value } }))} placeholder="Export Company Ltd." /></div>
            <div><label className={labelCls}>GSTIN</label><input className={inputCls} value={form.exporterDetails.gstin} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, gstin: e.target.value } }))} placeholder="22AAAAA0000A1Z5" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Address *</label><textarea className={inputCls + ' min-h-[60px]'} value={form.exporterDetails.address} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, address: e.target.value } }))} placeholder="Full company address..." /></div>
            <div><label className={labelCls}>IEC Code</label><input className={inputCls} value={form.exporterDetails.iec} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, iec: e.target.value } }))} placeholder="AABCT1234A" /></div>
            <div><label className={labelCls}>PAN</label><input className={inputCls} value={form.exporterDetails.pan} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, pan: e.target.value } }))} placeholder="AABCT1234A" /></div>
            <div><label className={labelCls}>State</label><input className={inputCls} value={form.exporterDetails.state} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, state: e.target.value } }))} placeholder="Maharashtra" /></div>
            <div><label className={labelCls}>State Code</label><input className={inputCls} value={form.exporterDetails.stateCode} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, stateCode: e.target.value } }))} placeholder="27" /></div>
          </div>
        </div>
      )}

      {/* Step 1: Buyer Details */}
      {step === 1 && (
        <div className="card-premium p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Buyer / Consignee Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Buyer Name *</label><input className={inputCls} value={form.buyerDetails.name} onChange={e => setForm(p => ({ ...p, buyerDetails: { ...p.buyerDetails, name: e.target.value } }))} placeholder="International Buyer Inc." /></div>
            <div><label className={labelCls}>Country *</label><input className={inputCls} value={form.buyerDetails.country} onChange={e => setForm(p => ({ ...p, buyerDetails: { ...p.buyerDetails, country: e.target.value } }))} placeholder="United States" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Address *</label><textarea className={inputCls + ' min-h-[60px]'} value={form.buyerDetails.address} onChange={e => setForm(p => ({ ...p, buyerDetails: { ...p.buyerDetails, address: e.target.value } }))} placeholder="Full buyer address..." /></div>
            <div><label className={labelCls}>Buyer Order No</label><input className={inputCls} value={form.buyerDetails.buyerOrderNo} onChange={e => setForm(p => ({ ...p, buyerDetails: { ...p.buyerDetails, buyerOrderNo: e.target.value } }))} placeholder="PO-12345" /></div>
            <div><label className={labelCls}>Buyer Order Date</label><input type="date" className={inputCls} value={form.buyerDetails.buyerOrderDate} onChange={e => setForm(p => ({ ...p, buyerDetails: { ...p.buyerDetails, buyerOrderDate: e.target.value } }))} /></div>
          </div>
        </div>
      )}

      {/* Step 2: Shipment Details */}
      {step === 2 && (
        <div className="card-premium p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Shipment Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Port of Loading *</label><input className={inputCls} value={form.shipmentDetails.portOfLoading} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, portOfLoading: e.target.value } }))} placeholder="JNPT Mumbai" /></div>
            <div><label className={labelCls}>Port of Discharge *</label><input className={inputCls} value={form.shipmentDetails.portOfDischarge} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, portOfDischarge: e.target.value } }))} placeholder="Port of Los Angeles" /></div>
            <div><label className={labelCls}>Final Destination</label><input className={inputCls} value={form.shipmentDetails.finalDestination} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, finalDestination: e.target.value } }))} placeholder="Los Angeles, USA" /></div>
            <div><label className={labelCls}>Vessel / Flight No</label><input className={inputCls} value={form.shipmentDetails.vesselFlightNo} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, vesselFlightNo: e.target.value } }))} placeholder="MAERSK ELBA V.234" /></div>
            <div><label className={labelCls}>Incoterms *</label><select className={selectCls} value={form.shipmentDetails.termsOfDelivery} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, termsOfDelivery: e.target.value } }))}>{INCOTERMS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className={labelCls}>Currency *</label><select className={selectCls} value={form.shipmentDetails.currency} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, currency: e.target.value } }))}>{CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className={labelCls}>Bill of Lading No</label><input className={inputCls} value={form.shipmentDetails.billOfLadingNo} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, billOfLadingNo: e.target.value } }))} placeholder="MAEU1234567" /></div>
            <div><label className={labelCls}>Payment Terms</label><input className={inputCls} value={form.shipmentDetails.paymentTerms} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, paymentTerms: e.target.value } }))} placeholder="30 days LC at sight" /></div>
          </div>
        </div>
      )}

      {/* Step 3: Line Items */}
      {step === 3 && (
        <div className="card-premium p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Line Items</h3>
            <button onClick={addItem} className="btn-secondary btn-sm inline-flex items-center gap-1">
              <AppIcon name="create" className="h-3.5 w-3.5" /> Add Item
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {['#', 'Description', 'HS Code', 'Qty', 'Unit', 'Rate', 'Amount', 'Net Wt', 'Gross Wt', ''].map(h => (
                    <th key={h} className="px-2 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2 text-xs text-slate-500">{item.srNo}</td>
                    <td className="px-1 py-1"><input className={inputCls + ' !py-1.5 !text-[11px]'} value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Product description" /></td>
                    <td className="px-1 py-1"><input className={inputCls + ' !py-1.5 !text-[11px] w-24'} value={item.hsCode} onChange={e => updateItem(idx, 'hsCode', e.target.value)} placeholder="8471.30" /></td>
                    <td className="px-1 py-1"><input type="number" className={inputCls + ' !py-1.5 !text-[11px] w-16'} value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} /></td>
                    <td className="px-1 py-1"><select className={selectCls + ' !py-1.5 !text-[11px] w-16'} value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)}>{UNITS.map(u => <option key={u}>{u}</option>)}</select></td>
                    <td className="px-1 py-1"><input type="number" step="0.01" className={inputCls + ' !py-1.5 !text-[11px] w-20'} value={item.unitPrice || ''} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} /></td>
                    <td className="px-2 py-2 text-xs font-bold text-slate-900 dark:text-white tabular-nums">{item.totalPrice.toFixed(2)}</td>
                    <td className="px-1 py-1"><input type="number" step="0.01" className={inputCls + ' !py-1.5 !text-[11px] w-18'} value={item.netWeight || ''} onChange={e => updateItem(idx, 'netWeight', parseFloat(e.target.value) || 0)} /></td>
                    <td className="px-1 py-1"><input type="number" step="0.01" className={inputCls + ' !py-1.5 !text-[11px] w-18'} value={item.grossWeight || ''} onChange={e => updateItem(idx, 'grossWeight', parseFloat(e.target.value) || 0)} /></td>
                    <td className="px-1 py-1">
                      {form.items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                          <AppIcon name="x" className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                  <td></td>
                  <td className="px-2 py-2 text-xs text-slate-900 dark:text-white">TOTAL</td>
                  <td></td>
                  <td className="px-2 py-2 text-xs tabular-nums">{form.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td></td><td></td>
                  <td className="px-2 py-2 text-xs text-teal-700 dark:text-teal-400 tabular-nums">{totalAmount.toFixed(2)}</td>
                  <td className="px-2 py-2 text-xs tabular-nums">{totalNetWt.toFixed(2)}</td>
                  <td className="px-2 py-2 text-xs tabular-nums">{totalGrossWt.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Amount in Words: <span className="font-bold text-slate-700 dark:text-slate-300">{form.shipmentDetails.currency} {numberToWords(totalAmount)}</span>
          </p>
        </div>
      )}

      {/* Step 4: Bank Details + Declaration + Preview */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="card-premium p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Bank Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Bank Name</label><input className={inputCls} value={form.bankDetails.bankName} onChange={e => setForm(p => ({ ...p, bankDetails: { ...p.bankDetails, bankName: e.target.value } }))} placeholder="State Bank of India" /></div>
              <div><label className={labelCls}>Account Number</label><input className={inputCls} value={form.bankDetails.accountNo} onChange={e => setForm(p => ({ ...p, bankDetails: { ...p.bankDetails, accountNo: e.target.value } }))} placeholder="1234567890" /></div>
              <div><label className={labelCls}>SWIFT Code</label><input className={inputCls} value={form.bankDetails.swiftCode} onChange={e => setForm(p => ({ ...p, bankDetails: { ...p.bankDetails, swiftCode: e.target.value } }))} placeholder="SBININBB" /></div>
              <div><label className={labelCls}>IFSC Code</label><input className={inputCls} value={form.bankDetails.ifscCode} onChange={e => setForm(p => ({ ...p, bankDetails: { ...p.bankDetails, ifscCode: e.target.value } }))} placeholder="SBIN0001234" /></div>
              <div className="sm:col-span-2"><label className={labelCls}>Branch Address</label><input className={inputCls} value={form.bankDetails.branchAddress} onChange={e => setForm(p => ({ ...p, bankDetails: { ...p.bankDetails, branchAddress: e.target.value } }))} placeholder="Main Branch, Mumbai" /></div>
            </div>
          </div>

          <div className="card-premium p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Declaration & Signature</h3>
            <div><label className={labelCls}>Declaration</label><textarea className={inputCls + ' min-h-[60px]'} value={form.declaration} onChange={e => setForm(p => ({ ...p, declaration: e.target.value }))} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Authorized Signatory</label><input className={inputCls} value={form.authorizedSignatory} onChange={e => setForm(p => ({ ...p, authorizedSignatory: e.target.value }))} placeholder="Name of authorized person" /></div>
              <div><label className={labelCls}>Copy Type</label><select className={selectCls} value={form.copyType || 'Original'} onChange={e => setForm(p => ({ ...p, copyType: e.target.value as any }))}>
                <option>Original</option><option>Duplicate</option><option>Triplicate</option>
              </select></div>
            </div>
          </div>

          {/* Preview Summary */}
          <div className="card-premium p-6 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">Invoice Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div><span className="text-slate-500">Buyer</span><p className="font-bold text-slate-900 dark:text-white">{form.buyerDetails.name || '—'}</p></div>
              <div><span className="text-slate-500">Items</span><p className="font-bold text-slate-900 dark:text-white">{form.items.length}</p></div>
              <div><span className="text-slate-500">Total Amount</span><p className="font-bold text-teal-700 dark:text-teal-400">{form.shipmentDetails.currency} {totalAmount.toFixed(2)}</p></div>
              <div><span className="text-slate-500">Incoterms</span><p className="font-bold text-slate-900 dark:text-white">{form.shipmentDetails.termsOfDelivery}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-secondary disabled:opacity-40 inline-flex items-center gap-2">
          <AppIcon name="chevron-left" className="h-4 w-4" /> Previous
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="btn-primary inline-flex items-center gap-2">
            Next <AppIcon name="chevron-right" className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-secondary inline-flex items-center gap-2">
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  handleSave();
                  const inv = invoices.find(i => i.id === editingId);
                  if (inv) handleDownloadPDF({ ...inv, ...form } as CommercialInvoice);
                }}
                className="btn-primary inline-flex items-center gap-2"
              >
                <AppIcon name="download" className="h-4 w-4" /> Save & Download PDF
              </button>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom duration-300 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}
    </main>
  );
}
