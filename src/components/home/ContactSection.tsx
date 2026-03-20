import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import { businessConfig } from '../../lib/config';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        type: 'Residential',
        size: '',
        message: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
            newErrors.phone = 'Valid phone number is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Valid email is required';
        }
        if (!formData.size.trim()) newErrors.size = 'Property size is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (validate()) {
            setIsSubmitting(true);
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    throw new Error('Failed to submit form');
                }

                setIsSubmitted(true);
                // Reset form after 5 seconds
                setTimeout(() => {
                    setIsSubmitted(false);
                    setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        type: 'Residential',
                        size: '',
                        message: ''
                    });
                }, 5000);
            } catch (err) {
                setServerError('There was an error submitting your request. Please try again or call us directly.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <section id="contact" className="py-24 bg-surface">
            <div className="max-w-7xl mx-auto px-6">
                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden grid lg:grid-cols-2">
                    <div className="p-12 lg:p-20">
                        <AnimatePresence mode="wait">
                            {isSubmitted ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center py-12"
                                >
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4 text-ink">Quote Request Sent!</h3>
                                    <p className="text-ink-muted">Thank you, {formData.name}. We'll review your details and get back to you within 24 hours.</p>
                                </motion.div>
                            ) : (
                                <motion.div key="form">
                                    <h2 className="text-4xl lg:text-5xl mb-8">Request Free Quote</h2>
                                    <form className="space-y-6" onSubmit={handleSubmit}>
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-ink-muted mb-2">Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, name: e.target.value });
                                                        if (errors.name) setErrors({ ...errors, name: '' });
                                                    }}
                                                    className={`w-full px-5 py-4 rounded-2xl bg-surface border focus:ring-4 outline-none transition-all ${errors.name ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 focus:border-primary focus:ring-primary/10'
                                                        }`}
                                                />
                                                {errors.name && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">{errors.name}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-ink-muted mb-2">Phone</label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, phone: e.target.value });
                                                        if (errors.phone) setErrors({ ...errors, phone: '' });
                                                    }}
                                                    className={`w-full px-5 py-4 rounded-2xl bg-surface border focus:ring-4 outline-none transition-all ${errors.phone ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 focus:border-primary focus:ring-primary/10'
                                                        }`}
                                                />
                                                {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">{errors.phone}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-ink-muted mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, email: e.target.value });
                                                    if (errors.email) setErrors({ ...errors, email: '' });
                                                }}
                                                className={`w-full px-5 py-4 rounded-2xl bg-surface border focus:ring-4 outline-none transition-all ${errors.email ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 focus:border-primary focus:ring-primary/10'
                                                    }`}
                                            />
                                            {errors.email && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">{errors.email}</p>}
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-ink-muted mb-2">Cleaning Type</label>
                                                <select
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    className="w-full px-5 py-4 rounded-2xl bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer"
                                                >
                                                    <option>Residential</option>
                                                    <option>Commercial</option>
                                                    <option>Deep Cleaning</option>
                                                    <option>Post-Construction</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-ink-muted mb-2">Property Size (sqft)</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 2,500"
                                                    value={formData.size}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, size: e.target.value });
                                                        if (errors.size) setErrors({ ...errors, size: '' });
                                                    }}
                                                    className={`w-full px-5 py-4 rounded-2xl bg-surface border focus:ring-4 outline-none transition-all ${errors.size ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 focus:border-primary focus:ring-primary/10'
                                                        }`}
                                                />
                                                {errors.size && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">{errors.size}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-ink-muted mb-2">Message</label>
                                            <textarea
                                                rows={4}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full px-5 py-4 rounded-2xl bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                                            ></textarea>
                                        </div>
                                        {serverError && <p className="text-sm text-red-500 font-bold bg-red-50 p-3 rounded-xl">{serverError}</p>}
                                        <button disabled={isSubmitting} className="btn-primary w-full py-5 text-xl relative">
                                            {isSubmitting ? 'Sending Request...' : 'Request Free Quote'}
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-primary p-12 lg:p-20 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full blur-[100px]" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold mb-10">Contact Information</h3>
                            <div className="space-y-8">
                                <a href={businessConfig.phoneTel} className="flex items-start gap-6 group/item p-3 -m-3 rounded-2xl hover:bg-white/10 transition-all duration-300">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-white/20 transition-colors">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm uppercase font-bold tracking-widest mb-1">Call Us</p>
                                        <p className="text-xl font-bold">{businessConfig.phoneDash}</p>
                                    </div>
                                </a>
                                <a href={businessConfig.emailHref} className="flex items-start gap-6 group/item p-3 -m-3 rounded-2xl hover:bg-white/10 transition-all duration-300">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-white/20 transition-colors">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm uppercase font-bold tracking-widest mb-1">Email Us</p>
                                        <p className="text-xl font-bold">{businessConfig.email}</p>
                                    </div>
                                </a>
                                <a
                                    href={businessConfig.addressUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-6 group/item p-3 -m-3 rounded-2xl hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-white/20 transition-colors">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm uppercase font-bold tracking-widest mb-1">Visit Us</p>
                                        <p className="text-xl font-bold">{businessConfig.address}</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div className="mt-20 pt-10 border-t border-white/20 relative z-10">
                            <p className="text-white/60 text-sm uppercase font-bold tracking-widest mb-4">Project Manager</p>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden shadow-xl flex items-center justify-center text-primary font-bold text-xl">
                                    AH
                                </div>
                                <div>
                                    <p className="text-2xl font-bold uppercase tracking-tight">A. Hamal</p>
                                    <p className="text-primary-light font-medium">Project Manager</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
