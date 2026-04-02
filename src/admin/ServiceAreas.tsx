import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Search,
    Loader2,
    Building2,
    CheckCircle2,
    X,
    Activity,
    AlertCircle,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { apiRequest } from '../lib/api';

interface ServiceArea {
    id: string | number;
    zip_code: string;
    city: string;
    active: boolean | number;
    created_at: string;
}

const ServiceAreas = () => {
    const { searchQuery: globalSearch } = useOutletContext<{ searchQuery: string }>();
    const [areas, setAreas] = useState<ServiceArea[]>([]);
    const [loading, setLoading] = useState(true);
    const [localSearch, setLocalSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newArea, setNewArea] = useState({
        zip_code: '',
        city: ''
    });
    const [error, setError] = useState('');

    const fetchAreas = async () => {
        try {
            const { data, error } = await apiRequest<ServiceArea[]>('/api/service-areas');
            if (error) throw new Error(error);
            setAreas(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch service areas:', err);
            setAreas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAreas();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{5}$/.test(newArea.zip_code)) {
            setError('Please enter a valid 5-digit zip code');
            return;
        }
        if (newArea.city.trim().length < 2) {
            setError('Please enter a valid city name');
            return;
        }

        setError('');
        setAdding(true);
        try {
            const { error: apiError } = await apiRequest('/api/service-areas', {
                method: 'POST',
                body: newArea,
            });
            if (!apiError) {
                setNewArea({ zip_code: '', city: '' });
                setShowAddModal(false);
                await fetchAreas();
            } else {
                setError(apiError || 'Failed to add area');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setAdding(false);
        }
    };

    const handleToggle = async (area: ServiceArea) => {
        const newStatus = !area.active;
        try {
            await apiRequest(`/api/service-areas/${area.id}`, {
                method: 'PATCH',
                body: { active: newStatus },
            });
            fetchAreas();
        } catch (err) {
            console.error('Failed to toggle status:', err);
        }
    };

    const handleDelete = async (id: string | number) => {
        if (!confirm('Are you sure you want to remove this service area?')) return;
        try {
            await apiRequest(`/api/service-areas/${id}`, { method: 'DELETE' });
            fetchAreas();
        } catch (err) {
            console.error('Failed to delete area:', err);
        }
    };

    const combinedSearch = (globalSearch || localSearch).toLowerCase();
    const filtered = (Array.isArray(areas) ? areas : []).filter(a =>
        a.zip_code.includes(combinedSearch) ||
        a.city.toLowerCase().includes(combinedSearch)
    );

    const activeCount = areas.filter(a => a.active).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Service Area Manager</h1>
                    <p className="text-sm text-slate-500">Manage eligible zip codes and cities for your team.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                    <Plus className="w-4 h-4" />
                    New Location
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Serviced', value: areas.length, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Zones', value: activeCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Inactive Zones', value: areas.length - activeCount, icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-50' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
                    >
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500" />
                        Location Registry
                    </h3>
                    <div className="relative w-64 lg:block hidden">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find city or zip..."
                            value={localSearch}
                            onChange={e => setLocalSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No areas found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2">
                            {combinedSearch ? `Nothing matches "${combinedSearch}"` : "Register a new zip code to start servicing that area."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Settings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((area) => (
                                    <tr key={area.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${area.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{area.zip_code}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{area.city}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggle(area)}
                                                className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${area.active
                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${area.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                                {area.active ? 'Accepting' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggle(area)}
                                                    className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-emerald-500 transition-all"
                                                >
                                                    {area.active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(area.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Area Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Add Service Area</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Zip Code</label>
                                    <input
                                        required
                                        type="text"
                                        maxLength={5}
                                        value={newArea.zip_code}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                                            setNewArea({ ...newArea, zip_code: val });
                                            setError('');
                                        }}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                                        placeholder="e.g. 75201"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">City Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newArea.city}
                                        onChange={e => {
                                            setNewArea({ ...newArea, city: e.target.value });
                                            setError('');
                                        }}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                                        placeholder="e.g. Dallas"
                                    />
                                </div>

                                {error && (
                                    <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {error}
                                    </p>
                                )}

                                <div className="pt-4">
                                    <button
                                        disabled={adding}
                                        className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                    >
                                        {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Initialize Service Area
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ServiceAreas;
