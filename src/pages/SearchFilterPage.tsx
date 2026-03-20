import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import AppIcon from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';
import { REQUIRED_DOCUMENT_TYPES } from '../types';
import { Skeleton, SkeletonText } from '../components/SkeletonLoader';

export default function SearchFilterPage() {
  const {
    state: { shipments }
  } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [shipmentId, setShipmentId] = useState('');
  const [clientName, setClientName] = useState('');
  const [destination, setDestination] = useState('');
  const [shipmentDate, setShipmentDate] = useState('');
  const [docType, setDocType] = useState('');

  // Debounced search terms for performance
  const [debouncedTerms, setDebouncedTerms] = useState({ id: '', client: '', country: '' });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerms({ id: shipmentId, client: clientName, country: destination });
    }, 300);
    return () => clearTimeout(handler);
  }, [shipmentId, clientName, destination]);

  const filteredShipments = useMemo(() => {
    const searchId = debouncedTerms.id.toLowerCase();
    const searchClient = debouncedTerms.client.toLowerCase();
    const searchCountry = debouncedTerms.country.toLowerCase();

    return shipments.filter((shipment) => {
      const matchesShipmentId = shipment.id.toLowerCase().includes(searchId);
      const matchesClient = shipment.clientName.toLowerCase().includes(searchClient);
      const matchesDestination = shipment.destinationCountry.toLowerCase().includes(searchCountry);
      const matchesDate = shipmentDate ? shipment.shipmentDate === shipmentDate : true;
      const matchesDocType = docType ? shipment.documents.some((doc) => doc.type === docType) : true;

      return matchesShipmentId && matchesClient && matchesDestination && matchesDate && matchesDocType;
    });
  }, [shipments, debouncedTerms, shipmentDate, docType]);

  return (
    <div className="page-stack">
      <PageHeader title="Smart Search & Filter" subtitle="Find shipments quickly by ID, client, destination, date, and document type." />

      <section className="card-panel">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="shipment-id-filter" className="input-label">
              Shipment ID
            </label>
            <input
              id="shipment-id-filter"
              value={shipmentId}
              onChange={(event) => setShipmentId(event.target.value)}
              className="input-field"
              placeholder="EXP-2026-001"
            />
          </div>
          <div>
            <label htmlFor="client-filter" className="input-label">
              Client Name
            </label>
            <input
              id="client-filter"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              className="input-field"
              placeholder="Apex Retail Imports"
            />
          </div>
          <div>
            <label htmlFor="destination-filter" className="input-label">
              Destination Country
            </label>
            <input
              id="destination-filter"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="input-field"
              placeholder="Germany"
            />
          </div>
          <div>
            <label htmlFor="date-filter" className="input-label">
              Shipment Date
            </label>
            <input
              id="date-filter"
              type="date"
              value={shipmentDate}
              onChange={(event) => setShipmentDate(event.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="doc-type-filter" className="input-label">
              Document Type
            </label>
            <select
              id="doc-type-filter"
              value={docType}
              onChange={(event) => setDocType(event.target.value)}
              className="input-field"
            >
              <option value="">All document types</option>
              {REQUIRED_DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setShipmentId('');
                setClientName('');
                setDestination('');
                setShipmentDate('');
                setDocType('');
              }}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Search Results</h3>
              <p className="text-[11px] font-medium text-slate-500 mt-1">{filteredShipments.length} records found matching your criteria</p>
           </div>
        </div>
        
        <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-1 ${!loading ? 'skeleton-fade-in' : ''}`}>
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="card-premium p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                          <SkeletonText width="w-24" height="h-4" />
                          <SkeletonText width="w-16" height="h-3" />
                       </div>
                       <SkeletonText width="w-40" height="h-3" />
                       <div className="flex items-center gap-3 pt-1">
                          <SkeletonText width="w-20" height="h-2" />
                          <SkeletonText width="w-20" height="h-2" />
                       </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <SkeletonText width="w-12" height="h-2" />
                     <Skeleton className="h-6 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredShipments.map((shipment) => (
              <Link 
                to={`/shipments/${shipment.id}`} 
                key={shipment.id} 
                className="card-premium group block hover:no-underline"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-teal-500/10 flex items-center justify-center text-teal-400">
                      <AppIcon name="shipments" className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">{shipment.id}</h4>
                         <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">{shipment.containerNumber}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                        {shipment.clientName}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                         <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                            <AppIcon name="clock" className="h-3 w-3" />
                            {shipment.shipmentDate}
                         </div>
                         <div className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                         <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                            <AppIcon name="search" className="h-3 w-3" />
                            {shipment.destinationCountry}
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/50">
                     <div className="flex flex-col items-end">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
                        <StatusBadge value={shipment.status} />
                     </div>
                     <div className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:border-teal-500 group-hover:text-teal-500 transition-all">
                        <AppIcon name="chevron-right" className="h-4 w-4" />
                     </div>
                  </div>
                </div>
              </Link>
            ))
          )}
          
          {!loading && filteredShipments.length === 0 && (
            <div className="py-20 text-center card-premium border-dashed">
               <div className="mx-auto h-16 w-16 rounded-3xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
                  <AppIcon name="search" className="h-8 w-8" strokeWidth={1} />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">No shipments found</h3>
               <p className="text-sm text-slate-500 mt-2">Try adjusting your filters to find what you're looking for.</p>
               <button 
                 onClick={() => {
                   setShipmentId('');
                   setClientName('');
                   setDestination('');
                   setShipmentDate('');
                   setDocType('');
                 }}
                 className="btn-secondary mt-6"
               >
                 Reset Search
               </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
