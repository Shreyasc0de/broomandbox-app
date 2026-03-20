import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import ContactSection from '../components/home/ContactSection';
import DiamondPattern from '../components/ui/DiamondPattern';

interface ServiceContent {
    image_url: string;
    description: string;
    checklist: string[];
    title?: string;
}

// Fallback content if database is empty
const fallbackContent: Record<string, ServiceContent> = {
    'residential-cleaning': {
        image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
        description: 'Our residential cleaning service transforms your home into a spotless sanctuary. We pay attention to every detail, from baseboards to ceiling fans.',
        checklist: ['Full kitchen cleaning including appliances', 'Bathroom sanitization and disinfection', 'Bedroom and living area dusting', 'Floor vacuuming and mopping throughout', 'Window sill and ledge cleaning']
    },
    'commercial-cleaning': {
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        description: 'Keep your business looking professional with our commercial cleaning services. We work around your schedule to minimize disruption.',
        checklist: ['Office workspace and desk sanitization', 'Break room and kitchen deep clean', 'Restroom disinfection and restocking', 'Lobby and common area maintenance', 'Trash removal and recycling management']
    },
    'deep-cleaning': {
        image_url: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800',
        description: 'Our deep cleaning service tackles the dirt and grime that regular cleaning misses. Perfect for seasonal refreshes or moving preparation.',
        checklist: ['Inside oven and refrigerator cleaning', 'Baseboard and crown molding detailing', 'Light fixture and ceiling fan dusting', 'Inside cabinet and drawer wipe-down', 'Grout and tile scrubbing']
    }
};

const defaultFallback: ServiceContent = {
    image_url: '/about-lady.png',
    description: 'Our expert cleaners follow a rigorous checklist to ensure every corner of your property meets our high standards. We use eco-friendly products and advanced techniques for the best results.',
    checklist: ['Thorough dusting of all surfaces', 'Vacuuming and mopping floors', 'Sanitizing high-touch areas', 'Removing trash and recycling', 'Detailed inspection upon completion']
};

const ServicePage = () => {
    const { id } = useParams();
    const [content, setContent] = useState<ServiceContent | null>(null);
    const [loading, setLoading] = useState(true);

    // Simple formatting for the title
    const formattedTitle = id?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Our Service';

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Fetch content from database
        const fetchContent = async () => {
            try {
                const res = await fetch(`/api/service-content/${id}`);
                const data = await res.json();
                
                if (data && data.image_url) {
                    setContent({
                        image_url: data.image_url,
                        description: data.description || defaultFallback.description,
                        checklist: Array.isArray(data.checklist) ? data.checklist : defaultFallback.checklist,
                        title: data.title
                    });
                } else {
                    // Use fallback content
                    setContent(fallbackContent[id || ''] || defaultFallback);
                }
            } catch (error) {
                console.error('Failed to fetch service content:', error);
                setContent(fallbackContent[id || ''] || defaultFallback);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [id]);

    const displayTitle = content?.title || formattedTitle;
    const displayContent = content || defaultFallback;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-ink text-white overflow-hidden">
                <DiamondPattern className="top-0 right-0 opacity-5" />
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors mb-8 font-bold text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>

                    <div className="flex items-center gap-4 text-sm font-bold text-white/50 mb-6 uppercase tracking-widest">
                        <Link to="/" className="hover:text-primary transition-colors">Services</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white">{displayTitle}</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-display font-extrabold mb-8 leading-tight">
                        Professional <br /><span className="text-primary">{displayTitle}</span>
                    </h1>

                    <p className="text-xl text-white/60 max-w-2xl leading-relaxed mb-10">
                        Experience our premium {displayTitle.toLowerCase()} designed to exceed your expectations and leave your space sparkling clean. Backed by our 100% satisfaction guarantee.
                    </p>

                    <a href="#book" className="btn-primary py-4 px-10 inline-block">Book This Service</a>
                </div>
            </div>

            {/* Details Section */}
            <div className="py-24 bg-surface relative">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20">
                    <div>
                        <h2 className="text-3xl lg:text-5xl font-bold mb-8 text-ink">What's included in {displayTitle}?</h2>
                        <p className="text-lg text-ink-muted mb-8 leading-relaxed">
                            {displayContent.description}
                        </p>

                        <div className="space-y-4">
                            {displayContent.checklist.map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="font-bold text-ink">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                            {loading ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            ) : (
                                <img
                                    src={displayContent.image_url}
                                    alt={displayTitle}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent flex items-end p-10">
                                <div className="text-white">
                                    <p className="font-bold text-xl drop-shadow-md">Guaranteed Quality</p>
                                    <p className="text-white/80">Every clean is inspected.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="book">
                <ContactSection />
            </div>

            <Footer />
        </div>
    );
};

export default ServicePage;
