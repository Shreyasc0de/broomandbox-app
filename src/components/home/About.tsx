import React from 'react';
import { CheckCircle } from 'lucide-react';

const About = () => {
    return (
        <section id="about" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="relative rounded-3xl overflow-hidden aspect-square lg:aspect-auto lg:h-[600px] shadow-2xl">
                            <img
                                src="/about-lady.png"
                                alt="Cleaning Team"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                        </div>
                    </div>

                    <div>
                        <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">About Us</span>
                        <h2 className="text-4xl lg:text-5xl font-bold text-ink mb-6 leading-tight">
                            Your Trusted Partner in Cleanliness
                        </h2>
                        <p className="text-lg text-ink/70 mb-8 leading-relaxed">
                            At Broom & Box, we believe that a clean environment is the foundation of a happy life and a productive workspace. Founded with a passion for pristine spaces, we have grown into one of DFW area's most trusted cleaning and property maintenance services.
                        </p>

                        <div className="space-y-4 mb-10">
                            {[
                                "Experienced and thoroughly vetted professionals",
                                "Eco-friendly and safe cleaning products",
                                "Customized cleaning plans tailored to your needs",
                                "100% satisfaction guarantee on every service"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="mt-1 bg-primary/20 p-1 rounded-full flex-shrink-0">
                                        <CheckCircle className="w-5 h-5 text-primary" />
                                    </div>
                                    <p className="font-medium text-ink/80">{item}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-center bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                                <h3 className="text-4xl font-black text-primary mb-2">10+</h3>
                                <p className="text-sm font-bold text-ink/60 uppercase tracking-wider">Years Exp.</p>
                            </div>
                            <div className="text-center bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                                <h3 className="text-4xl font-black text-primary mb-2">5k+</h3>
                                <p className="text-sm font-bold text-ink/60 uppercase tracking-wider">Happy Clients</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
