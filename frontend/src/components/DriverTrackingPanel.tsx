import React from 'react';
import { ShipmentTracking } from '../types';
import AppIcon from './AppIcon';

interface DriverTrackingPanelProps {
  tracking: ShipmentTracking;
  shipment: {
    driverName?: string;
    driverPhone?: string;
    vehicleNumber?: string;
  };
}

export default function DriverTrackingPanel({ tracking, shipment }: DriverTrackingPanelProps) {
  const tele = tracking.driverTele;
  
  return (
    <div className="card-premium h-full flex flex-col justify-between overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/30">
      <div className="space-y-6">
        {/* Header with Live Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                <AppIcon name="user" className="h-6 w-6" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {shipment.driverName || 'Verified Driver'}
              </h3>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Active in Transit
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle</span>
             <span className="text-xs font-black text-slate-700 dark:text-slate-300 font-mono">
                {shipment.vehicleNumber || 'X-TRACK-01'}
             </span>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <AppIcon name="clock" className="h-3 w-3 text-slate-400" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Speed</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {tele?.speed || 0}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">km/h</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <AppIcon name="ai-extract" className="h-3 w-3 text-indigo-500" />
              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Real-Time ETA</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {tele ? '42' : '--'}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">mins</span>
            </div>
          </div>
        </div>

        {/* GPS Coordinates */}
        <div className="space-y-3">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GPS Satellite Stream</span>
              <div className="flex h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 animate-pulse w-3/4"></div>
              </div>
           </div>
           <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                 <span className="font-medium text-slate-500">Latitude</span>
                 <span className="font-mono text-slate-900 dark:text-white font-bold">
                    {tele?.latitude.toFixed(6) || tracking.latitude.toFixed(6)}°
                 </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                 <span className="font-medium text-slate-500">Longitude</span>
                 <span className="font-mono text-slate-900 dark:text-white font-bold">
                    {tele?.longitude.toFixed(6) || tracking.longitude.toFixed(6)}°
                 </span>
              </div>
           </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-widest py-3 transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
          <AppIcon name="share" className="h-3 w-3" />
          Call Driver
        </button>
        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all">
          <AppIcon name="dashboard" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
