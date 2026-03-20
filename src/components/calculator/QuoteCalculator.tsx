import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Building2, Home, ArrowRight, ArrowLeft, CheckCircle2, Calendar, Droplets } from 'lucide-react';
import { calculateEstimate, PricingRule, defaultPricingRules } from '../../lib/pricingLogic';
import { Link } from 'react-router-dom';

const serviceOptions = [
    { id: 'Standard Cleaning', title: 'Standard Cleaning', icon: Home, desc: 'Regular maintenance for your home' },
    { id: 'Deep Cleaning', title: 'Deep Cleaning', icon: Sparkles, desc: 'Intensive, detailed cleaning' },
    { id: 'Office Cleaning', title: 'Office Cleaning', icon: Building2, desc: 'Professional workplace cleaning' },
    { id: 'Move In/Out Cleaning', title: 'Move In/Out', icon: Droplets, desc: 'Get it ready for the next resident' }
];

const frequencyOptions = [
    { id: 'Weekly', title: 'Weekly', discount: '20% Off' },
    { id: 'Bi-weekly', title: 'Bi-weekly', discount: '15% Off' },
    { id: 'Monthly', title: 'Monthly', discount: '10% Off' },
    { id: 'One-time', title: 'One-time', discount: null }
];

export const QuoteCalculator = () => {
    const [step, setStep] = useState(1);
    const [serviceType, setServiceType] = useState('Standard Cleaning');
    const [sqFt, setSqFt] = useState(1500);
    const [frequency, setFrequency] = useState('Bi-weekly');
    const [estimate, setEstimate] = useState(0);
    const [pricingRules, setPricingRules] = useState<PricingRule[]>(defaultPricingRules);

    // Contact Info
    const [contact, setContact] = useState({ name: '', email: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Fetch pricing rules from database
    useEffect(() => {
        fetch('/api/pricing')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setPricingRules(data);
                }
            })
            .catch(err => console.error('Failed to fetch pricing:', err));
    }, []);

    useEffect(() => {
        setEstimate(calculateEstimate(serviceType, sqFt, frequency, pricingRules));
    }, [serviceType, sqFt, frequency, pricingRules]);

    const handleNext = () => setStep(s => Math.min(s + 1, 4));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: contact.name,
                    email: contact.email,
                    phone: contact.phone,
                    service: serviceType,
                    sqft: sqFt,
                    estimated_price: estimate,
                    notes: `Frequency: ${frequency}`
                })
            });

            if (!response.ok) throw new Error('Failed to submit quote');
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error submitting quote:', error);
            alert('There was an error submitting your request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextButtonDisabled = step === 4 && (!contact.name || !contact.email);

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-gray-100 relative">
            {/* Progress Bar */}
            <div className="h-2 bg-gray-100 w-full">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: '25%' }}
                    animate={{ width: `${(step / 4) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            <div className="p-8 md:p-12 min-h-[500px] flex flex-col">
                {isSubmitted ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold text-ink tracking-tight">Estimate Confirmed!</h2>
                        <p className="text-ink-muted text-lg max-w-md">
                            Thank you, {contact.name.split(' ')[0]}. Your estimated price is <strong>${estimate}</strong> per cleaning. We'll be in touch shortly to finalize your booking!
                        </p>
                        <Link to="/" className="mt-8 px-8 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary-hover transition-colors">
                            Return Home
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="mb-8 relative z-10">
                            <h2 className="text-2xl font-bold text-ink">
                                {step === 1 && "What type of cleaning do you need?"}
                                {step === 2 && "Tell us about your space."}
                                {step === 3 && "How often do you need us?"}
                                {step === 4 && "Your Instant Estimate"}
                            </h2>
                            <p className="text-sm font-medium text-primary mt-2">Step {step} of 4</p>
                        </div>

                        {/* Content Area */}
                        <div className="flex-grow relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {serviceOptions.map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setServiceType(opt.id)}
                                                className={`p-6 text-left rounded-2xl border-2 transition-all duration-200 ${serviceType === opt.id
                                                    ? 'border-primary bg-primary/5 shadow-md'
                                                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <opt.icon className={`w-8 h-8 mb-4 ${serviceType === opt.id ? 'text-primary' : 'text-gray-400'}`} />
                                                <h3 className={`font-semibold text-lg mb-1 ${serviceType === opt.id ? 'text-primary' : 'text-ink'}`}>{opt.title}</h3>
                                                <p className="text-ink-muted text-sm">{opt.desc}</p>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex flex-col space-y-8"
                                    >
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="text-lg font-medium text-ink">Square Footage</label>
                                                <span className="text-2xl font-bold text-primary">{sqFt} sq ft</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="500"
                                                max="10000"
                                                step="100"
                                                value={sqFt}
                                                onChange={(e) => setSqFt(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                            <div className="flex justify-between text-xs text-ink-muted mt-2 px-1">
                                                <span>500 sq ft</span>
                                                <span>10,000+ sq ft</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {frequencyOptions.map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setFrequency(opt.id)}
                                                className={`p-6 text-left rounded-2xl border-2 transition-all duration-200 relative ${frequency === opt.id
                                                    ? 'border-primary bg-primary/5 shadow-md flex items-center justify-between'
                                                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 flex items-center justify-between'
                                                    }`}
                                            >
                                                <span className={`font-semibold text-lg ${frequency === opt.id ? 'text-primary' : 'text-ink'}`}>{opt.title}</span>
                                                {opt.discount && (
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${frequency === opt.id ? 'bg-primary text-white' : 'bg-green-100 text-green-800'}`}>
                                                        {opt.discount}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.form
                                        key="step4"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleSubmit}
                                        className="flex flex-col md:flex-row gap-8"
                                    >
                                        {/* Estimate Summary */}
                                        <div className="md:w-1/2 bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col justify-center text-center">
                                            <p className="text-ink-muted mb-2">Estimated Price</p>
                                            <div className="text-5xl font-bold text-primary mb-2">${estimate}</div>
                                            <p className="text-sm font-medium text-ink bg-white py-2 px-4 rounded-full inline-block mx-auto border border-gray-100 shadow-sm">
                                                {frequency} • {serviceType}
                                            </p>
                                        </div>

                                        {/* Contact Form */}
                                        <div className="md:w-1/2 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-ink mb-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={contact.name}
                                                    onChange={e => setContact({ ...contact, name: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                                    placeholder="Jane Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-ink mb-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={contact.email}
                                                    onChange={e => setContact({ ...contact, email: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                                    placeholder="jane@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-ink mb-1">Phone Number (Optional)</label>
                                                <input
                                                    type="tel"
                                                    value={contact.phone}
                                                    onChange={e => setContact({ ...contact, phone: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                                    placeholder="(555) 123-4567"
                                                />
                                            </div>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Navigation Footer */}
                        <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                            {step > 1 ? (
                                <button
                                    onClick={handlePrev}
                                    className="flex items-center gap-2 text-ink-muted hover:text-ink font-medium px-4 py-2 rounded-lg transition-colors hover:bg-gray-50"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {step < 4 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 bg-ink text-white hover:bg-primary px-8 py-3 rounded-full font-medium transition-colors shadow-sm"
                                >
                                    Next Step
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={nextButtonDisabled || isSubmitting}
                                    className="flex items-center gap-2 bg-primary text-white hover:bg-primary-hover px-8 py-3 rounded-full font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                    <CheckCircle2 className="w-4 h-4 ml-1" />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
