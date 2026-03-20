import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ShieldCheck, Sparkles, Clock, Star } from 'lucide-react';
import DiamondPattern from '../ui/DiamondPattern';

const WhyChooseUs = () => {
    const features = [
        { title: "Professional Staff", desc: "Trained, vetted, and dedicated experts.", icon: CheckCircle2 },
        { title: "Insured & Bonded", desc: "Complete peace of mind for every job.", icon: ShieldCheck },
        { title: "Eco-Friendly Products", desc: "Safe for your family, pets, and planet.", icon: Sparkles },
        { title: "Reliable Scheduling", desc: "We show up on time, every single time.", icon: Clock },
        { title: "Affordable Pricing", desc: "Premium quality at competitive rates.", icon: Star },
    ];

    return (
        <section id="why-us" className="py-24 bg-ink text-white relative overflow-hidden">
            <DiamondPattern className="top-0 right-0 opacity-5" />
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-4xl lg:text-6xl mb-8 leading-tight">Why Choose <br /><span className="text-primary">Broom & Box?</span></h2>
                        <p className="text-xl text-white/60 mb-12 leading-relaxed">
                            We've built our reputation on trust, quality, and consistency. Our mission is to provide a service that exceeds expectations and simplifies your life.
                        </p>
                        <a href="#about" className="btn-primary py-4 px-10 inline-block text-center">Learn More About Us</a>
                    </div>
                    <div className="grid gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                    <f.icon className="text-white w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold">{f.title}</h4>
                                    <p className="text-white/50 text-sm">{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
