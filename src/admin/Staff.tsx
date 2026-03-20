import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    MoreVertical,
    Mail,
    Phone,
    Star,
    MapPin,
    Calendar,
    CheckCircle2,
    Clock,
    Shield,
    Trash2,
    X,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOutletContext } from 'react-router-dom';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    status: string;
    rating: number;
    jobs_done: number;
    joined_at: string;
}

const Staff = () => {
    const { searchQuery } = useOutletContext<{ searchQuery: string }>();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newMember, setNewMember] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'Cleaner'
    });

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/staff');
            const data = await res.json();
            setStaff(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
            setStaff([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMember)
            });
            if (res.ok) {
                setShowAddModal(false);
                setNewMember({ name: '', email: '', phone: '', role: 'Cleaner' });
                fetchStaff();
            }
        } catch (error) {
            console.error('Failed to add staff member:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;
        try {
            const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchStaff();
            }
        } catch (error) {
            console.error('Failed to delete staff member:', error);
        }
    };

    const filteredStaff = (Array.isArray(staff) ? staff : []).filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
                    <p className="text-sm text-slate-500">Manage your cleaning teams and staff performance.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                    <UserPlus className="w-4 h-4" />
                    Add Team Member
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            ) : filteredStaff.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">No team members found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        {searchQuery ? `No staff match "${searchQuery}"` : "Get started by adding your first team member to the system."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredStaff.map((member) => (
                        <motion.div
                            key={member.id}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-lg">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <h3 className="font-bold text-slate-900">{member.name}</h3>
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4">{member.role}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Mail className="w-3.5 h-3.5" />
                                        {member.email}
                                    </div>
                                    {member.phone && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Phone className="w-3.5 h-3.5" />
                                            {member.phone}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jobs</p>
                                        <p className="text-sm font-bold text-slate-900">{member.jobs_done}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating</p>
                                        <p className="text-sm font-bold text-amber-500 flex items-center gap-1">
                                            {member.rating} <Star className="w-3 h-3 fill-amber-500" />
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${member.status === 'On Shift' ? 'bg-emerald-500 animate-pulse' :
                                    member.status === 'Available' ? 'bg-blue-500' : 'bg-slate-300'
                                    }`} />
                                <span className="text-xs font-bold text-slate-600">{member.status}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Member Modal */}
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
                                <h2 className="text-xl font-bold text-slate-900">Add Team Member</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleAddMember} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newMember.name}
                                        onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={newMember.email}
                                        onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                                        placeholder="sarah@broomandbox.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={newMember.phone}
                                        onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                                        placeholder="(214) 555-0123"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Role</label>
                                    <select
                                        value={newMember.role}
                                        onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 outline-none"
                                    >
                                        <option>Cleaner</option>
                                        <option>Team Lead</option>
                                        <option>Operations Manager</option>
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <button
                                        disabled={isSubmitting}
                                        className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                        Add Team Member
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

export default Staff;
