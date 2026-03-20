import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    DollarSign,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Download,
    Loader2
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { apiRequest } from '../lib/api';
import { showToast } from '../lib/toast';
import StatCard from '../components/admin/StatCard';

interface ChartDataPoint {
    name: string;
    revenue: number;
    customers: number;
}

interface AnalyticsData {
    chartData: ChartDataPoint[];
    totals: {
        revenue: number;
        customers: number;
    };
}

const Analytics = () => {
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [totals, setTotals] = useState({ revenue: 0, customers: 0 });
    const [loading, setLoading] = useState(true);
    const [months, setMonths] = useState(6);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            const result = await apiRequest<AnalyticsData>(`/api/analytics?months=${months}`);
            
            if (result.error) {
                showToast.error('Failed to load analytics data');
                setData([]);
            } else if (result.data) {
                setData(result.data.chartData);
                setTotals(result.data.totals);
            }
            setLoading(false);
        };

        fetchAnalytics();
    }, [months]);

    const handleExportReport = () => {
        // Generate CSV content
        const headers = ['Month', 'Revenue ($)', 'Customers'];
        const rows = data.map(d => [d.name, d.revenue.toString(), d.customers.toString()]);
        rows.push(['Total', totals.revenue.toString(), totals.customers.toString()]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast.success('Report exported successfully');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics & Insights</h1>
                    <p className="text-sm text-slate-500">Track your business growth and performance metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExportReport}
                        className="flex items-center gap-2 bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    label="Total Revenue"
                    value={`$${totals.revenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                    delay={0}
                />
                <StatCard
                    label="New Customers"
                    value={totals.customers}
                    icon={Users}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                    delay={1}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-slate-900">Revenue Overview</h3>
                        <select 
                            value={months}
                            onChange={(e) => setMonths(parseInt(e.target.value))}
                            className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 px-3 py-1.5 outline-none cursor-pointer"
                        >
                            <option value={6}>Last 6 Months</option>
                            <option value={12}>Last Year</option>
                        </select>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-slate-900">New Customers</h3>
                        <select 
                            value={months}
                            onChange={(e) => setMonths(parseInt(e.target.value))}
                            className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 px-3 py-1.5 outline-none cursor-pointer"
                        >
                            <option value={6}>Last 6 Months</option>
                            <option value={12}>Last Year</option>
                        </select>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="customers" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
