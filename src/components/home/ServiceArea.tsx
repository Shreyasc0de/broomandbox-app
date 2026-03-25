import React, { useState, useEffect } from 'react';
import { MapPin, ExternalLink, Loader2 } from 'lucide-react';
import ServiceMap from './ServiceMap';

export interface PublicServiceArea {
  zip_code: string;
  city: string;
}

const ServiceArea = () => {
    const [areas, setAreas] = useState<PublicServiceArea[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const res = await fetch('/api/public/service-areas');
                if (res.ok) {
                    const data = await res.json();
                    setAreas(data.length > 0 ? data : getFallbackAreas());
                } else {
                    setAreas(getFallbackAreas());
                }
            } catch (err) {
                console.error("Failed to fetch service areas", err);
                setAreas(getFallbackAreas());
            } finally {
                setLoading(false);
            }
        };
        fetchAreas();
    }, []);

    const getFallbackAreas = () => [
        { city: "Dallas", zip_code: "75201" },
        { city: "Irving", zip_code: "75014" },
        { city: "Plano", zip_code: "75023" },
        { city: "Arlington", zip_code: "76001" }
    ];
    return (
        <section id="areas" className="py-24">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                <div>
                    <h2 className="text-4xl lg:text-6xl mb-8">Serving Your Neighborhood</h2>
                    <p className="text-xl text-ink-muted mb-10 leading-relaxed">
                        We provide premium cleaning services across the DFW metroplex. Check if we're in your city!
                    </p>
                    <div className="grid grid-cols-2 gap-6 relative min-h-[120px]">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : (
                            areas.map(area => (
                                <div key={area.city} className="flex items-center gap-4 p-5 bg-surface rounded-2xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <span className="text-lg font-bold text-ink truncate">{area.city}</span>
                                </div>
                            ))
                        )}
                    </div>
                    <a href="#contact" className="btn-secondary mt-12 inline-flex items-center gap-2">
                        View Full Service Map <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
                <div className="relative h-full min-h-[400px]">
                    <ServiceMap areas={areas} loading={loading} />
                </div>
            </div>
        </section>
    );
};

export default ServiceArea;
