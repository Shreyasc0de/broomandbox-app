import React, { useState, useEffect } from 'react';
import { FileText, Search, User, Phone, Mail, Clock, DollarSign, RefreshCw, CheckCircle2, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

interface Quote {
    id: string;
    service_type: string;
    sq_ft: number;
    frequency: string;
    estimated_price: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    status: string;
    created_at: string;
}

const QuotesDashboard = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchQuotes = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/quotes');
            if (!res.ok) throw new Error('Failed to fetch quotes');
            const data = await res.json();
            setQuotes(data || []);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/quotes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Failed to update status');

            setQuotes(quotes.map(q => q.id === id ? { ...q, status: newStatus } : q));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'booked': return 'bg-green-100 text-green-800 border-green-200';
            case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredQuotes = quotes.filter(q =>
        q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Estimate Requests</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage inbound leads and pricing estimates.</p>
                </div>
                <button
                    onClick={fetchQuotes}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">New Requests</p>
                        <p className="text-2xl font-bold text-slate-900">{quotes.filter(q => q.status === 'new').length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Contacted (Pending)</p>
                        <p className="text-2xl font-bold text-slate-900">{quotes.filter(q => q.status === 'contacted').length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Successfully Booked</p>
                        <p className="text-2xl font-bold text-slate-900">{quotes.filter(q => q.status === 'booked').length}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by customer name or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="p-4 pl-6">Customer</th>
                                <th className="p-4">Service Required</th>
                                <th className="p-4">Estimate</th>
                                <th className="p-4">Date Submited</th>
                                <th className="p-4 pr-6 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
                                        Loading estimates...
                                    </td>
                                </tr>
                            ) : filteredQuotes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                        No quote requests found.
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                                                    {quote.customer_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{quote.customer_name}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {quote.customer_email}</span>
                                                        {quote.customer_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {quote.customer_phone}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-medium text-slate-900">{quote.service_type}</p>
                                            <p className="text-xs text-slate-500 mt-1">{quote.sq_ft} sq ft • {quote.frequency}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-emerald-600">${quote.estimated_price}</p>
                                            <p className="text-xs text-slate-500 mt-1">Per cleaning</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-slate-700">{new Date(quote.created_at).toLocaleDateString()}</p>
                                            <p className="text-xs text-slate-500 mt-1">{new Date(quote.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="relative inline-block text-left group/dropdown">
                                                <button className={`inline-flex flex-row items-center justify-between gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wide capitalize ${getStatusColor(quote.status)}`}>
                                                    {quote.status}
                                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-10 overflow-hidden">
                                                    <button onClick={() => updateStatus(quote.id, 'new')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-blue-700">New</button>
                                                    <button onClick={() => updateStatus(quote.id, 'contacted')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-yellow-700">Contacted</button>
                                                    <button onClick={() => updateStatus(quote.id, 'booked')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-emerald-700 border-y border-slate-100 font-medium">Booked!</button>
                                                    <button onClick={() => updateStatus(quote.id, 'archived')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-500">Archived</button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default QuotesDashboard;
