import React from 'react';
import { motion } from 'motion/react';
import { QuoteCalculator } from '../components/calculator/QuoteCalculator';

const GetQuote = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl font-bold text-ink tracking-tight mb-6"
                    >
                        Get Your Free <span className="text-primary italic">Estimate</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg text-ink-muted leading-relaxed"
                    >
                        Answer a few quick questions about your space to get an instant, personalized cleaning estimate right now. No commitment required.
                    </motion.p>
                </div>

                <QuoteCalculator />
            </div>
        </div>
    );
};

export default GetQuote;
