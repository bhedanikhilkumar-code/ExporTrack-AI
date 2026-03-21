import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import { Buyer } from '../types/contact';
import { Shipment, ShipmentDocument } from '../types'; // Adjusting to the src/types.ts file

// Mock data
const MOCK_BUYER: Buyer = {
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
};

const MOCK_SHIPMENTS: Partial<Shipment>[] = [
  { id: 'SHP-12345', clientName: 'Global Trade Corp', destinationCountry: 'USA', status: 'In Transit', shipmentDate: '2023-10-01' },
];

const MOCK_DOCS: Partial<ShipmentDocument>[] = [
  { id: 'doc-1', type: 'Invoice', fileName: 'INV-1002.pdf', status: 'Verified', uploadedAt: '2023-10-02' },
];

export default function BuyerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [buyer] = useState<Buyer>(MOCK_BUYER); // Use id to fetch real buyer eventually
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'shipments' | 'notes'>('info');
  const [notes, setNotes] = useState(buyer.notes || '');

  const handleSaveNotes = () => {
    // Save notes API call here
    alert('Notes saved successfully!');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/buyers')}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <AppIcon name="arrow-right" className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {buyer.companyName}
            </h1>
            <p className="text-sm text-slate-500">Buyer ID: {buyer.id}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
          Edit Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'info', label: 'Company Info' },
          { id: 'documents', label: 'Documents' },
          { id: 'shipments', label: 'Shipments' },
          { id: 'notes', label: 'Notes' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-bold transition-all relative ${
              activeTab === tab.id
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass-premium rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-h-[400px]">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Contact Details</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 items-center text-sm text-slate-700 dark:text-slate-300">
                    <AppIcon name="user" className="h-4 w-4 text-slate-400" />
                    {buyer.contactPerson}
                  </div>
                  <div className="flex gap-3 items-center text-sm text-slate-700 dark:text-slate-300">
                    <AppIcon name="globe" className="h-4 w-4 text-slate-400" />
                    {buyer.email}
                  </div>
                  <div className="flex gap-3 items-center text-sm text-slate-700 dark:text-slate-300">
                    <AppIcon name="dashboard" className="h-4 w-4 text-slate-400" /> {/* substitute for phone icon */}
                    {buyer.phone}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Address</h3>
                <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <p>{buyer.address}</p>
                  <p>{buyer.city}, {buyer.country}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Business Terms</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Currency</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{buyer.currency}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Terms</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{buyer.paymentTerms}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Metrics</h3>
                <div className="flex gap-2 mb-3">
                  {buyer.tags?.map(t => (
                    <span key={t} className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Total Value</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">${buyer.totalValue?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Orders</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{buyer.totalOrders}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Linked Documents</h3>
            {MOCK_DOCS.map(doc => (
              <div key={doc.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-teal-50 p-2 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                    <AppIcon name="file" className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{doc.fileName}</p>
                    <p className="text-xs text-slate-500">{doc.type} • {doc.uploadedAt}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shipments' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Past Shipments</h3>
            {MOCK_SHIPMENTS.map(shipment => (
              <div key={shipment.id} className="flex flex-col gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{shipment.id}</p>
                  <p className="text-xs text-slate-500 mt-1">{shipment.destinationCountry} • {shipment.shipmentDate}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {shipment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Private Notes</h3>
              <p className="text-xs text-slate-500">Only visible to your team</p>
            </div>
            <textarea
              className="w-full h-40 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white placeholder:text-slate-400"
              placeholder="Add any internal notes about this buyer..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <div className="flex justify-end">
              <button 
                onClick={handleSaveNotes}
                className="rounded-xl bg-teal-600 px-6 py-2 text-sm font-bold text-white hover:bg-teal-500 active:scale-95 transition-all"
              >
                Save Notes
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
