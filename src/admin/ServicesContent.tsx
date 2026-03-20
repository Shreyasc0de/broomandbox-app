import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Search,
  ImageIcon,
  Save,
  Loader2,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServiceContent {
  id: string;
  title: string;
  image_url: string | null;
  storage_path: string | null;
  description: string;
  checklist: string[];
  created_at: string;
  updated_at: string;
}

const ServicesContent = () => {
  const [services, setServices] = useState<ServiceContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingService, setEditingService] = useState<ServiceContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/service-content', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (service: ServiceContent) => {
    setSaving(service.id);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/service-content/${service.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: service.title,
          description: service.description,
          checklist: service.checklist
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      showToast('success', 'Service updated successfully');
    } catch (error) {
      showToast('error', 'Failed to save changes');
    } finally {
      setSaving(null);
    }
  };

  const handleImageUpload = async (serviceId: string, file: File) => {
    setUploadingImage(serviceId);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`/api/service-content/${serviceId}/image`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      setServices(prev => prev.map(s => 
        s.id === serviceId ? { ...s, image_url: data.image_url } : s
      ));
      showToast('success', 'Image uploaded successfully');
    } catch (error) {
      showToast('error', 'Failed to upload image');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleAddChecklistItem = (serviceId: string) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId 
        ? { ...s, checklist: [...s.checklist, 'New checklist item'] }
        : s
    ));
  };

  const handleRemoveChecklistItem = (serviceId: string, index: number) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId 
        ? { ...s, checklist: s.checklist.filter((_, i) => i !== index) }
        : s
    ));
  };

  const handleChecklistChange = (serviceId: string, index: number, value: string) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId 
        ? { ...s, checklist: s.checklist.map((item, i) => i === index ? value : item) }
        : s
    ));
  };

  const handleFieldChange = (serviceId: string, field: 'title' | 'description', value: string) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId ? { ...s, [field]: value } : s
    ));
  };

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-primary" />
            Service Page Content
          </h1>
          <p className="text-ink-muted mt-1">Manage images, descriptions, and checklists for each service page</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 text-ink-muted">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No services found. Run the migration script to add default services.</p>
          <code className="block mt-2 text-sm bg-gray-100 p-2 rounded">npx tsx scripts/migrate-services.ts</code>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredServices.map((service) => (
            <motion.div
              key={service.id}
              layout
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image Section */}
                  <div className="lg:w-1/3">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 group">
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Upload Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {uploadingImage === service.id ? (
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                          <button
                            onClick={() => fileInputRefs.current[service.id]?.click()}
                            className="bg-white text-ink px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100"
                          >
                            <Upload className="w-4 h-4" />
                            Change Image
                          </button>
                        )}
                      </div>
                      
                      <input
                        ref={el => { fileInputRefs.current[service.id] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(service.id, file);
                        }}
                      />
                    </div>
                    <p className="text-xs text-ink-muted mt-2 text-center">
                      Click image to change • Recommended: 800x600px
                    </p>
                  </div>

                  {/* Content Section */}
                  <div className="lg:w-2/3 space-y-4">
                    {/* Title */}
                    <div>
                      <label className="text-sm font-medium text-ink-muted mb-1 block">Service Title</label>
                      <input
                        type="text"
                        value={service.title}
                        onChange={(e) => handleFieldChange(service.id, 'title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm font-medium text-ink-muted mb-1 block">Description</label>
                      <textarea
                        value={service.description}
                        onChange={(e) => handleFieldChange(service.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>

                    {/* Checklist */}
                    <div>
                      <label className="text-sm font-medium text-ink-muted mb-2 block">
                        Checklist Items ({service.checklist.length})
                      </label>
                      <div className="space-y-2">
                        {service.checklist.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => handleChecklistChange(service.id, index, e.target.value)}
                              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                              onClick={() => handleRemoveChecklistItem(service.id, index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAddChecklistItem(service.id)}
                          className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium mt-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Checklist Item
                        </button>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleSave(service)}
                        disabled={saving === service.id}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving === service.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-3 flex justify-between items-center text-xs text-ink-muted">
                <span>ID: {service.id}</span>
                <span>URL: /services/{service.id}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesContent;
