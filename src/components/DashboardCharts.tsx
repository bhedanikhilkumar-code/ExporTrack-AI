import { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import AppIcon from './AppIcon';
import {
    getShipmentStatusCounts,
    getMonthlyShipments,
    getDocumentStats,
    getActiveVsCompleted,
    getDemoChartData,
    StatusCount,
    MonthlyDataPoint
} from '../services/dashboardChartService';
import { Shipment } from '../types';

interface DashboardChartsProps {
    shipments: Shipment[];
    isDemo?: boolean;
}

/**
 * Empty state component
 */
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <AppIcon name="shipments" className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white text-center">
                No data available
            </p>
            <p className="text-xs text-slate-500 mt-1 text-center">
                Create your first shipment 📦
            </p>
        </div>
    );
}

/**
 * Custom tooltip for charts
 */
function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
}

/**
 * Shipment Status Distribution - Pie Chart
 */
function StatusPieChart({ data }: { data: StatusCount[] }) {
    if (data.length === 0) return <EmptyState />;

    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}

/**
 * Monthly Shipments - Bar Chart
 */
function MonthlyBarChart({ data }: { data: MonthlyDataPoint[] }) {
    if (data.length === 0 || data.every(d => d.shipments === 0)) return <EmptyState />;

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                    dataKey="shipments"
                    name="Shipments"
                    fill="#0d9488"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}

/**
 * Documents Uploaded - Line Chart
 */
function DocumentLineChart({ data }: { data: MonthlyDataPoint[] }) {
    if (data.length === 0 || data.every(d => d.documents === 0)) return <EmptyState />;

    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                    type="monotone"
                    dataKey="documents"
                    name="Documents"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1000}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

/**
 * Active vs Completed - Donut Chart
 */
function ActiveCompletedDonut({ data }: { data: StatusCount[] }) {
    if (data.length === 0 || data.every(d => d.count === 0)) return <EmptyState />;

    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}

/**
 * Main Dashboard Charts Component
 */
export default function DashboardCharts({ shipments, isDemo = false }: DashboardChartsProps) {
    // Process data - use demo data for demo users, real data for real users
    const chartData = useMemo(() => {
        if (isDemo || shipments.length === 0) {
            return getDemoChartData();
        }

        return {
            statusDistribution: getShipmentStatusCounts(shipments),
            monthlyData: getMonthlyShipments(shipments),
            activeVsCompleted: getActiveVsCompleted(shipments),
            deliveryPerformance: {
                onTime: shipments.filter(s => normalizeStatus(s.status) === 'Delivered' && !s.isDelayed).length,
                delayed: shipments.filter(s => normalizeStatus(s.status) === 'Delivered' && s.isDelayed).length
            }
        };
    }, [shipments, isDemo]);

    const hasData = shipments.length > 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Distribution - Pie Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                        <AppIcon name="dashboard" className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Status Distribution</h3>
                        <p className="text-[10px] text-slate-500">Shipment status breakdown</p>
                    </div>
                </div>
                <StatusPieChart data={chartData.statusDistribution} />
            </div>

            {/* Monthly Shipments - Bar Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <AppIcon name="bar-chart" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Shipments</h3>
                        <p className="text-[10px] text-slate-500">Shipments created per month</p>
                    </div>
                </div>
                <MonthlyBarChart data={chartData.monthlyData} />
            </div>

            {/* Documents Uploaded - Line Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                        <AppIcon name="dashboard" className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Documents Uploaded</h3>
                        <p className="text-[10px] text-slate-500">Document uploads over time</p>
                    </div>
                </div>
                <DocumentLineChart data={chartData.monthlyData} />
            </div>

            {/* Active vs Completed - Donut Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                        <AppIcon name="check" className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active vs Completed</h3>
                        <p className="text-[10px] text-slate-500">Current shipment status</p>
                    </div>
                </div>
                <ActiveCompletedDonut data={chartData.activeVsCompleted} />
            </div>
        </div>
    );
}

// Helper to import
function normalizeStatus(status: string): string {
    const statusMap: Record<string, string> = {
        'Shipment Created': 'Draft',
        'Driver Assigned': 'Booked',
        'Picked Up': 'Booked',
        'In Transit': 'In Transit',
        'Reached Hub': 'In Transit',
        'Out For Delivery': 'In Transit',
        'Customs Clearance': 'Customs Clearance',
        'Customs Hold': 'Customs Clearance',
        'Awaiting Documents': 'Customs Clearance',
        'Under Verification': 'Customs Clearance',
        'Under Review': 'Customs Clearance',
        'Delivered': 'Delivered',
        'Delayed': 'In Transit'
    };
    return statusMap[status] || 'Draft';
}
