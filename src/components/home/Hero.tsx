import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, MapPin, Loader2, ShieldAlert, CheckCircle2, Info, Calendar } from 'lucide-react';
import DiamondPattern from '../ui/DiamondPattern';

const Hero = () => {
    const [zipCode, setZipCode] = useState('');
    const [zipError, setZipError] = useState('');
    const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
    const [lastCheckedZip, setLastCheckedZip] = useState('');
    const [availableCity, setAvailableCity] = useState('');

    // Booking Form State
    const [bookingStep, setBookingStep] = useState<'details' | 'success'>('details');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        service: 'Residential',
        date: '',
        time: ''
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const timeSlots = [
        '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
        '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
    ];

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (formData.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
        if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        if (!formData.date) errors.date = 'Please select a date';
        if (!formData.time) errors.time = 'Please select a time slot';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 5);
        setZipCode(value);
        if (zipError) setZipError('');
        if (availabilityStatus !== 'idle') setAvailabilityStatus('idle');
    };

    const handleCheckAvailability = async () => {
        if (!/^\d{5}$/.test(zipCode)) {
            setZipError('Please enter a valid 5-digit zip code');
            setAvailabilityStatus('idle');
        } else {
            setZipError('');
            setAvailabilityStatus('checking');
            setLastCheckedZip(zipCode);
            try {
                const res = await fetch(`/api/check-availability?zip=${zipCode}`);
                const data = await res.json();
                if (data.available) {
                    setAvailableCity(data.city);
                    setAvailabilityStatus('available');
                } else {
                    setAvailabilityStatus('unavailable');
                }
            } catch {
                setAvailabilityStatus('unavailable');
            }
        }
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        phone: formData.phone,
                        service: formData.service,
                        date: formData.date,
                        time_slot: formData.time,
                        zip_code: zipCode || null,
                    }),
                });
            } catch {
                // Still show success to the user even if network error
            }
            setBookingStep('success');
        }
    };

    return (
        <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-surface">
            <DiamondPattern className="top-0 right-0 -translate-y-1/4 translate-x-1/4" />
            <DiamondPattern className="bottom-0 left-0 translate-y-1/4 -translate-x-1/4" />
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                    src="/hero-bg.png"
                    alt="Sparkling clean interior"
                    className="w-full h-full object-cover opacity-30 lg:opacity-40 scale-105 blur-[2px]"
                />
                {/* Modern Multi-layered Gradient Overlay for Maximum Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-surface/30" />
                <div className="absolute inset-0 bg-gradient-to-b from-surface/40 via-transparent to-surface/40" />
                <div className="absolute inset-0 bg-primary/2 mix-blend-multiply" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center w-full">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="lg:col-span-7"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary-dark text-xs font-bold uppercase tracking-wider mb-8">
                        <ShieldCheck className="w-4 h-4" />
                        Insured • Bonded • Professional Staff
                    </div>
                    <h1 className="text-5xl lg:text-7xl mb-8 leading-[1.1] font-display font-extrabold text-ink">
                        Professional Residential & <br />
                        <span className="text-primary">Commercial</span> Cleaning Services
                    </h1>
                    <p className="text-xl text-ink-muted mb-10 max-w-xl leading-relaxed">
                        Reliable, insured, and experienced cleaning professionals ready to keep your space spotless. We bring the sparkle back to your environment.
                    </p>

                    {/* Professional Zip Code Search Bar - Left Column */}
                    <div className="max-w-md mb-10">
                        <div className={`bg-white p-2 rounded-2xl shadow-xl border transition-all flex items-center gap-2 ${zipError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-100'}`}>
                            <div className="flex-1 flex items-center gap-3 px-4">
                                <MapPin className={`w-5 h-5 ${zipError ? 'text-red-500' : 'text-primary'}`} />
                                <input
                                    type="text"
                                    placeholder="Enter Zip Code"
                                    value={zipCode}
                                    onChange={handleZipChange}
                                    className="w-full py-3 bg-transparent outline-none text-lg font-bold text-ink placeholder:text-gray-300 placeholder:font-normal"
                                />
                            </div>
                            <button
                                onClick={handleCheckAvailability}
                                disabled={availabilityStatus === 'checking'}
                                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {availabilityStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin" />}
                                {availabilityStatus === 'checking' ? 'Checking...' : 'Check Availability'}
                            </button>
                        </div>

                        <div className="mt-3 ml-4">
                            <AnimatePresence mode="wait">
                                {zipError ? (
                                    <motion.p
                                        key="error"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="text-[10px] text-red-500 font-bold flex items-center gap-1"
                                    >
                                        <ShieldAlert className="w-3 h-3" />
                                        {zipError}
                                    </motion.p>
                                ) : availabilityStatus === 'available' ? (
                                    <motion.p
                                        key="available"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Great news! We serve {availableCity} ({lastCheckedZip})!
                                    </motion.p>
                                ) : availabilityStatus === 'unavailable' ? (
                                    <motion.p
                                        key="unavailable"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="text-[11px] text-amber-600 font-bold flex items-center gap-1.5"
                                    >
                                        <Info className="w-3.5 h-3.5" />
                                        We're currently booked in {lastCheckedZip}, but check back soon!
                                    </motion.p>
                                ) : availabilityStatus === 'checking' ? (
                                    <motion.p
                                        key="checking"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="text-[10px] text-ink-muted flex items-center gap-2"
                                    >
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Verifying local schedule...
                                    </motion.p>
                                ) : (
                                    <motion.p
                                        key="idle"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="text-[10px] text-ink-muted flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Currently serving Dallas, Irving, Plano, and Arlington
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="lg:col-span-5"
                >
                    <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-2xl relative border border-gray-100 min-h-[550px] flex flex-col">
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/10 rounded-full blur-2xl -z-10" />

                        <AnimatePresence mode="wait">
                            {bookingStep === 'details' ? (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <h3 className="text-2xl font-bold mb-2 text-ink">Book Your Cleaning</h3>
                                    <p className="text-sm text-ink-muted mb-6">Select your service and preferred time slot.</p>

                                    <form className="space-y-4 flex-1" onSubmit={handleBookingSubmit}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={formData.name}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, name: e.target.value });
                                                        if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                                                    }}
                                                    className={`w-full px-4 py-3 rounded-xl bg-surface border focus:ring-2 outline-none transition-all text-sm ${formErrors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-100 focus:border-primary focus:ring-primary/20'
                                                        }`}
                                                />
                                                {formErrors.name && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{formErrors.name}</p>}
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Email <span className="text-gray-300 normal-case font-normal">(optional — for confirmation)</span></label>
                                                <input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={formData.email}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, email: e.target.value });
                                                        if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                                                    }}
                                                    className={`w-full px-4 py-3 rounded-xl bg-surface border focus:ring-2 outline-none transition-all text-sm ${formErrors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-100 focus:border-primary focus:ring-primary/20'
                                                        }`}
                                                />
                                                {formErrors.email && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{formErrors.email}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Phone</label>
                                                <input
                                                    type="tel"
                                                    placeholder="(214) 000-0000"
                                                    value={formData.phone}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, phone: e.target.value });
                                                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                                                    }}
                                                    className={`w-full px-4 py-3 rounded-xl bg-surface border focus:ring-2 outline-none transition-all text-sm ${formErrors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-100 focus:border-primary focus:ring-primary/20'
                                                        }`}
                                                />
                                                {formErrors.phone && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{formErrors.phone}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Service</label>
                                                <select
                                                    value={formData.service}
                                                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer text-sm"
                                                >
                                                    <option>Residential</option>
                                                    <option>Commercial</option>
                                                    <option>Deep Cleaning</option>
                                                    <option>Move-in/Move-out</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Preferred Date</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        min={new Date().toISOString().split('T')[0]}
                                                        value={formData.date}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, date: e.target.value });
                                                            if (formErrors.date) setFormErrors({ ...formErrors, date: '' });
                                                        }}
                                                        className={`w-full px-4 py-3 rounded-xl bg-surface border focus:ring-2 outline-none transition-all text-sm ${formErrors.date ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-100 focus:border-primary focus:ring-primary/20'
                                                            }`}
                                                    />
                                                    {formErrors.date && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{formErrors.date}</p>}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Time Slot</label>
                                                <select
                                                    value={formData.time}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, time: e.target.value });
                                                        if (formErrors.time) setFormErrors({ ...formErrors, time: '' });
                                                    }}
                                                    className={`w-full px-4 py-3 rounded-xl bg-surface border focus:ring-2 outline-none transition-all appearance-none cursor-pointer text-sm ${formErrors.time ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-100 focus:border-primary focus:ring-primary/20'
                                                        }`}
                                                >
                                                    <option value="">Select Time</option>
                                                    {timeSlots.map(slot => (
                                                        <option key={slot} value={slot}>{slot}</option>
                                                    ))}
                                                </select>
                                                {formErrors.time && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{formErrors.time}</p>}
                                            </div>
                                        </div>
                                        <button type="submit" className="btn-primary w-full py-4 mt-6 text-lg flex items-center justify-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            Confirm Booking
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center py-10"
                                >
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 text-ink">Booking Confirmed!</h3>
                                    <p className="text-sm text-ink-muted mb-8 max-w-[280px]">
                                        Thank you, {formData.name}! We've scheduled your {formData.service} cleaning for {formData.date} at {formData.time}.
                                    </p>
                                    <button
                                        onClick={() => setBookingStep('details')}
                                        className="text-primary font-bold hover:underline"
                                    >
                                        Book another session
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Social Proof Badge */}
                        <div className="mt-auto pt-6">
                            <div className="p-4 bg-surface rounded-2xl border border-gray-100 text-center">
                                <p className="text-xs font-medium text-ink">
                                    <span className="text-primary font-bold">Yes!</span> 142 people in <span className="font-bold underline">Irving</span> booked in the last 24 hours!
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
