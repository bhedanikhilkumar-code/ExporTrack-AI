import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import { Buyer } from '../types/contact';
import { contactApi } from '../services/api/contactApi';
import { useAppContext } from '../context/AppContext';

// Dummy data for initial UI
const DUMMY_BUYERS: Buyer[] = [
  {
    id: 'b-1',
    type: 'buyer',
    companyName: 'Global Trade Corp',
    contactPerson: 'Alice Smith',
    email: 'alice@globaltrade.local',
    phone: '+1 555-0100',
    address: '123 Trade Way',
    city: 'New York',
    country: 'USA',
    currency: 'USD',
    paymentTerms: '30 days LC',
    tags: ['high-value', 'repeat'],
    totalOrders: 15,
    totalValue: 1250000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b-2',
    type: 'buyer',
    companyName: 'Euro Imports GmbH',
    contactPerson: 'Hans Miller',
    email: 'hans@euroimports.local',
    phone: '+49 151-1234',
    address: '45 Berlin Str',
    city: 'Berlin',
    country: 'Germany',
    currency: 'EUR',
    paymentTerms: 'Advance',
    tags: ['europe', 'new-client'],
    totalOrders: 2,
    totalValue: 45000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export default function BuyersPage() {
  const navigate = useNavigate();
  const { isRealUser } = useAppContext();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load buyers from API or Dummy
  useEffect(() => {
    const loadBuyers = async () => {
      try {
        if (isRealUser) {
          const data = await contactApi.getBuyers();
          setBuyers(data.length > 0 ? data : DUMMY_BUYERS);
        } else {
          setBuyers(DUMMY_BUYERS);
        }
      } catch (error) {
        console.error('Failed to load buyers:', error);
        setBuyers(DUMMY_BUYERS);
      } finally {
        setLoading(false);
      }
    };
    loadBuyers();
  }, [isRealUser]);

  // New Buyer Form State
  const [formData, setFormData] = useState<Partial<Buyer>>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    currency: 'USD',
    paymentTerms: '30 days',
  });

  const uniqueCountries = useMemo(() => {
    const countries = new Set(buyers.map(b => b.country));
    return ['All', ...Array.from(countries)];
  }, [buyers]);

  const filteredBuyers = useMemo(() => {
    return buyers.filter(buyer => {
      const matchesSearch = buyer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        buyer.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCountry = selectedCountry === 'All' || buyer.country === selectedCountry;
      return matchesSearch && matchesCountry;
    });
  }, [buyers, searchQuery, selectedCountry]);

  // Country to Flag Emoji helper
  const getFlagEmoji = (countryCode: string) => {
    // Very rudimentary map for dummy data
    const codeMap: Record<string, string> = {
      'USA': '🇺🇸',
      'Germany': '🇩🇪',
      'India': '🇮🇳',
      'UK': '🇬🇧',
      'UAE': '🇦🇪',
    };
    return codeMap[countryCode] || '🏳️';
  };

  const handleSaveBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    const newBuyer: Buyer = {
      ...formData as Buyer,
      id: `b-${Date.now()}`,
      type: 'buyer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isRealUser) {
      try {
        await contactApi.saveBuyer(newBuyer);
      } catch (error) {
        console.error('Failed to save buyer to backend:', error);
      }
    }

    setBuyers([newBuyer, ...buyers]);
    setIsDrawerOpen(false);
    setFormData({ companyName: '', contactPerson: '', email: '', phone: '', country: '', city: '', currency: 'USD', paymentTerms: '30 days' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Buyers Directory</h1>
          <p className="text-sm text-slate-500">Manage your foreign customers and their preferences.</p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-500 hover:shadow-md active:scale-95"
        >
          <AppIcon name="plus" className="h-4 w-4" />
          Add New Buyer
        </button>
      </div>

      {/* Filters */}
      {loading && <div className="text-center py-4">Loading buyers...</div>}
      <div className="flex flex-col gap-3 md:flex-row md:items-center glass-premium p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <AppIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none"
          />
        </div>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none min-w-[150px]"
        >
          {uniqueCountries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Buyer Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBuyers.map(buyer => (
          <div
            key={buyer.id}
            onClick={() => navigate(`/buyers/${buyer.id}`)}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-teal-500/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 truncate dark:text-white flex items-center gap-2">
                  {getFlagEmoji(buyer.country)} {buyer.companyName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{buyer.city}, {buyer.country}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 dark:bg-slate-800 dark:group-hover:bg-teal-500/20">
                <AppIcon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800/60">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Value</p>
                <p className="font-medium text-slate-900 dark:text-white mt-1">
                  {buyer.currency} {(buyer.totalValue || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Orders</p>
                <p className="font-medium text-slate-900 dark:text-white mt-1">{buyer.totalOrders || 0}</p>
              </div>
            </div>

            {buyer.tags && buyer.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {buyer.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredBuyers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <AppIcon name="users" className="mx-auto h-12 w-12 opacity-20 mb-3" />
            <p>No buyers found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Add New Buyer */}
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Buyer</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <AppIcon name="x" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              <form id="buyer-form" onSubmit={handleSaveBuyer} className="space-y-4">
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
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Currency</label>
                    <select required
                      value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="AED">AED</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Payment Terms</label>
                    <input required
                      type="text" value={formData.paymentTerms} onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      placeholder="e.g. 30 days LC"
                    />
                  </div>
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
                  form="buyer-form"
                  className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-500"
                >
                  Save Buyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
