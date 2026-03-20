import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, X, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const FloatingWidget = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Show widget after scrolling down a bit
        const handleScroll = () => {
            if (window.scrollY > 300 && !isDismissed) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isDismissed]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="fixed bottom-6 right-6 z-[60] w-72 sm:w-80"
                >
                    <div className="relative">
                        {/* Close Button — outside the card so overflow-hidden doesn't clip it */}
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setIsDismissed(true);
                            }}
                            className="absolute -top-2 -right-2 p-1.5 bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full shadow-md transition-colors z-20 border border-gray-200"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="bg-white rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 p-6 relative overflow-hidden group">
                            {/* Background Effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                        <Tag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Limited Time</p>
                                        <h4 className="font-bold text-ink">15% Off First Clean</h4>
                                    </div>
                                </div>

                                <p className="text-sm text-ink-muted mb-4 leading-relaxed">
                                    Book your first home cleaning today and instantly save 15% off your quote.
                                </p>

                                <a
                                    href="/#contact"
                                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white py-3 px-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <CalendarCheck className="w-4 h-4" />
                                    Book Now
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FloatingWidget;
