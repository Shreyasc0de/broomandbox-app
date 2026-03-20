import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Search,
  Filter,
  Plus,
  MoreVertical,
  ShieldCheck,
  Bell,
  DollarSign,
  MapPin,
  Users,
  Mail,
  Smartphone,
  Globe,
  Lock,
  ChevronRight,
  Save,
  Trash2,
  Edit2,
  CheckCircle2,
  Info,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PricingRule {
  id: string;
  name: string;
  base_price: number;
  per_sqft: number;
  status: string;
}

interface SystemSettings {
  geofence_radius: number;
}

interface NotificationSetting {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
}

interface ServiceType {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

interface GeneralSettings {
  business_name: string;
  business_email: string;
  business_phone: string;
  timezone: string;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Pricing');
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({ geofence_radius: 200 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    { id: '1', name: 'Booking Confirmation', type: 'Email', enabled: true },
    { id: '2', name: 'Job Reminder', type: 'SMS', enabled: true },
    { id: '3', name: 'Staff Check-in Alert', type: 'Push', enabled: true },
    { id: '4', name: 'Invoice Paid', type: 'Email', enabled: false },
  ]);
  
  // Service types
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([
    { id: '1', name: 'Standard Cleaning', description: 'Regular home cleaning service', active: true },
    { id: '2', name: 'Deep Cleaning', description: 'Thorough deep cleaning', active: true },
    { id: '3', name: 'Office Cleaning', description: 'Commercial office cleaning', active: true },
    { id: '4', name: 'Move In/Out Cleaning', description: 'Cleaning for moves', active: true },
  ]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: '', description: '' });
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    business_name: 'Broom & Box',
    business_email: 'info@broomandbox.com',
    business_phone: '(678) 792-4686',
    timezone: 'America/New_York'
  });
  
  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Roles
  const [roles, setRoles] = useState([
    { id: '1', name: 'Super Admin', users: 2, permissions: ['Full Access'], color: 'emerald' },
    { id: '2', name: 'Operations Manager', users: 3, permissions: ['Scheduling', 'Jobs', 'Staff'], color: 'blue' },
    { id: '3', name: 'Customer Support', users: 5, permissions: ['Customers', 'Bookings'], color: 'purple' },
    { id: '4', name: 'Field Staff', users: 18, permissions: ['Job View', 'Check-in'], color: 'slate' },
  ]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<typeof roles[0] | null>(null);
  const [roleForm, setRoleForm] = useState({ name: '', permissions: [] as string[] });

  const [formData, setFormData] = useState({
    name: '',
    base_price: '',
    per_sqft: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [pricingRes, systemRes] = await Promise.all([
        fetch('/api/settings/pricing'),
        fetch('/api/settings/system')
      ]);
      const [pricingData, systemData] = await Promise.all([
        pricingRes.json(),
        systemRes.json()
      ]);
      setPricingRules(pricingData);
      setSystemSettings(systemData);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/settings/system', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemSettings)
      });
      if (res.ok) {
        // Show success (could add toast here)
      }
    } catch (error) {
      console.error('Error saving system settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const url = editingRule ? `/api/settings/pricing/${editingRule.id}` : '/api/settings/pricing';
      const method = editingRule ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          base_price: parseFloat(formData.base_price),
          per_sqft: parseFloat(formData.per_sqft)
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingRule(null);
        setFormData({ name: '', base_price: '', per_sqft: '' });
        fetchSettings();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Failed to save rule'}`);
      }
    } catch (error) {
      console.error('Error saving pricing rule:', error);
      alert('Network error. Please check if the server is running.');
    } finally {
      setSaving(false);
    }
  };

  const deletePricingRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return;
    try {
      const res = await fetch(`/api/settings/pricing/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSettings();
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const openNewRuleModal = () => {
    setEditingRule(null);
    setFormData({ name: '', base_price: '', per_sqft: '' });
    setIsModalOpen(true);
  };

  const openEditRuleModal = (rule: PricingRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      base_price: rule.base_price.toString(),
      per_sqft: rule.per_sqft.toString()
    });
    setIsModalOpen(true);
  };

  // Notification toggle handler
  const toggleNotification = (id: string) => {
    setNotificationSettings(prev => 
      prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n)
    );
  };

  // Service handlers
  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      setServiceTypes(prev => prev.map(s => 
        s.id === editingService.id 
          ? { ...s, name: serviceForm.name, description: serviceForm.description }
          : s
      ));
    } else {
      setServiceTypes(prev => [...prev, {
        id: Date.now().toString(),
        name: serviceForm.name,
        description: serviceForm.description,
        active: true
      }]);
    }
    setIsServiceModalOpen(false);
    setEditingService(null);
    setServiceForm({ name: '', description: '' });
  };

  const openServiceModal = (service?: ServiceType) => {
    if (service) {
      setEditingService(service);
      setServiceForm({ name: service.name, description: service.description });
    } else {
      setEditingService(null);
      setServiceForm({ name: '', description: '' });
    }
    setIsServiceModalOpen(true);
  };

  const toggleService = (id: string) => {
    setServiceTypes(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const deleteService = (id: string) => {
    if (confirm('Delete this service type?')) {
      setServiceTypes(prev => prev.filter(s => s.id !== id));
    }
  };

  // Role handlers
  const allPermissions = ['Scheduling', 'Jobs', 'Staff', 'Customers', 'Bookings', 'Analytics', 'Settings', 'Compliance', 'Full Access'];

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      setRoles(prev => prev.map(r => 
        r.id === editingRole.id 
          ? { ...r, name: roleForm.name, permissions: roleForm.permissions }
          : r
      ));
    } else {
      setRoles(prev => [...prev, {
        id: Date.now().toString(),
        name: roleForm.name,
        users: 0,
        permissions: roleForm.permissions,
        color: 'slate'
      }]);
    }
    setIsRoleModalOpen(false);
    setEditingRole(null);
    setRoleForm({ name: '', permissions: [] });
  };

  const openRoleModal = (role?: typeof roles[0]) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({ name: role.name, permissions: [...role.permissions] });
    } else {
      setEditingRole(null);
      setRoleForm({ name: '', permissions: [] });
    }
    setIsRoleModalOpen(true);
  };

  const togglePermission = (perm: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  // Change password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      setChangingPassword(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordSuccess(true);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('Network error. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const deleteRole = (id: string) => {
    if (confirm('Delete this role?')) {
      setRoles(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <p className="text-sm text-slate-500">Configure your business rules and platform settings.</p>
        </div>
        <button
          onClick={handleSaveSystemSettings}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 md:px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-1">
          {[
            { name: 'Pricing', icon: DollarSign },
            { name: 'Services', icon: SettingsIcon },
            { name: 'Notifications', icon: Bell },
            { name: 'Roles', icon: ShieldCheck },
            { name: 'General', icon: Globe },
            { name: 'Security', icon: Lock },
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.name
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'Pricing' && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                      Pricing Rules Editor
                    </h3>
                    <button
                      onClick={openNewRuleModal}
                      className="flex items-center gap-2 text-emerald-600 font-bold text-xs hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      Add New Rule
                    </button>
                  </div>
                  <div className="space-y-4">
                    {pricingRules.length > 0 ? pricingRules.map((rule) => (
                      <div key={rule.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{rule.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Base: ${rule.base_price} • Rate: ${rule.per_sqft}/sqft</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditRuleModal(rule)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-emerald-500"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePricingRule(rule.id)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )) : !loading && (
                      <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                        <p className="text-sm text-slate-400 italic font-medium">No pricing rules defined.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-6">Geofence Radius Config</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Check-in Radius (meters)</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="50"
                          max="500"
                          step="50"
                          value={systemSettings.geofence_radius}
                          onChange={(e) => setSystemSettings({ ...systemSettings, geofence_radius: parseInt(e.target.value) })}
                          className="flex-1 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
                        />
                        <span className="text-sm font-bold text-slate-900 w-12 text-right">{systemSettings.geofence_radius}m</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        The distance from the job location within which staff can check-in.
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                      <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <p className="text-xs text-amber-700 font-medium leading-relaxed">
                        Increasing the radius may reduce check-in errors but could decrease tracking accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Roles' && (
              <motion.div
                key="roles"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    User & Role Management
                  </h3>
                  <button 
                    onClick={() => openRoleModal()}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all">
                    <Plus className="w-3 h-3" />
                    Create Role
                  </button>
                </div>
                <div className="space-y-6">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 bg-${role.color}-100 rounded-lg flex items-center justify-center`}>
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{role.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{role.users} Users • {role.permissions.join(', ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openRoleModal(role)}
                          className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                          Edit Permissions <ChevronRight className="w-3 h-3" />
                        </button>
                        {role.name !== 'Super Admin' && (
                          <button 
                            onClick={() => deleteRole(role.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'Notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-emerald-500" />
                    Notification Templates
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {notificationSettings.map((template) => (
                      <div key={template.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between group hover:border-emerald-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${template.type === 'Email' ? 'bg-blue-50 text-blue-600' : template.type === 'SMS' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
                            {template.type === 'Email' ? <Mail className="w-4 h-4" /> : template.type === 'SMS' ? <Smartphone className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{template.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{template.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleNotification(template.id)}
                            className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${template.enabled ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${template.enabled ? 'right-1' : 'left-1'}`} />
                          </button>
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-emerald-500" />
                    Service Types
                  </h3>
                  <button 
                    onClick={() => openServiceModal()}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all">
                    <Plus className="w-3 h-3" />
                    Add Service
                  </button>
                </div>
                <div className="space-y-4">
                  {serviceTypes.map((service) => (
                    <div key={service.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${service.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          <SettingsIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{service.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-1">{service.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleService(service.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold ${service.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {service.active ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => openServiceModal(service)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-emerald-500"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteService(service.id)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'General' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-500" />
                    Business Information
                  </h3>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Business Name</label>
                        <input
                          type="text"
                          value={generalSettings.business_name}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, business_name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Business Phone</label>
                        <input
                          type="tel"
                          value={generalSettings.business_phone}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, business_phone: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Business Email</label>
                        <input
                          type="email"
                          value={generalSettings.business_email}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, business_email: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Timezone</label>
                        <select
                          value={generalSettings.timezone}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                        >
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-500" />
                    Change Password
                  </h3>
                  
                  {passwordSuccess && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Password changed successfully!</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                      <X className="w-5 h-5 text-red-600" />
                      <span className="text-red-700 font-medium">{passwordError}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        minLength={8}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                      />
                      <p className="text-xs text-slate-400">Must be at least 8 characters</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      {changingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    Security Note
                  </h3>
                  <p className="text-sm text-slate-600">
                    Password changes require database authentication to be set up. If you haven't run the admin migration yet,
                    run <code className="bg-slate-100 px-2 py-1 rounded text-xs">npx tsx scripts/migrate-admin-users.ts</code> first.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Pricing Rule Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900">
                  {editingRule ? 'Edit Pricing Rule' : 'New Pricing Rule'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <form onSubmit={handlePricingSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Service Type</label>
                  <select
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                  >
                    <option value="">Select a service...</option>
                    <option value="Standard Cleaning">Standard Cleaning</option>
                    <option value="Deep Cleaning">Deep Cleaning</option>
                    <option value="Office Cleaning">Office Cleaning</option>
                    <option value="Move In/Out Cleaning">Move In/Out Cleaning</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Base Price ($)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                      placeholder="150"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Rate ($ / sqft)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.per_sqft}
                      onChange={(e) => setFormData({ ...formData, per_sqft: e.target.value })}
                      placeholder="0.06"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={saving}
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingRule ? 'Update Rule' : 'Create Rule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Service Modal */}
      <AnimatePresence>
        {isServiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900">
                  {editingService ? 'Edit Service' : 'New Service Type'}
                </h3>
                <button
                  onClick={() => setIsServiceModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleServiceSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Service Name</label>
                  <input
                    required
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    placeholder="e.g. Post-Construction Cleaning"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    placeholder="Brief description of the service"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium h-20 resize-none"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    {editingService ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Role Modal */}
      <AnimatePresence>
        {isRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900">
                  {editingRole ? 'Edit Role Permissions' : 'Create New Role'}
                </h3>
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleRoleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Role Name</label>
                  <input
                    required
                    type="text"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    placeholder="e.g. Supervisor"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {allPermissions.map(perm => (
                      <button
                        key={perm}
                        type="button"
                        onClick={() => togglePermission(perm)}
                        className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                          roleForm.permissions.includes(perm)
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {perm}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    {editingRole ? 'Update Role' : 'Create Role'}
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

export default Settings;
