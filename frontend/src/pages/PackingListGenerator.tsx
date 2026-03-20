/**
 * Packing List Generator Page
 * Form with Import from Invoice, per-row dimensions, auto-CBM calculation
 */
import { useState, useMemo, useCallback } from 'react';
import AppIcon from '../components/AppIcon';
import { PackingList, PackageItem, createEmptyPackingList, calculateCBM } from '../types/packingList';
import { CommercialInvoice } from '../types/invoice';
import { getDocumentStatusClasses, DocumentStatus } from '../utils/documentUtils';
import { generatePackingListPDF } from '../utils/packingListPdfGenerator';
import ShowForPermission from '../components/ShowForPermission';
import { UNITS } from '../types/invoice';
import { useAppContext } from '../context/AppContext';

export default function PackingListGenerator() {
  const { state, savePackingList, deletePackingList, getNextDocumentNumber } = useAppContext();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showList, setShowList] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const packingLists = state.packingLists;
  const invoices = state.invoices;
  const [form, setForm] = useState(createEmptyPackingList());

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };


  const importFromInvoice = (invId: string) => {
    const inv = invoices.find((i: CommercialInvoice) => i.id === invId);
    if (!inv) return;
    setForm(prev => ({
      ...prev,
      linkedInvoiceId: inv.id,
      exporterDetails: { name: inv.exporterDetails.name, address: inv.exporterDetails.address },
      buyerDetails: { name: inv.buyerDetails.name, address: inv.buyerDetails.address, country: inv.buyerDetails.country },
      shipmentDetails: { ...prev.shipmentDetails, portOfLoading: inv.shipmentDetails.portOfLoading, portOfDischarge: inv.shipmentDetails.portOfDischarge },
      packages: inv.items.map((item: any, i: number) => ({
        packageNo: `PKG-${String(i + 1).padStart(3, '0')}`,
        description: item.description,
        hsCode: item.hsCode,
        quantity: item.quantity,
        unit: item.unit,
        netWeight: item.netWeight,
        grossWeight: item.grossWeight,
        dimensions: { length: 0, width: 0, height: 0, unit: 'cm' as const },
        cbm: 0,
      })),
    }));
    showToast('Imported from invoice');
  };

  const handleNew = () => { setForm(createEmptyPackingList()); setEditingId(null); setShowList(false); };

  const handleEdit = (pl: PackingList) => {
    if (pl.status === 'Final') { showToast('Finalized packing lists cannot be edited', 'error'); return; }
    setForm({ plDate: pl.plDate, status: pl.status, exporterDetails: { ...pl.exporterDetails }, buyerDetails: { ...pl.buyerDetails }, shipmentDetails: { ...pl.shipmentDetails }, packages: pl.packages.map(p => ({ ...p, dimensions: { ...p.dimensions } })), totalPackages: pl.totalPackages, totalNetWeight: pl.totalNetWeight, totalGrossWeight: pl.totalGrossWeight, totalVolume: pl.totalVolume, linkedDocuments: pl.linkedDocuments || [] });
    setEditingId(pl.id);
    setShowList(false);
  };

  const handleDuplicate = (pl: PackingList) => {
    setForm({ ...createEmptyPackingList(), exporterDetails: { ...pl.exporterDetails }, buyerDetails: { ...pl.buyerDetails }, shipmentDetails: { ...pl.shipmentDetails }, packages: pl.packages.map(p => ({ ...p, dimensions: { ...p.dimensions } })) });
    setEditingId(null); setShowList(false);
    showToast('Packing list duplicated');
  };

  const recalcTotals = (pkgs: PackageItem[]) => {
    return {
      totalPackages: pkgs.length,
      totalNetWeight: pkgs.reduce((s, p) => s + p.netWeight, 0),
      totalGrossWeight: pkgs.reduce((s, p) => s + p.grossWeight, 0),
      totalVolume: pkgs.reduce((s, p) => s + p.cbm, 0),
    };
  };

  const updatePackage = (idx: number, field: string, value: any) => {
    setForm(prev => {
      const pkgs = [...prev.packages];
      if (field.startsWith('dimensions.')) {
        const dimField = field.split('.')[1];
        pkgs[idx] = { ...pkgs[idx], dimensions: { ...pkgs[idx].dimensions, [dimField]: value } };
      } else {
        pkgs[idx] = { ...pkgs[idx], [field]: value };
      }
      // Recalc CBM
      const d = pkgs[idx].dimensions;
      pkgs[idx].cbm = calculateCBM(d.length, d.width, d.height, d.unit);
      return { ...prev, packages: pkgs, ...recalcTotals(pkgs) };
    });
  };

  const addPackage = () => {
    setForm(prev => {
      const pkgs = [...prev.packages, { packageNo: `PKG-${String(prev.packages.length + 1).padStart(3, '0')}`, description: '', hsCode: '', quantity: 0, unit: 'PCS', netWeight: 0, grossWeight: 0, dimensions: { length: 0, width: 0, height: 0, unit: 'cm' as const }, cbm: 0 }];
      return { ...prev, packages: pkgs, ...recalcTotals(pkgs) };
    });
  };

  const removePackage = (idx: number) => {
    setForm(prev => {
      const pkgs = prev.packages.filter((_: any, i: number) => i !== idx).map((p: PackageItem, i: number) => ({ ...p, packageNo: `PKG-${String(i + 1).padStart(3, '0')}` }));
      return { ...prev, packages: pkgs, ...recalcTotals(pkgs) };
    });
  };

  const handleSave = () => {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const totals = recalcTotals(form.packages);
      if (editingId) {
        const pl = packingLists.find(p => p.id === editingId);
        if (pl) {
          savePackingList({ ...pl, ...form, ...totals, updatedAt: now });
          showToast('Packing list updated');
        }
      } else {
        const newPL: PackingList = { 
          ...form, 
          ...totals, 
          id: `pl-${Date.now()}`, 
          plNumber: getNextDocumentNumber('PL'), 
          createdAt: now, 
          updatedAt: now 
        };
        savePackingList(newPL);
        setEditingId(newPL.id);
        showToast('Packing list saved');
      }
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const handleFinalize = (id: string) => { 
    const pl = packingLists.find((p: PackingList) => p.id === id);
    if (pl) {
      savePackingList({ ...pl, status: 'Final', updatedAt: new Date().toISOString() });
      showToast('Finalized'); 
    }
  };
  const handleCancel = (id: string) => {
    const pl = packingLists.find((p: PackingList) => p.id === id);
    if (pl) {
      savePackingList({ ...pl, status: 'Cancelled', updatedAt: new Date().toISOString() });
      showToast('Cancelled');
    }
  };
  const handleDelete = (id: string) => { deletePackingList(id); showToast('Deleted'); };

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
  const labelCls = 'block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5';

  if (showList) {
    return (
      <main className="page-stack animate-in fade-in duration-500">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Packing Lists</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate packing lists linked to invoices</p>
          </div>
          <ShowForPermission permission="manage_documents">
            <button onClick={handleNew} className="btn-primary inline-flex items-center gap-2"><AppIcon name="create" className="h-4 w-4" /> New Packing List</button>
          </ShowForPermission>
        </header>
        {packingLists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 shadow-lg"><AppIcon name="package" className="h-10 w-10 text-blue-600 dark:text-blue-400" /></div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Packing Lists Yet</h2>
            <p className="text-sm text-slate-500 max-w-md mb-6">Create your first packing list to get started.</p>
            <ShowForPermission permission="manage_documents"><button onClick={handleNew} className="btn-primary inline-flex items-center gap-2"><AppIcon name="create" className="h-4 w-4" /> Create First Packing List</button></ShowForPermission>
          </div>
        ) : (
          <div className="grid gap-4">
            {packingLists.map(pl => {
              const statusCls = getDocumentStatusClasses(pl.status);
              return (
                <div key={pl.id} className="card-premium p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-lg transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{pl.plNumber}</span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusCls.bg} ${statusCls.text} ${statusCls.border}`}>{pl.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{pl.buyerDetails.name || 'No buyer'} • {pl.totalPackages} pkgs • {pl.totalVolume.toFixed(2)} CBM • {pl.plDate}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => generatePackingListPDF(pl)} className="btn-secondary btn-sm" title="PDF"><AppIcon name="download" className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDuplicate(pl)} className="btn-secondary btn-sm" title="Duplicate"><AppIcon name="copy" className="h-3.5 w-3.5" /></button>
                    {pl.status === 'Draft' && (<>
                      <button onClick={() => handleEdit(pl)} className="btn-secondary btn-sm"><AppIcon name="edit" className="h-3.5 w-3.5" /></button>
                      <ShowForPermission permission="approve_documents"><button onClick={() => handleFinalize(pl.id)} className="btn-primary btn-sm text-[10px]">Finalize</button></ShowForPermission>
                      <ShowForPermission permission="manage_documents"><button onClick={() => handleDelete(pl.id)} className="btn-sm text-[10px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-2 py-1">Delete</button></ShowForPermission>
                    </>)}
                    {pl.status === 'Final' && <ShowForPermission permission="approve_documents"><button onClick={() => handleCancel(pl.id)} className="btn-sm text-[10px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-2 py-1">Cancel</button></ShowForPermission>}
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

  // ── FORM VIEW ──
  return (
    <main className="page-stack animate-in fade-in duration-500">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowList(true)} className="btn-secondary btn-sm"><AppIcon name="chevron-left" className="h-4 w-4" /></button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{editingId ? 'Edit Packing List' : 'New Packing List'}</h1>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary btn-sm">{saving ? 'Saving...' : 'Save'}</button>
      </header>

      {/* Import from Invoice */}
      {invoices.length > 0 && !editingId && (
        <div className="card-premium p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
          <div className="flex items-center gap-3">
            <AppIcon name="file-text" className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Import from Invoice</p>
              <p className="text-[10px] text-slate-500">Pre-fill details from an existing commercial invoice</p>
            </div>
            <select onChange={e => e.target.value && importFromInvoice(e.target.value)} className={inputCls + ' !w-48'} defaultValue="">
              <option value="">Select invoice...</option>
              {invoices.map(inv => <option key={inv.id} value={inv.id}>{inv.invoiceNumber}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Basic Details */}
      <div className="card-premium p-6 space-y-4 mb-6">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className={labelCls}>Exporter Name</label><input className={inputCls} value={form.exporterDetails.name} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, name: e.target.value } }))} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Exporter Address</label><input className={inputCls} value={form.exporterDetails.address} onChange={e => setForm(p => ({ ...p, exporterDetails: { ...p.exporterDetails, address: e.target.value } }))} /></div>
          <div><label className={labelCls}>Buyer Name</label><input className={inputCls} value={form.buyerDetails.name} onChange={e => setForm(p => ({ ...p, buyerDetails: { ...p.buyerDetails, name: e.target.value } }))} /></div>
          <div><label className={labelCls}>Buyer Country</label><input className={inputCls} value={form.buyerDetails.country} onChange={e => setForm(p => ({ ...p, buyerDetails: { ...p.buyerDetails, country: e.target.value } }))} /></div>
          <div><label className={labelCls}>Buyer Address</label><input className={inputCls} value={form.buyerDetails.address} onChange={e => setForm(p => ({ ...p, buyerDetails: { ...p.buyerDetails, address: e.target.value } }))} /></div>
          <div><label className={labelCls}>Port of Loading</label><input className={inputCls} value={form.shipmentDetails.portOfLoading} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, portOfLoading: e.target.value } }))} /></div>
          <div><label className={labelCls}>Port of Discharge</label><input className={inputCls} value={form.shipmentDetails.portOfDischarge} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, portOfDischarge: e.target.value } }))} /></div>
          <div><label className={labelCls}>Marks & Numbers</label><input className={inputCls} value={form.shipmentDetails.marksAndNumbers} onChange={e => setForm(p => ({ ...p, shipmentDetails: { ...p.shipmentDetails, marksAndNumbers: e.target.value } }))} placeholder="MADE IN INDIA" /></div>
        </div>
      </div>

      {/* Package Items */}
      <div className="card-premium p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Packages</h3>
          <button onClick={addPackage} className="btn-secondary btn-sm inline-flex items-center gap-1"><AppIcon name="create" className="h-3.5 w-3.5" /> Add Package</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {['Pkg #', 'Description', 'HS Code', 'Qty', 'Unit', 'Net Wt', 'Gross Wt', 'L', 'W', 'H', 'Unit', 'CBM', ''].map(h => (
                  <th key={h} className="px-1.5 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {form.packages.map((pkg, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-1.5 py-1 text-[10px] font-mono text-slate-500">{pkg.packageNo}</td>
                  <td className="px-1 py-1"><input className={inputCls + ' !py-1.5 !text-[11px]'} value={pkg.description} onChange={e => updatePackage(idx, 'description', e.target.value)} /></td>
                  <td className="px-1 py-1"><input className={inputCls + ' !py-1.5 !text-[11px] w-20'} value={pkg.hsCode} onChange={e => updatePackage(idx, 'hsCode', e.target.value)} /></td>
                  <td className="px-1 py-1"><input type="number" className={inputCls + ' !py-1.5 !text-[11px] w-14'} value={pkg.quantity || ''} onChange={e => updatePackage(idx, 'quantity', parseFloat(e.target.value) || 0)} /></td>
                  <td className="px-1 py-1"><select className={inputCls + ' !py-1.5 !text-[11px] w-16'} value={pkg.unit} onChange={e => updatePackage(idx, 'unit', e.target.value)}>{UNITS.map(u => <option key={u}>{u}</option>)}</select></td>
                  <td className="px-1 py-1"><input type="number" step="0.01" className={inputCls + ' !py-1.5 !text-[11px] w-16'} value={pkg.netWeight || ''} onChange={e => updatePackage(idx, 'netWeight', parseFloat(e.target.value) || 0)} /></td>
                  <td className="px-1 py-1"><input type="number" step="0.01" className={inputCls + ' !py-1.5 !text-[11px] w-16'} value={pkg.grossWeight || ''} onChange={e => updatePackage(idx, 'grossWeight', parseFloat(e.target.value) || 0)} /></td>
                  <td className="px-1 py-1"><input type="number" className={inputCls + ' !py-1.5 !text-[11px] w-12'} value={pkg.dimensions.length || ''} onChange={e => updatePackage(idx, 'dimensions.length', parseFloat(e.target.value) || 0)} /></td>
                  <td className="px-1 py-1"><input type="number" className={inputCls + ' !py-1.5 !text-[11px] w-12'} value={pkg.dimensions.width || ''} onChange={e => updatePackage(idx, 'dimensions.width', parseFloat(e.target.value) || 0)} /></td>
                  <td className="px-1 py-1"><input type="number" className={inputCls + ' !py-1.5 !text-[11px] w-12'} value={pkg.dimensions.height || ''} onChange={e => updatePackage(idx, 'dimensions.height', parseFloat(e.target.value) || 0)} /></td>
                  <td className="px-1 py-1"><select className={inputCls + ' !py-1.5 !text-[11px] w-14'} value={pkg.dimensions.unit} onChange={e => updatePackage(idx, 'dimensions.unit', e.target.value)}><option>cm</option><option>inch</option></select></td>
                  <td className="px-1.5 py-1 text-[10px] font-bold text-teal-700 dark:text-teal-400 tabular-nums">{pkg.cbm.toFixed(4)}</td>
                  <td className="px-1 py-1">{form.packages.length > 1 && <button onClick={() => removePackage(idx)} className="text-red-400 hover:text-red-600 p-1"><AppIcon name="x" className="h-3.5 w-3.5" /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Totals */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div><span className="text-[10px] text-slate-500 uppercase font-bold">Packages</span><p className="text-sm font-black text-slate-900 dark:text-white">{form.packages.length}</p></div>
          <div><span className="text-[10px] text-slate-500 uppercase font-bold">Net Weight</span><p className="text-sm font-black">{form.packages.reduce((s, p) => s + p.netWeight, 0).toFixed(2)} kg</p></div>
          <div><span className="text-[10px] text-slate-500 uppercase font-bold">Gross Weight</span><p className="text-sm font-black">{form.packages.reduce((s, p) => s + p.grossWeight, 0).toFixed(2)} kg</p></div>
          <div><span className="text-[10px] text-slate-500 uppercase font-bold">Total CBM</span><p className="text-sm font-black text-teal-700 dark:text-teal-400">{form.packages.reduce((s, p) => s + p.cbm, 0).toFixed(4)}</p></div>
        </div>
      </div>

      {toast && <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom duration-300 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{toast.message}</div>}
    </main>
  );
}
