import { useState, useMemo, useCallback } from 'react';
import AppIcon from '../components/AppIcon';
import { ShippingBill, ShippingBillItem, ShippingBillStatus, createEmptyShippingBill, EXPORT_SCHEMES, SB_STATUS_FLOW } from '../types/shippingBill';
import { INDIAN_PORTS, getPortsByType } from '../data/indianPorts';
import { CommercialInvoice } from '../types/invoice';
import { getDocumentStatusClasses } from '../utils/documentUtils';
import { generateShippingBillPDF } from '../utils/shippingBillPdfGenerator';
import ShowForPermission from '../components/ShowForPermission';
import { CURRENCIES, UNITS } from '../types/invoice';
import { useAppContext } from '../context/AppContext';

export default function ShippingBillForm() {
  const { state, saveShippingBill, deleteShippingBill, getNextDocumentNumber } = useAppContext();
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showList, setShowList] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fetchingRate, setFetchingRate] = useState(false);

  const bills = state.shippingBills;
  const invoices = state.invoices;
  const [form, setForm] = useState(createEmptyShippingBill());

  const show = (msg: string, type: 'success' | 'error' = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };


  const importFromInvoice = (invId: string) => {
    const inv = invoices.find((i: CommercialInvoice) => i.id === invId);
    if (!inv) return;
    setForm((prev: any) => ({
      ...prev,
      exporterDetails: { name: inv.exporterDetails.name, address: inv.exporterDetails.address, iec: inv.exporterDetails.iec, pan: inv.exporterDetails.pan, gstin: inv.exporterDetails.gstin, adCode: '' },
      consigneeDetails: { name: inv.buyerDetails.name, address: inv.buyerDetails.address, country: inv.buyerDetails.country },
      shipmentDetails: { ...prev.shipmentDetails, portOfLoading: inv.shipmentDetails.portOfLoading, countryOfDestination: inv.buyerDetails.country, portOfFinalDestination: inv.shipmentDetails.portOfDischarge, vessel: inv.shipmentDetails.vesselFlightNo },
      currency: inv.shipmentDetails.currency,
      items: inv.items.map((item: any, i: number) => ({
        srNo: i + 1, description: item.description, hsCode: item.hsCode, quantity: item.quantity, unit: item.unit,
        fobValueForeign: item.totalPrice, fobValueINR: item.totalPrice * prev.exchangeRate,
      })),
    }));
    show('Imported from invoice');
  };

  const fetchExchangeRate = async () => {
    setFetchingRate(true);
    try {
      const res = await fetch(`/api/exchange-rate/fetch?from=${form.currency}&to=INR`);
      const data = await res.json();
      if (data.success) {
        setForm((prev: any) => {
          const rate = data.data.rate;
          return {
            ...prev,
            exchangeRate: rate,
            items: prev.items.map((item: any) => ({ ...item, fobValueINR: item.fobValueForeign * rate })),
            totalFOBValueINR: prev.items.reduce((s: number, i: any) => s + i.fobValueForeign * rate, 0),
          };
        });
        show(`Exchange rate: 1 ${form.currency} = ₹${data.data.rate.toFixed(2)}`);
      }
    } catch { show('Using fallback exchange rate', 'error'); }
    finally { setFetchingRate(false); }
  };

  const handleNew = () => { setForm(createEmptyShippingBill()); setEditingId(null); setShowList(false); };

  const handleEdit = (sb: ShippingBill) => {
    if (sb.status !== 'Draft') { show('Only draft bills can be edited', 'error'); return; }
    setForm({ sbDate: sb.sbDate, status: sb.status, customsStation: sb.customsStation, portCode: sb.portCode, exporterDetails: { ...sb.exporterDetails }, consigneeDetails: { ...sb.consigneeDetails }, exportScheme: sb.exportScheme, shipmentDetails: { ...sb.shipmentDetails }, items: sb.items.map((i: any) => ({ ...i })), totalFOBValueINR: sb.totalFOBValueINR, totalFOBValueForeign: sb.totalFOBValueForeign, currency: sb.currency, exchangeRate: sb.exchangeRate, drawbackDetails: sb.drawbackDetails ? { ...sb.drawbackDetails } : undefined, linkedDocuments: sb.linkedDocuments || [] });
    setEditingId(sb.id);
    setShowList(false);
  };

  const handleDuplicate = (sb: ShippingBill) => {
    setForm({ ...createEmptyShippingBill(), exporterDetails: { ...sb.exporterDetails }, consigneeDetails: { ...sb.consigneeDetails }, exportScheme: sb.exportScheme, shipmentDetails: { ...sb.shipmentDetails }, currency: sb.currency, exchangeRate: sb.exchangeRate, items: sb.items.map((i: any) => ({ ...i })) });
    setEditingId(null); setShowList(false);
    show('Bill duplicated');
  };

  const recalcTotals = (items: ShippingBillItem[], rate: number) => ({
    totalFOBValueForeign: items.reduce((s, i) => s + i.fobValueForeign, 0),
    totalFOBValueINR: items.reduce((s, i) => s + i.fobValueForeign * rate, 0),
  });

  const updateItem = (idx: number, field: string, value: any) => {
    setForm((prev: any) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      if (field === 'fobValueForeign') items[idx].fobValueINR = value * prev.exchangeRate;
      return { ...prev, items, ...recalcTotals(items, prev.exchangeRate) };
    });
  };

  const addItem = () => setForm((prev: any) => {
    const items = [...prev.items, { srNo: prev.items.length + 1, description: '', hsCode: '', quantity: 0, unit: 'PCS', fobValueINR: 0, fobValueForeign: 0 }];
    return { ...prev, items, ...recalcTotals(items, prev.exchangeRate) };
  });

  const removeItem = (idx: number) => setForm((prev: any) => {
    const items = prev.items.filter((_: any, i: number) => i !== idx).map((item: any, i: number) => ({ ...item, srNo: i + 1 }));
    return { ...prev, items, ...recalcTotals(items, prev.exchangeRate) };
  });

  const handleSave = () => {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const totals = recalcTotals(form.items, form.exchangeRate);
      if (editingId) {
        const sb = bills.find(b => b.id === editingId);
        if (sb) {
          saveShippingBill({ ...sb, ...form, ...totals, updatedAt: now });
          show('Shipping bill updated');
        }
      } else {
        const newSB: ShippingBill = { 
          ...form, 
          ...totals, 
          id: `sb-${Date.now()}`, 
          sbNumber: getNextDocumentNumber('SB'), 
          createdAt: now, 
          updatedAt: now 
        };
        saveShippingBill(newSB);
        setEditingId(newSB.id);
        show('Shipping bill saved');
      }
    } catch { show('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const advanceStatus = (id: string) => {
    const sb = bills.find(b => b.id === id);
    if (!sb) return;
    const currentIdx = SB_STATUS_FLOW.indexOf(sb.status as any);
    if (currentIdx < 0 || currentIdx >= SB_STATUS_FLOW.length - 1) return;
    saveShippingBill({ ...sb, status: SB_STATUS_FLOW[currentIdx + 1] as any, updatedAt: new Date().toISOString() });
    show('Status updated');
  };

  const handleDelete = (id: string) => { deleteShippingBill(id); show('Deleted'); };

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
  const labelCls = 'block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5';

  // ── LIST VIEW ──
  if (showList) {
    return (
      <main className="page-stack animate-in fade-in duration-500">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Shipping Bills</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">India Customs — ICEGATE format</p>
          </div>
          <ShowForPermission permission="manage_documents">
            <button onClick={handleNew} className="btn-primary inline-flex items-center gap-2"><AppIcon name="create" className="h-4 w-4" /> New Shipping Bill</button>
          </ShowForPermission>
        </header>
        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/30 dark:to-purple-800/20 shadow-lg"><AppIcon name="file-text" className="h-10 w-10 text-indigo-600 dark:text-indigo-400" /></div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Shipping Bills Yet</h2>
            <p className="text-sm text-slate-500 max-w-md mb-6">Create your first shipping bill.</p>
            <ShowForPermission permission="manage_documents"><button onClick={handleNew} className="btn-primary inline-flex items-center gap-2"><AppIcon name="create" className="h-4 w-4" /> Create First Shipping Bill</button></ShowForPermission>
          </div>
        ) : (
          <div className="grid gap-4">
            {bills.map(sb => {
              const statusCls = getDocumentStatusClasses(sb.status === 'Filed' || sb.status === 'LEO' || sb.status === 'EGM Filed' ? 'Final' : sb.status as any);
              return (
                <div key={sb.id} className="card-premium p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-lg transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{sb.sbNumber}</span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusCls.bg} ${statusCls.text} ${statusCls.border}`}>{sb.status}</span>
                      <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{sb.exportScheme}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{sb.consigneeDetails.name || 'No consignee'} • ₹{sb.totalFOBValueINR?.toFixed(2) || '0.00'} • {sb.sbDate}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => generateShippingBillPDF(sb)} className="btn-secondary btn-sm"><AppIcon name="download" className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDuplicate(sb)} className="btn-secondary btn-sm"><AppIcon name="copy" className="h-3.5 w-3.5" /></button>
                    {sb.status === 'Draft' && (<>
                      <button onClick={() => handleEdit(sb)} className="btn-secondary btn-sm"><AppIcon name="edit" className="h-3.5 w-3.5" /></button>
                      <ShowForPermission permission="approve_documents"><button onClick={() => advanceStatus(sb.id)} className="btn-primary btn-sm text-[10px]">File</button></ShowForPermission>
                      <ShowForPermission permission="manage_documents"><button onClick={() => handleDelete(sb.id)} className="btn-sm text-[10px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-2 py-1">Delete</button></ShowForPermission>
                    </>)}
                    {(sb.status === 'Filed' || sb.status === 'LEO') && (
                      <ShowForPermission permission="approve_documents"><button onClick={() => advanceStatus(sb.id)} className="btn-primary btn-sm text-[10px]">Advance →</button></ShowForPermission>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {toast && <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom duration-300 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{toast.msg}</div>}
      </main>
    );
  }

  // ── FORM VIEW ──
  return (
    <main className="page-stack animate-in fade-in duration-500">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowList(true)} className="btn-secondary btn-sm"><AppIcon name="chevron-left" className="h-4 w-4" /></button>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{editingId ? 'Edit Shipping Bill' : 'New Shipping Bill'}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary btn-sm">{saving ? 'Saving...' : 'Save'}</button>
      </header>

      {/* Import from Invoice */}
      {invoices.length > 0 && !editingId && (
        <div className="card-premium p-4 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10">
          <div className="flex items-center gap-3">
            <AppIcon name="file-text" className="h-5 w-5 text-indigo-600" />
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Import from Invoice</p>
            </div>
            <select onChange={e => e.target.value && importFromInvoice(e.target.value)} className={inputCls + ' !w-48'} defaultValue="">
              <option value="">Select invoice...</option>
              {invoices.map(inv => <option key={inv.id} value={inv.id}>{inv.invoiceNumber}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Status Tracker */}
      <div className="card-premium p-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto">
          {SB_STATUS_FLOW.map((s: string, i: number) => {
            const currentIdx = SB_STATUS_FLOW.indexOf(form.status as any);
            const isActive = i <= currentIdx;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isActive ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                  <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  {s}
                </div>
                {i < SB_STATUS_FLOW.length - 1 && <span className="text-slate-300 dark:text-slate-600">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Customs Station & Port */}
      <div className="card-premium p-6 mb-6">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Customs Station</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>Customs Station</label><input className={inputCls} value={form.customsStation} onChange={e => setForm(p => ({ ...p, customsStation: e.target.value }))} placeholder="Chennai Customs" /></div>
          <div>
            <label className={labelCls}>Port Code</label>
            <select className={inputCls} value={form.portCode} onChange={e => setForm((p: any) => ({ ...p, portCode: e.target.value }))}>
              <option value="">Select Port</option>
              {INDIAN_PORTS.map((p: any) => <option key={p.code + p.name} value={p.code}>{p.code} — {p.name}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Export Scheme</label><select className={inputCls} value={form.exportScheme} onChange={e => setForm(p => ({ ...p, exportScheme: e.target.value as any }))}>{EXPORT_SCHEMES.map(s => <option key={s}>{s}</option>)}</select></div>
        </div>
      </div>

      {/* Exporter */}
      <div className="card-premium p-6 mb-6">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Exporter Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className={labelCls}>Name</label><input className={inputCls} value={form.exporterDetails.name} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, name: e.target.value } }))} /></div>
          <div><label className={labelCls}>IEC</label><input className={inputCls} value={form.exporterDetails.iec} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, iec: e.target.value } }))} /></div>
          <div><label className={labelCls}>GSTIN</label><input className={inputCls} value={form.exporterDetails.gstin} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, gstin: e.target.value } }))} /></div>
          <div><label className={labelCls}>PAN</label><input className={inputCls} value={form.exporterDetails.pan} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, pan: e.target.value } }))} /></div>
          <div><label className={labelCls}>AD Code</label><input className={inputCls} value={form.exporterDetails.adCode} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, adCode: e.target.value } }))} placeholder="Authorized Dealer code" /></div>
          <div className="lg:col-span-3 sm:col-span-2"><label className={labelCls}>Address</label><input className={inputCls} value={form.exporterDetails.address} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, address: e.target.value } }))} /></div>
        </div>
      </div>

      {/* Consignee */}
      <div className="card-premium p-6 mb-6">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Consignee / Buyer</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Name</label><input className={inputCls} value={form.consigneeDetails.name} onChange={e => setForm(p => ({ ...p, consigneeDetails: { ...p.consigneeDetails, name: e.target.value } }))} /></div>
          <div><label className={labelCls}>Country</label><input className={inputCls} value={form.consigneeDetails.country} onChange={e => setForm(p => ({ ...p, consigneeDetails: { ...p.consigneeDetails, country: e.target.value } }))} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Address</label><input className={inputCls} value={form.consigneeDetails.address} onChange={e => setForm(p => ({ ...p, consigneeDetails: { ...p.consigneeDetails, address: e.target.value } }))} /></div>
        </div>
      </div>

      {/* Shipment + Exchange Rate */}
      <div className="card-premium p-6 mb-6">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Shipment & Currency</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className={labelCls}>Mode of Transport</label><select className={inputCls} value={form.shipmentDetails.modeOfTransport} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, modeOfTransport: e.target.value as any } }))}><option>Sea</option><option>Air</option><option>Road</option><option>Rail</option></select></div>
          <div><label className={labelCls}>Nature of Cargo</label><select className={inputCls} value={form.shipmentDetails.natureOfCargo} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, natureOfCargo: e.target.value as any } }))}><option>General</option><option>Dangerous</option><option>Perishable</option><option>Liquid Bulk</option></select></div>
          <div><label className={labelCls}>Port of Loading</label><input className={inputCls} value={form.shipmentDetails.portOfLoading} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, portOfLoading: e.target.value } }))} /></div>
          <div><label className={labelCls}>Country of Destination</label><input className={inputCls} value={form.shipmentDetails.countryOfDestination} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, countryOfDestination: e.target.value } }))} /></div>
          <div><label className={labelCls}>Vessel Name</label><input className={inputCls} value={form.shipmentDetails.vessel} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, vessel: e.target.value } }))} /></div>
          <div><label className={labelCls}>Rotation No</label><input className={inputCls} value={form.shipmentDetails.rotationNo} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, rotationNo: e.target.value } }))} /></div>
          <div><label className={labelCls}>Currency</label><select className={inputCls} value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div>
            <label className={labelCls}>Exchange Rate (1 {form.currency} = ₹)</label>
            <div className="flex gap-2">
              <input type="number" step="0.01" className={inputCls} value={form.exchangeRate || ''} onChange={e => {
                const rate = parseFloat(e.target.value) || 0;
                setForm((p: any) => ({ ...p, exchangeRate: rate, items: p.items.map((i: any) => ({ ...i, fobValueINR: i.fobValueForeign * rate })), ...recalcTotals(p.items, rate) }));
              }} />
              <button onClick={fetchExchangeRate} disabled={fetchingRate} className="btn-secondary btn-sm flex-shrink-0 whitespace-nowrap" title="Fetch latest rate">
                {fetchingRate ? <span className="h-3 w-3 border-2 border-slate-300 border-t-teal-500 rounded-full animate-spin" /> : <AppIcon name="refresh-cw" className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card-premium p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Items</h3>
          <button onClick={addItem} className="btn-secondary btn-sm inline-flex items-center gap-1"><AppIcon name="create" className="h-3.5 w-3.5" /> Add</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead><tr className="border-b border-slate-200 dark:border-slate-700">
              {['#', 'Description', 'HS Code', 'Qty', 'Unit', `FOB (${form.currency})`, 'FOB (₹)', ''].map(h => <th key={h} className="px-2 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">{h}</th>)}
            </tr></thead>
            <tbody>
              {form.items.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-2 py-1 text-xs text-slate-500">{item.srNo}</td>
                  <td className="px-1 py-1"><input className={inputCls + ' !py-1.5 !text-[11px]'} value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} /></td>
                  <td className="px-1 py-1"><input className={inputCls + ' !py-1.5 !text-[11px] w-24'} value={item.hsCode} onChange={e => updateItem(idx, 'hsCode', e.target.value)} /></td>
                  <td className="px-1 py-1"><input type="number" className={inputCls + ' !py-1.5 !text-[11px] w-16'} value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} /></td>
                  <td className="px-1 py-1"><select className={inputCls + ' !py-1.5 !text-[11px] w-16'} value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)}>{UNITS.map(u => <option key={u}>{u}</option>)}</select></td>
                  <td className="px-1 py-1"><input type="number" step="0.01" className={inputCls + ' !py-1.5 !text-[11px] w-24'} value={item.fobValueForeign || ''} onChange={e => updateItem(idx, 'fobValueForeign', parseFloat(e.target.value) || 0)} /></td>
                  <td className="px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">₹{(item.fobValueForeign * form.exchangeRate).toFixed(2)}</td>
                  <td className="px-1 py-1">{form.items.length > 1 && <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1"><AppIcon name="x" className="h-3.5 w-3.5" /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div><span className="text-[10px] text-slate-500 uppercase font-bold">Total FOB ({form.currency})</span><p className="text-sm font-black text-slate-900 dark:text-white">{form.items.reduce((s, i) => s + i.fobValueForeign, 0).toFixed(2)}</p></div>
          <div><span className="text-[10px] text-slate-500 uppercase font-bold">Total FOB (₹)</span><p className="text-sm font-black text-teal-700 dark:text-teal-400">₹{form.items.reduce((s, i) => s + i.fobValueForeign * form.exchangeRate, 0).toFixed(2)}</p></div>
        </div>
      </div>

      {/* Drawback Details (conditional) */}
      {form.exportScheme === 'Drawback' && (
        <div className="card-premium p-6 mb-6">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Drawback Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className={labelCls}>DBK Table Sr No</label><input className={inputCls} value={form.drawbackDetails?.dbkTableSrNo || ''} onChange={e => setForm(p => ({ ...p, drawbackDetails: { ...(p.drawbackDetails || { dbkTableSrNo: '', rate: 0, amount: 0 }), dbkTableSrNo: e.target.value } }))} /></div>
            <div><label className={labelCls}>Rate (%)</label><input type="number" step="0.01" className={inputCls} value={form.drawbackDetails?.rate || ''} onChange={e => setForm(p => ({ ...p, drawbackDetails: { ...(p.drawbackDetails || { dbkTableSrNo: '', rate: 0, amount: 0 }), rate: parseFloat(e.target.value) || 0 } }))} /></div>
            <div><label className={labelCls}>Amount (₹)</label><input type="number" step="0.01" className={inputCls} value={form.drawbackDetails?.amount || ''} onChange={e => setForm(p => ({ ...p, drawbackDetails: { ...(p.drawbackDetails || { dbkTableSrNo: '', rate: 0, amount: 0 }), amount: parseFloat(e.target.value) || 0 } }))} /></div>
          </div>
        </div>
      )}

      {toast && <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom duration-300 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{toast.msg}</div>}
    </main>
  );
}
