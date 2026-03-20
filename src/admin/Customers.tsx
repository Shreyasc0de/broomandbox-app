import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  History,
  CreditCard,
  UserPlus,
  ArrowUpRight,
  ChevronRight,
  Star,
  Building2,
  Home,
  Users,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { showToast } from '../lib/toast';
import { validateEmail, validatePhone, validateRequired, type FormErrors } from '../lib/validation';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  type: string;
  properties: number;
  total_spent: number;
  status: string;
  rating: number;
  created_at: string;
}

interface CustomerJob {
  id: string;
  service: string;
  date: string;
  status: string;
  price: number;
}

const Customers = () => {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerJobs, setCustomerJobs] = useState<CustomerJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Residential'
  });

  const fetchCustomers = async () => {
    const result = await apiRequest<Customer[]>('/api/customers');
    if (result.error) {
      showToast.error('Failed to load customers');
      setCustomers([]);
    } else {
      setCustomers(Array.isArray(result.data) ? result.data : []);
    }
    setLoading(false);
  };

  const viewCustomerProfile = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowProfileModal(true);
    setLoadingJobs(true);
    
    // Fetch jobs for this customer
    const result = await apiRequest<CustomerJob[]>(`/api/customers/${customer.id}/jobs`);
    if (!result.error && result.data) {
      setCustomerJobs(Array.isArray(result.data) ? result.data : []);
    } else {
      setCustomerJobs([]);
    }
    setLoadingJobs(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    const nameResult = validateRequired(newCustomer.name, 'Name');
    if (!nameResult.valid) errors.name = nameResult.error!;
    
    const emailResult = validateEmail(newCustomer.email);
    if (!emailResult.valid) errors.email = emailResult.error!;
    
    if (newCustomer.phone) {
      const phoneResult = validatePhone(newCustomer.phone);
      if (!phoneResult.valid) errors.phone = phoneResult.error!;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast.error('Please fix the form errors');
      return;
    }
    
    setIsSubmitting(true);
    const result = await apiRequest('/api/customers', {
      method: 'POST',
      body: newCustomer,
    });

    if (result.error) {
      showToast.error(result.error);
    } else {
      showToast.success('Customer added successfully!');
      setShowAddModal(false);
      setNewCustomer({ name: '', email: '', phone: '', type: 'Residential' });
      setFormErrors({});
      fetchCustomers();
    }
    setIsSubmitting(false);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to remove this customer?')) return;
    
    const result = await apiRequest(`/api/customers/${id}`, { method: 'DELETE' });
    
    if (result.error) {
      showToast.error('Failed to delete customer');
    } else {
      showToast.success('Customer removed');
      fetchCustomers();
    }
  };

  const filteredCustomers = (Array.isArray(customers) ? customers : []).filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
          <p className="text-sm text-slate-500">Manage your customer database and CRM.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            <UserPlus className="w-4 h-4" />
            Add New Customer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No customers found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            {searchQuery ? `No customers match "${searchQuery}"` : "Get started by adding your first customer to the system."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group"
            >
              <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{customer.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">ID: {customer.id.slice(0, 8)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCustomer(customer.id)}
                  className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 flex-1">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {customer.email}
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {customer.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    {customer.type === 'Residential' ? <Home className="w-4 h-4 text-slate-400" /> : <Building2 className="w-4 h-4 text-slate-400" />}
                    {customer.type} • {customer.properties} Property
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Spent</p>
                    <p className="text-sm font-bold text-slate-900">${(customer.total_spent || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Rating</p>
                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                      {customer.rating} <Star className="w-3 h-3 fill-emerald-600" />
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${customer.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className="text-xs font-bold text-slate-600">{customer.status}</span>
                </div>
                <button 
                  onClick={() => viewCustomerProfile(customer)}
                  className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Profile <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
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
                <h2 className="text-xl font-bold text-slate-900">Add New Customer</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input
                    required
                    type="text"
                    value={newCustomer.name}
                    onChange={e => {
                      setNewCustomer({ ...newCustomer, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 ${formErrors.name ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="Enter customer name"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input
                    required
                    type="email"
                    value={newCustomer.email}
                    onChange={e => {
                      setNewCustomer({ ...newCustomer, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 ${formErrors.email ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="customer@example.com"
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={e => {
                      setNewCustomer({ ...newCustomer, phone: e.target.value });
                      if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 ${formErrors.phone ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="(214) 555-0000"
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Customer Type</label>
                  <select
                    value={newCustomer.type}
                    onChange={e => setNewCustomer({ ...newCustomer, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 outline-none"
                  >
                    <option>Residential</option>
                    <option>Commercial</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    disabled={isSubmitting}
                    className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Add Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Profile Modal */}
      <AnimatePresence>
        {showProfileModal && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h2>
                    <p className="text-xs text-slate-500">Customer since {new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-slate-200 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Email</p>
                    <p className="text-sm font-medium text-slate-900">{selectedCustomer.email}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Phone</p>
                    <p className="text-sm font-medium text-slate-900">{selectedCustomer.phone || 'Not provided'}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-700">${(selectedCustomer.total_spent || 0).toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Total Spent</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-700">{selectedCustomer.properties}</p>
                    <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">Properties</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl">
                    <p className="text-2xl font-bold text-amber-700">{selectedCustomer.rating}</p>
                    <p className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">Rating</p>
                  </div>
                </div>

                {/* Job History */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-500" />
                    Service History
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {loadingJobs ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                      </div>
                    ) : customerJobs.length > 0 ? (
                      customerJobs.map((job) => (
                        <div key={job.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{job.service}</p>
                            <p className="text-xs text-slate-500">{new Date(job.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-600">${job.price}</p>
                            <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                              job.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                              job.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>{job.status}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No service history yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
