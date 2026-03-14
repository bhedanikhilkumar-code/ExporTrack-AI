import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import AppIcon from '../../components/AppIcon';
import StatusBadge from '../../components/StatusBadge';

export default function ClientDashboardPage() {
  const { state: { shipments, user } } = useAppContext();

  // Filter shipments to only show those belonging to the current client mock name
  const clientShipments = shipments.filter(s => s.clientName.toLowerCase().includes(user?.name.toLowerCase() || ''));
  const activeShipments = clientShipments.filter(s => s.status !== 'Delivered');
  const deliveredShipments = clientShipments.filter(s => s.status === 'Delivered');

  return (
    <div className="page-stack px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>
          Welcome back, {user?.name}
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          Here is an overview of your active shipments and logistics performance.
        </p>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-premium relative overflow-hidden group border-indigo-200/50 dark:border-indigo-800/50">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 mb-4">
              <AppIcon name="shipments" className="h-6 w-6" strokeWidth={2} />
             </div>
             <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Active Shipments</p>
             <p className="text-3xl font-black text-slate-900 dark:text-white mt-1" style={{ letterSpacing: '-0.03em' }}>
               {activeShipments.length}
             </p>
          </div>
        </div>

        <div className="card-premium relative overflow-hidden group border-emerald-200/50 dark:border-emerald-800/50">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 mb-4">
              <AppIcon name="trend-up" className="h-6 w-6" strokeWidth={2} />
             </div>
             <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Delivered</p>
             <p className="text-3xl font-black text-slate-900 dark:text-white mt-1" style={{ letterSpacing: '-0.03em' }}>
               {deliveredShipments.length}
             </p>
          </div>
        </div>

        <div className="card-premium relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative">
             <div className="flex justify-between items-start mb-4">
               <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <AppIcon name="folder" className="h-6 w-6" strokeWidth={2} />
               </div>
               <Link to="/client/shipments" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors flex items-center gap-1">
                 View all <AppIcon name="trend-up" className="h-3 w-3 rotate-45" />
               </Link>
             </div>
             <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Tracked</p>
             <p className="text-3xl font-black text-slate-900 dark:text-white mt-1" style={{ letterSpacing: '-0.03em' }}>
               {clientShipments.length}
             </p>
          </div>
        </div>
      </div>

      {/* Active Shipments List */}
      <div className="card-premium">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">Live Active Shipments</h2>
        </div>
        
        {activeShipments.length === 0 ? (
          <div className="text-center py-12">
            <AppIcon name="shipments" className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No active shipments right now</p>
            <p className="text-[11px] text-slate-500 mt-1">When new shipments are created, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Shipment ID</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Destination</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Expected Delivery</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {activeShipments.slice(0, 5).map(shipment => (
                  <tr key={shipment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-4 py-4 text-xs font-bold text-slate-900 dark:text-white">
                      {shipment.id}
                      <div className="text-[10px] text-slate-500 font-medium tracking-wide mt-1">
                        {shipment.containerNumber}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {shipment.destinationCountry}
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                       {new Date(shipment.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={shipment.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link 
                        to={`/client/shipments/${shipment.id}`}
                        className="btn-secondary px-3 py-1.5 text-[10px] inline-flex items-center"
                      >
                        View Details
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
