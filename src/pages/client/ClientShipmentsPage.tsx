import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import AppIcon from '../../components/AppIcon';
import StatusBadge from '../../components/StatusBadge';

export default function ClientShipmentsPage() {
  const { state: { shipments, user } } = useAppContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Delivered'>('All');

  const clientShipments = shipments.filter(s => s.clientName.toLowerCase().includes(user?.name.toLowerCase() || ''));

  const filteredShipments = clientShipments.filter(s => {
    const matchesSearch = s.id.toLowerCase().includes(search.toLowerCase()) || 
                          s.destinationCountry.toLowerCase().includes(search.toLowerCase()) ||
                          s.containerNumber.toLowerCase().includes(search.toLowerCase());
    
    const isActive = s.status !== 'Delivered';
    if (filter === 'Active' && !isActive) return false;
    if (filter === 'Delivered' && isActive) return false;
    
    return matchesSearch;
  });

  return (
    <div className="page-stack px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <header className="dashboard-grid-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>
            My Shipments
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Track and locate all your current and past shipments.
          </p>
        </div>
      </header>
      
      {/* Filters Overlay */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
             <AppIcon name="search" className="h-4 w-4 text-slate-400" />
           </div>
           <input
             type="text"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white"
             placeholder="Search by ID, Container or Location..."
           />
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl p-1 w-fit border border-slate-200/60 dark:border-slate-800/60">
           {(['All', 'Active', 'Delivered'] as const).map(tab => (
             <button
               key={tab}
               onClick={() => setFilter(tab)}
               className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                 filter === tab
                   ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                   : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="card-premium overflow-hidden">
        {filteredShipments.length === 0 ? (
           <div className="text-center py-16">
             <AppIcon name="folder" className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
             <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No shipments found</p>
             <p className="text-[11px] text-slate-500 mt-1">Check back later or adjust your search filters.</p>
           </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
             <table className="w-full text-left whitespace-nowrap min-w-[800px]">
               <thead>
                 <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                   <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tracking Reference</th>
                   <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Destination</th>
                   <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date Logged</th>
                   <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Estimated Delivery</th>
                   <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Status</th>
                   <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Links</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                 {filteredShipments.map(shipment => (
                   <tr key={shipment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                     <td className="px-6 py-4">
                       <p className="text-xs font-bold text-slate-900 dark:text-white mb-1"><span className="text-slate-400 font-medium select-none">ID: </span>{shipment.id}</p>
                       <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                         <span className="inline-flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-bold mr-1">C</span>
                         {shipment.containerNumber}
                       </p>
                     </td>
                     <td className="px-6 py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                       {shipment.destinationCountry}
                     </td>
                     <td className="px-6 py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                       {new Date(shipment.shipmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                     </td>
                     <td className="px-6 py-4 text-xs font-semibold text-slate-900 dark:text-slate-300">
                        {new Date(shipment.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                     </td>
                     <td className="px-6 py-4">
                       <StatusBadge value={shipment.status} />
                     </td>
                     <td className="px-6 py-4 text-right">
                       <Link 
                         to={`/track/${shipment.id}`}
                         className="btn-secondary px-3 py-1.5 text-[10px] inline-flex items-center shadow-sm"
                       >
                         Live Tracker
                       </Link>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
}
