/**
 * Certificate of Origin Generator Page
 */
import { useState, useCallback } from 'react';
import AppIcon from '../components/AppIcon';
import { CertificateOfOrigin, COOItem, createEmptyCOO, COO_TYPES, ISSUING_AUTHORITIES, ORIGIN_CRITERIA, DEFAULT_DECLARATIONS } from '../types/certificateOfOrigin';
import { getDocumentStatusClasses, DocumentStatus } from '../utils/documentUtils';
import { generateCOOPdf } from '../utils/cooPdfGenerator';
import ShowForPermission from '../components/ShowForPermission';
import { useAppContext } from '../context/AppContext';

export default function CertificateOfOriginGenerator() {
  const { state, saveCOO, deleteCOO, getNextDocumentNumber } = useAppContext();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showList, setShowList] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const coos = state.coos;
  const [form, setForm] = useState(createEmptyCOO());

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleNew = () => { setForm(createEmptyCOO()); setEditingId(null); setShowList(false); };

  const handleEdit = (coo: CertificateOfOrigin) => {
    if (coo.status === 'Final') { showToast('Finalized COOs cannot be edited', 'error'); return; }
    setForm({ cooDate: coo.cooDate, status: coo.status, cooType: coo.cooType, exporterDetails: { ...coo.exporterDetails }, consigneeDetails: { ...coo.consigneeDetails }, transportDetails: { ...coo.transportDetails }, items: coo.items.map(i => ({ ...i })), declarationText: coo.declarationText, issuingAuthority: coo.issuingAuthority, linkedDocuments: coo.linkedDocuments || [] });
    setEditingId(coo.id);
    setShowList(false);
  };

  const handleDuplicate = (coo: CertificateOfOrigin) => {
    setForm({ ...createEmptyCOO(), cooType: coo.cooType, exporterDetails: { ...coo.exporterDetails }, consigneeDetails: { ...coo.consigneeDetails }, transportDetails: { ...coo.transportDetails }, items: coo.items.map(i => ({ ...i })), declarationText: coo.declarationText, issuingAuthority: coo.issuingAuthority });
    setEditingId(null); setShowList(false);
    showToast('COO duplicated');
  };

  const handleSave = () => {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      if (editingId) {
        const coo = coos.find(c => c.id === editingId);
        if (coo) {
          saveCOO({ ...coo, ...form, updatedAt: now });
          showToast('COO updated');
        }
      } else {
        const newCOO: CertificateOfOrigin = { 
          ...form, 
          id: `coo-${Date.now()}`, 
          cooNumber: getNextDocumentNumber('COO'), 
          createdAt: now, 
          updatedAt: now 
        };
        saveCOO(newCOO);
        setEditingId(newCOO.id);
        showToast('COO saved');
      }
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const handleFinalize = (id: string) => { 
    const coo = coos.find((c: CertificateOfOrigin) => c.id === id);
    if (coo) {
      saveCOO({ ...coo, status: 'Final', updatedAt: new Date().toISOString() });
      showToast('Finalized'); 
    }
  };
  const handleDelete = (id: string) => { deleteCOO(id); showToast('Deleted'); };

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { marks: '', description: '', hsCode: '', quantity: '', invoiceNo: '', originCriteria: 'WO' }] }));
  const removeItem = (idx: number) => setForm(p => ({ ...p, items: p.items.filter((_: any, i: number) => i !== idx) }));
  const updateItem = (idx: number, field: keyof COOItem, value: string) => setForm(p => ({ ...p, items: p.items.map((item: COOItem, i: number) => i === idx ? { ...item, [field]: value } : item) }));

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
  const labelCls = 'block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5';

  if (showList) {
    return (
      <main className="page-stack animate-in fade-in duration-500">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Certificate of Origin</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate COO documents for preferential duty treatment</p>
          </div>
          <ShowForPermission permission="manage_documents">
            <button onClick={handleNew} className="btn-primary inline-flex items-center gap-2"><AppIcon name="create" className="h-4 w-4" /> New COO</button>
          </ShowForPermission>
        </header>
        {coos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/30 dark:to-orange-800/20 shadow-lg"><AppIcon name="shield" className="h-10 w-10 text-amber-600 dark:text-amber-400" /></div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Certificates Yet</h2>
            <p className="text-sm text-slate-500 max-w-md mb-6">Create your first Certificate of Origin.</p>
            <ShowForPermission permission="manage_documents"><button onClick={handleNew} className="btn-primary inline-flex items-center gap-2"><AppIcon name="create" className="h-4 w-4" /> Create First COO</button></ShowForPermission>
          </div>
        ) : (
          <div className="grid gap-4">
            {coos.map(coo => {
              const statusCls = getDocumentStatusClasses(coo.status);
              return (
                <div key={coo.id} className="card-premium p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-lg transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{coo.cooNumber}</span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusCls.bg} ${statusCls.text} ${statusCls.border}`}>{coo.status}</span>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">{coo.cooType}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{coo.consigneeDetails.name || 'No consignee'} • {coo.consigneeDetails.country} • {coo.cooDate}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => generateCOOPdf(coo)} className="btn-secondary btn-sm"><AppIcon name="download" className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDuplicate(coo)} className="btn-secondary btn-sm"><AppIcon name="copy" className="h-3.5 w-3.5" /></button>
                    {coo.status === 'Draft' && (<>
                      <button onClick={() => handleEdit(coo)} className="btn-secondary btn-sm"><AppIcon name="edit" className="h-3.5 w-3.5" /></button>
                      <ShowForPermission permission="approve_documents"><button onClick={() => handleFinalize(coo.id)} className="btn-primary btn-sm text-[10px]">Finalize</button></ShowForPermission>
                      <ShowForPermission permission="manage_documents"><button onClick={() => handleDelete(coo.id)} className="btn-sm text-[10px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-2 py-1">Delete</button></ShowForPermission>
                    </>)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {toast && <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom duration-300 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{toast.message}</div>}
      </main>
    );
  }

  return (
    <main className="page-stack animate-in fade-in duration-500">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowList(true)} className="btn-secondary btn-sm"><AppIcon name="chevron-left" className="h-4 w-4" /></button>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{editingId ? 'Edit COO' : 'New Certificate of Origin'}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary btn-sm">{saving ? 'Saving...' : 'Save'}</button>
      </header>

      {/* COO Type */}
      <div className="card-premium p-6 mb-6">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Certificate Type</h3>
        <div className="flex flex-wrap gap-2">
          {COO_TYPES.map(type => (
            <button key={type} onClick={() => setForm(p => ({ ...p, cooType: type, declarationText: DEFAULT_DECLARATIONS[type] || p.declarationText }))}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${form.cooType === type ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Exporter & Consignee */}
      <div className="card-premium p-6 mb-6">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Exporter & Consignee</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Exporter Name</label><input className={inputCls} value={form.exporterDetails.name} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, name: e.target.value } }))} /></div>
          <div><label className={labelCls}>IEC Code</label><input className={inputCls} value={form.exporterDetails.iec} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, iec: e.target.value } }))} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Exporter Address</label><input className={inputCls} value={form.exporterDetails.address} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, address: e.target.value } }))} /></div>
          <div><label className={labelCls}>Consignee Name</label><input className={inputCls} value={form.consigneeDetails.name} onChange={e => setForm(p => ({ ...p, consigneeDetails: { ...p.consigneeDetails, name: e.target.value } }))} /></div>
          <div><label className={labelCls}>Consignee Country</label><input className={inputCls} value={form.consigneeDetails.country} onChange={e => setForm(p => ({ ...p, consigneeDetails: { ...p.consigneeDetails, country: e.target.value } }))} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Consignee Address</label><input className={inputCls} value={form.consigneeDetails.address} onChange={e => setForm(p => ({ ...p, consigneeDetails: { ...p.consigneeDetails, address: e.target.value } }))} /></div>
        </div>
      </div>

      {/* Transport */}
      <div className="card-premium p-6 mb-6">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Transport Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className={labelCls}>Means of Transport</label><input className={inputCls} value={form.transportDetails.meansOfTransport} onChange={e => setForm(p => ({ ...p, transportDetails: { ...p.transportDetails, meansOfTransport: e.target.value } }))} placeholder="Sea / Air / Road" /></div>
          <div><label className={labelCls}>Vessel / Flight</label><input className={inputCls} value={form.transportDetails.vessel} onChange={e => setForm(p => ({ ...p, transportDetails: { ...p.transportDetails, vessel: e.target.value } }))} /></div>
          <div><label className={labelCls}>Departure Date</label><input type="date" className={inputCls} value={form.transportDetails.departureDate} onChange={e => setForm(p => ({ ...p, transportDetails: { ...p.transportDetails, departureDate: e.target.value } }))} /></div>
          <div><label className={labelCls}>Port of Loading</label><input className={inputCls} value={form.transportDetails.portOfLoading} onChange={e => setForm(p => ({ ...p, transportDetails: { ...p.transportDetails, portOfLoading: e.target.value } }))} /></div>
          <div><label className={labelCls}>Port of Discharge</label><input className={inputCls} value={form.transportDetails.portOfDischarge} onChange={e => setForm(p => ({ ...p, transportDetails: { ...p.transportDetails, portOfDischarge: e.target.value } }))} /></div>
        </div>
      </div>

      {/* Items */}
      <div className="card-premium p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Goods</h3>
          <button onClick={addItem} className="btn-secondary btn-sm inline-flex items-center gap-1"><AppIcon name="create" className="h-3.5 w-3.5" /> Add</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead><tr className="border-b border-slate-200 dark:border-slate-700">
              {['Marks', 'Description', 'HS Code', 'Quantity', 'Invoice No', 'Origin', ''].map(h => <th key={h} className="px-2 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">{h}</th>)}
            </tr></thead>
            <tbody>
              {form.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-1 py-1"><input className={inputCls + ' !py-1.5 !text-[11px]'} value={item.marks} onChange={e => updateItem(idx, 'marks', e.target.value)} /></td>
                  <td className="px-1 py-1"><input className={inputCls + ' !py-1.5 !text-[11px]'} value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} /></td>
                  <td className="px-1 py-1"><input className={inputCls + ' !py-1.5 !text-[11px] w-24'} value={item.hsCode} onChange={e => updateItem(idx, 'hsCode', e.target.value)} /></td>
                  <td className="px-1 py-1"><input className={inputCls + ' !py-1.5 !text-[11px] w-20'} value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} /></td>
                  <td className="px-1 py-1"><input className={inputCls + ' !py-1.5 !text-[11px] w-28'} value={item.invoiceNo} onChange={e => updateItem(idx, 'invoiceNo', e.target.value)} /></td>
                  <td className="px-1 py-1">
                    <select className={inputCls + ' !py-1.5 !text-[11px] w-16'} value={item.originCriteria} onChange={e => updateItem(idx, 'originCriteria', e.target.value)} title={ORIGIN_CRITERIA.find(o => o.code === item.originCriteria)?.description}>
                      {ORIGIN_CRITERIA.map(o => <option key={o.code} value={o.code}>{o.code}</option>)}
                    </select>
                  </td>
                  <td className="px-1 py-1">{form.items.length > 1 && <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1"><AppIcon name="x" className="h-3.5 w-3.5" /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-[10px] text-amber-700 dark:text-amber-400">
          <strong>Origin Criteria:</strong> {ORIGIN_CRITERIA.map(o => `${o.code} = ${o.label}`).join(' • ')}
        </div>
      </div>

      {/* Declaration & Authority */}
      <div className="card-premium p-6 mb-6">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Declaration & Issuing Authority</h3>
        <div className="space-y-4">
          <div><label className={labelCls}>Declaration Text</label><textarea className={inputCls + ' min-h-[80px]'} value={form.declarationText} onChange={e => setForm(p => ({ ...p, declarationText: e.target.value }))} /></div>
          <div><label className={labelCls}>Issuing Authority</label><select className={inputCls} value={form.issuingAuthority} onChange={e => setForm(p => ({ ...p, issuingAuthority: e.target.value }))}>
            {ISSUING_AUTHORITIES.map(a => <option key={a} value={a}>{a}</option>)}
          </select></div>
        </div>
      </div>

      {toast && <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom duration-300 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{toast.message}</div>}
    </main>
  );
}
