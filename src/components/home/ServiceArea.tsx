import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

const ServiceArea = () => {
    const cities = ["Dallas", "Irving", "Plano", "Arlington"];
    return (
        <section id="areas" className="py-24">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                <div>
                    <h2 className="text-4xl lg:text-6xl mb-8">Serving Your Neighborhood</h2>
                    <p className="text-xl text-ink-muted mb-10 leading-relaxed">
                        We provide premium cleaning services across the DFW metroplex. Check if we're in your city!
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        {cities.map(city => (
                            <div key={city} className="flex items-center gap-4 p-5 bg-surface rounded-2xl border border-gray-100">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span className="text-lg font-bold text-ink">{city}</span>
                            </div>
                        ))}
                    </div>
                    <a href="#contact" className="btn-secondary mt-12 inline-flex items-center gap-2">
                        View Full Service Map <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
                <div className="relative">
                    <div className="aspect-video bg-gray-200 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
                        <img
                            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200"
                            alt="Service Area Map"
                            className="w-full h-full object-cover opacity-80"
                            referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="p-6 bg-white/90 backdrop-blur shadow-2xl rounded-2xl text-center">
                                <MapPin className="w-10 h-10 text-primary mx-auto mb-2" />
                                <p className="font-bold text-ink">DFW Service Hub</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServiceArea;
