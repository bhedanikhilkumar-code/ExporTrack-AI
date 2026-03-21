import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import { Supplier } from '../types/contact';
import { contactApi } from '../services/api/contactApi';
import { useAppContext } from '../context/AppContext';

// Dummy data for initial UI
const DUMMY_SUPPLIERS: Supplier[] = [
  {
    id: 's-1',
    type: 'supplier',
    companyName: 'Apex Logistics Inc.',
    contactPerson: 'David Chen',
    email: 'david@apexlogistics.local',
    phone: '+1 800-555-0199',
    address: '450 Freight Road',
    city: 'Los Angeles',
    country: 'USA',
    gstin: '24AAAAA0000A1Z5',
    panNo: 'AAAAA0000A',
    productCategories: ['Freight', 'Customs Clearing'],
    paymentTerms: '15 Days',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 's-2',
    type: 'supplier',
    companyName: 'Shanghai Packaging Co.',
    contactPerson: 'Li Wei',
    email: 'contact@shanghaipack.local',
    phone: '+86 21-1234-5678',
    address: '88 Tech Park',
    city: 'Shanghai',
    country: 'China',
    productCategories: ['Packaging Materials', 'Boxes'],
    paymentTerms: 'Advance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export default function SuppliersPage() {
  const { isRealUser } = useAppContext();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load suppliers from API or Dummy
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        if (isRealUser) {
          const data = await contactApi.getSuppliers();
          setSuppliers(data.length > 0 ? data : DUMMY_SUPPLIERS);
        } else {
          setSuppliers(DUMMY_SUPPLIERS);
        }
      } catch (error) {
        console.error('Failed to load suppliers:', error);
        setSuppliers(DUMMY_SUPPLIERS);
      } finally {
        setLoading(false);
      }
    };
    loadSuppliers();
  }, [isRealUser]);

  // New Supplier Form State
  const [formData, setFormData] = useState<Partial<Supplier>>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    gstin: '',
    panNo: '',
    productCategories: [],
    paymentTerms: '30 days',
  });

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    suppliers.forEach(s => s.productCategories?.forEach(c => categories.add(c)));
    return ['All', ...Array.from(categories)];
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = supplier.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.productCategories?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || supplier.productCategories?.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [suppliers, searchQuery, selectedCategory]);

  const getFlagEmoji = (countryCode: string) => {
    const codeMap: Record<string, string> = {
      'USA': '🇺🇸',
      'China': '🇨🇳',
      'India': '🇮🇳',
      'Germany': '🇩🇪',
    };
    return codeMap[countryCode] || '🏳️';
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSupplier: Supplier = {
      ...formData as Supplier,
      id: `s-${Date.now()}`,
      type: 'supplier',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isRealUser) {
      try {
        await contactApi.saveSupplier(newSupplier);
      } catch (error) {
        console.error('Failed to save supplier to backend:', error);
      }
    }

    setSuppliers([newSupplier, ...suppliers]);
    setIsDrawerOpen(false);
    setFormData({ companyName: '', contactPerson: '', email: '', phone: '', country: '', city: '', gstin: '', panNo: '', productCategories: [], paymentTerms: '30 days' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Suppliers Directory</h1>
          <p className="text-sm text-slate-500">Manage your vendors, service providers, and source factories.</p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-500 hover:shadow-md active:scale-95"
        >
          <AppIcon name="plus" className="h-4 w-4" />
          Add New Supplier
        </button>
      </div>

      {/* Filters */}
      {loading && <div className="text-center py-4">Loading suppliers...</div>}
      <div className="flex flex-col gap-3 md:flex-row md:items-center glass-premium p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <AppIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none min-w-[150px]"
        >
          {uniqueCategories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Supplier Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.map(supplier => (
          <div
            key={supplier.id}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-teal-500/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 relative"
          >
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 truncate dark:text-white flex items-center gap-2">
                {getFlagEmoji(supplier.country)} {supplier.companyName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{supplier.city}, {supplier.country}</p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800/60 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Contact:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[120px]" title={supplier.email}>{supplier.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{supplier.phone}</span>
              </div>
            </div>

            {supplier.productCategories && supplier.productCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {supplier.productCategories.map(cat => (
                  <span key={cat} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredSuppliers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <AppIcon name="users" className="mx-auto h-12 w-12 opacity-20 mb-3" />
            <p>No suppliers found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Add New Supplier */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="relative z-50 w-full max-w-md bg-white shadow-2xl h-full flex flex-col dark:bg-slate-900 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Supplier</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <AppIcon name="x" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              <form id="supplier-form" onSubmit={handleSaveSupplier} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Company Name</label>
                  <input required
                    type="text" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Contact Person</label>
                    <input required
                      type="text" value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Email</label>
                    <input required
                      type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Phone</label>
                  <input required
                    type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">City</label>
                    <input required
                      type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Country</label>
                    <input required
                      type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">GSTIN / Tax ID</label>
                    <input
                      type="text" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">PAN / License No</label>
                    <input
                      type="text" value={formData.panNo} onChange={e => setFormData({ ...formData, panNo: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Payment Terms</label>
                  <input required
                    type="text" value={formData.paymentTerms} onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder="e.g. 15 Days"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Categories (comma separated)</label>
                  <input required
                    type="text"
                    onChange={e => setFormData({ ...formData, productCategories: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder="e.g. Freight, Packaging, Audit"
                  />
                </div>
              </form>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="supplier-form"
                  className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-500"
                >
                  Save Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
