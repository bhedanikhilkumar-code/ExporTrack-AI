import AppIcon from './AppIcon';

interface ChartData {
  month: string;
  value: number;
  previous?: number;
}

interface ShipmentAnalyticsProps {
  monthlyData: ChartData[];
  totalShipments: number;
  activeShipments: number;
  complianceRate: number;
  delayedShipments: number;
}

export default function ShipmentAnalytics({
  monthlyData,
  totalShipments,
  activeShipments,
  complianceRate,
  delayedShipments
}: ShipmentAnalyticsProps) {
  // Normalize chart data for visualization
  const maxValue = Math.max(...monthlyData.map((d) => d.value)) || 1;
  const chartHeight = 120;

  // Calculate bar width and spacing
  const bars = monthlyData.length;
  const barWidth = Math.max(20, Math.floor((100 / bars) * 0.6));
  const spacing = Math.floor((100 / bars) * 0.4);

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Shipments */}
        <div className="card-premium card-hover">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total Shipments
            </p>
            <div className="h-8 w-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <AppIcon name="shipments" className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-800 dark:text-slate-100">{totalShipments}</p>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">All-time shipments</p>
        </div>

        {/* Active Shipments */}
        <div className="card-premium card-hover">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Active
            </p>
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <AppIcon name="clock" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-800 dark:text-slate-100">{activeShipments}</p>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">In progress</p>
        </div>

        {/* Compliance Rate */}
        <div className="card-premium card-hover">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Compliance
            </p>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <AppIcon name="check" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-800 dark:text-slate-100">{complianceRate}%</p>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Documents verified</p>
        </div>

        {/* Delayed Shipments */}
        <div className="card-premium card-hover">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Delayed
            </p>
            <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <AppIcon name="warning" className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-800 dark:text-slate-100">{delayedShipments}</p>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Require attention</p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AppIcon name="shipments" className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-lg font-bold text-navy-800 dark:text-slate-100">Monthly Shipments</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Last 6 Months
          </span>
        </div>

        {/* Chart */}
        <div className="space-y-4">
          <div className="flex items-end justify-center gap-2 h-28 px-4">
            {monthlyData.map((data, idx) => {
              const heightPercent = (data.value / maxValue) * 100;
              const isHighest = data.value === maxValue;

              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  {/* Bar */}
                  <div className="w-full flex flex-col items-center">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer ${
                        isHighest
                          ? 'bg-gradient-to-t from-teal-600 to-teal-500'
                          : 'bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-500'
                      }`}
                      style={{ height: `${Math.max(heightPercent, 5)}px` }}
                      title={`${data.month}: ${data.value} shipments`}
                    />
                  </div>

                  {/* Label */}
                  <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 text-center">
                    {data.month}
                  </p>

                  {/* Value */}
                  <p className="text-xs font-bold text-navy-800 dark:text-slate-100">
                    {data.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Chart legend */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-teal-600" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Peak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-slate-300 dark:bg-slate-600" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Other</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Average</p>
            <p className="text-lg font-bold text-navy-800 dark:text-slate-100">
              {Math.round(monthlyData.reduce((sum, d) => sum + d.value, 0) / monthlyData.length)}
            </p>
          </div>
          <div className="text-center border-l border-r border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Peak</p>
            <p className="text-lg font-bold text-navy-800 dark:text-slate-100">{maxValue}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total</p>
            <p className="text-lg font-bold text-navy-800 dark:text-slate-100">
              {monthlyData.reduce((sum, d) => sum + d.value, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
