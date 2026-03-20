import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Plus,
  MoreVertical,
  Clock,
  FileText,
  Download,
  Eye,
  ChevronRight,
  ShieldAlert,
  Zap,
  Calendar,
  X,
  Loader2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ComplianceDocument {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: string;
  expiry_date: string;
  file_url: string | null;
  notes: string;
  created_at: string;
}

interface ComplianceStats {
  active: number;
  expiringSoon: number;
  expired: number;
  complianceScore: number;
}

const Compliance = () => {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [stats, setStats] = useState<ComplianceStats>({ active: 0, expiringSoon: 0, expired: 0, complianceScore: 100 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ComplianceDocument | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Insurance',
    provider: '',
    expiry_date: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const openRenewalModal = (doc: ComplianceDocument) => {
    setEditingDoc(doc);
    setFormData({
      name: doc.name,
      type: doc.type,
      provider: doc.provider || '',
      expiry_date: doc.expiry_date ? new Date(doc.expiry_date).toISOString().split('T')[0] : '',
      notes: doc.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleExportAuditReport = () => {
    const headers = ['Document Name', 'Type', 'Provider', 'Status', 'Expiry Date', 'Days Until Expiry'];
    const rows = documents.map(doc => {
      const status = getStatusFromExpiry(doc.expiry_date);
      const daysLeft = getDaysUntilExpiry(doc.expiry_date);
      return [
        doc.name,
        doc.type,
        doc.provider || 'N/A',
        status,
        doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'N/A',
        doc.expiry_date ? daysLeft.toString() : 'N/A'
      ];
    });
    
    // Add summary section
    const summary = [
      [],
      ['--- COMPLIANCE SUMMARY ---'],
      ['Active Documents', stats.active.toString()],
      ['Expiring Soon', stats.expiringSoon.toString()],
      ['Expired', stats.expired.toString()],
      ['Compliance Score', `${stats.complianceScore}%`],
      ['Report Generated', new Date().toLocaleString()]
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ...summary.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance-audit-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const [docsRes, statsRes] = await Promise.all([
        fetch('/api/compliance/documents', { headers }),
        fetch('/api/compliance/stats', { headers })
      ]);
      const [docsData, statsData] = await Promise.all([
        docsRes.json(),
        statsRes.json()
      ]);
      setDocuments(Array.isArray(docsData) ? docsData : []);
      setStats(statsData?.complianceScore !== undefined ? statsData : { active: 0, expiringSoon: 0, expired: 0, complianceScore: 100 });
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('provider', formData.provider);
      formDataToSend.append('expiry_date', formData.expiry_date);
      formDataToSend.append('notes', formData.notes);
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      const url = editingDoc ? `/api/compliance/documents/${editingDoc.id}` : '/api/compliance/documents';
      const method = editingDoc ? 'PUT' : 'POST';
      const token = localStorage.getItem('adminToken');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(url, {
        method,
        headers,
        body: formDataToSend
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingDoc(null);
        setFormData({ name: '', type: 'Insurance', provider: '', expiry_date: '', notes: '' });
        setSelectedFile(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`/api/compliance/documents/${id}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getStatusFromExpiry = (expiryDate: string): string => {
    if (!expiryDate) return 'Active';
    const now = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (expiry < now) return 'Expired';
    if (expiry <= thirtyDays) return 'Expiring Soon';
    return 'Active';
  };

  const getDaysUntilExpiry = (expiryDate: string): number => {
    if (!expiryDate) return 999;
    const now = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const filteredDocs = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.provider && doc.provider.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const expiryAlerts = documents
    .filter(doc => doc.expiry_date && getDaysUntilExpiry(doc.expiry_date) <= 60)
    .sort((a, b) => getDaysUntilExpiry(a.expiry_date) - getDaysUntilExpiry(b.expiry_date));
  
  const displayedAlerts = showAllAlerts ? expiryAlerts : expiryAlerts.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance & Legal</h1>
          <p className="text-sm text-slate-500">Manage insurance, licenses, and regulatory documents.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportAuditReport}
            className="flex items-center gap-2 bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Audit Report
          </button>
          <button
            onClick={() => { setEditingDoc(null); setFormData({ name: '', type: 'Insurance', provider: '', expiry_date: '', notes: '' }); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Compliance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Documents', value: stats.active.toString(), icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Expiring Soon', value: stats.expiringSoon.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Expired', value: stats.expired.toString(), icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Compliance Score', value: `${stats.complianceScore}%`, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Document Vault Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              Insurance & License Vault
            </h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vault..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Document Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Expiry Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.length > 0 ? filteredDocs.map((doc) => {
                  const status = getStatusFromExpiry(doc.expiry_date);
                  const daysLeft = getDaysUntilExpiry(doc.expiry_date);
                  return (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                      {doc.provider && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{doc.provider}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 font-medium">{doc.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        status === 'Expiring Soon' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-slate-900">{doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'N/A'}</p>
                        {doc.expiry_date && (
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${status === 'Active' ? 'bg-emerald-500' :
                              status === 'Expiring Soon' ? 'bg-amber-500' :
                                'bg-red-500'
                              }`}
                            style={{ width: `${Math.max(0, Math.min(100, daysLeft / 3.65))}%` }}
                          />
                        </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {doc.file_url && (
                          <>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-emerald-500">
                              <Eye className="w-4 h-4" />
                            </a>
                            <a href={doc.file_url} download className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-blue-500">
                              <Download className="w-4 h-4" />
                            </a>
                          </>
                        )}
                        <button onClick={() => handleDelete(doc.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-slate-200" />
                        <p className="text-sm font-medium text-slate-400">No documents found in the vault.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            )}
          </div>
        </div>

        {/* Expiry Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Expiry Alerts
            </h3>
            <button 
              onClick={() => setShowAllAlerts(!showAllAlerts)}
              className="text-xs font-bold text-emerald-600 hover:underline">
              {showAllAlerts ? 'Show Less' : 'View All'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {displayedAlerts.length > 0 ? displayedAlerts.map((alert) => {
              const daysLeft = getDaysUntilExpiry(alert.expiry_date);
              const alertType = daysLeft < 0 ? 'critical' : daysLeft <= 30 ? 'warning' : 'info';
              return (
              <div key={alert.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-3 group hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${alertType === 'critical' ? 'bg-red-100 text-red-600' :
                      alertType === 'warning' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                      {alertType === 'critical' ? <ShieldAlert className="w-4 h-4" /> :
                        alertType === 'warning' ? <Clock className="w-4 h-4" /> :
                          <ShieldCheck className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{alert.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{alert.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${alertType === 'critical' ? 'bg-red-100 text-red-700' :
                    alertType === 'warning' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                    {daysLeft > 0 ? `${daysLeft} Days Left` : 'Expired'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-medium text-slate-600">{new Date(alert.expiry_date).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={() => openRenewalModal(alert)}
                    className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Renew Now <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              );
            }) : (
              <div className="py-12 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-100 rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-slate-200" />
                <p className="text-xs font-medium text-slate-400 italic">No active compliance alerts.</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={() => { setEditingDoc(null); setFormData({ name: '', type: 'Insurance', provider: '', expiry_date: '', notes: '' }); setIsModalOpen(true); }} 
              className="w-full py-3 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
              Add Compliance Document
            </button>
          </div>
        </div>
      </div>

      {/* Add Document Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{editingDoc ? 'Update Document / Set Renewal' : 'Add Compliance Document'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Document Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. General Liability Insurance"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Insurance">Insurance</option>
                      <option value="License">License</option>
                      <option value="Permit">Permit</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Contract">Contract</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Provider</label>
                    <input
                      type="text"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. State Farm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Upload Document</label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none"
                    placeholder="Additional notes..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Add Document'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Compliance;
