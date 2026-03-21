import React, { useState, useEffect, useRef } from 'react';
import AppIcon from './AppIcon';
import { Buyer } from '../types/contact';

interface BuyerSelectorProps {
  onSelect: (buyer: Buyer | null) => void;
  selectedBuyerId?: string;
}

// Temporary dummy data
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export default function BuyerSelector({ onSelect, selectedBuyerId }: BuyerSelectorProps) {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real app, fetch buyers from API
    setBuyers(DUMMY_BUYERS);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedBuyer = buyers.find(b => b.id === selectedBuyerId);

  const filteredBuyers = buyers.filter(b => 
    b.companyName.toLowerCase().includes(search.toLowerCase()) || 
    b.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all hover:bg-slate-50 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800/50"
      >
        <div className="flex items-center gap-3">
          <AppIcon name="users" className="h-4 w-4 text-slate-400" />
          {selectedBuyer ? (
            <span className="font-medium text-slate-900 dark:text-white">
              {selectedBuyer.companyName} <span className="text-slate-500 text-xs font-normal">({selectedBuyer.country})</span>
            </span>
          ) : (
            <span className="text-slate-400">Select a Buyer...</span>
          )}
        </div>
        <AppIcon 
          name="chevronDown" 
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-2">
          <div className="p-2 sticky top-0 bg-white dark:bg-slate-900">
            <input
              type="text"
              placeholder="Search buyers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="flex flex-col gap-1 p-1">
            {filteredBuyers.length > 0 ? (
              filteredBuyers.map(buyer => (
                <button
                  key={buyer.id}
                  onClick={() => {
                    onSelect(buyer);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`flex flex-col items-start justify-center rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 w-full ${
                    selectedBuyerId === buyer.id ? 'bg-teal-50 dark:bg-teal-500/10' : ''
                  }`}
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{buyer.companyName}</span>
                  <span className="text-[10px] text-slate-500">{buyer.contactPerson} • {buyer.city}, {buyer.country}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                No buyers found
              </div>
            )}
            
            <div className="mt-1 border-t border-slate-100 p-2 dark:border-slate-800">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Ideally, open a "Quick Add Buyer" modal here, but for now just console.log or handle
                  console.log('Add new buyer clicked');
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-500/10"
              >
                <AppIcon name="plus" className="h-3 w-3" />
                Add New Buyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
