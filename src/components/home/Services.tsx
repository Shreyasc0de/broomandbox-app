import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
    Building2, HardHat, Layers, Droplets, Trash2,
    ShieldCheck, Moon, Sparkles, Wind, AppWindow,
    ShoppingCart, Home, ArrowRight
} from 'lucide-react';

const services = [
    {
        title: "Deep Cleaning",
        icon: Sparkles,
        description: "Intensive, top-to-bottom cleaning. We detail every corner of your space to ensure a pristine environment.",
        image: "/branded-deep-cleaning.png"
    },
    {
        title: "Office Cleaning",
        icon: Building2,
        description: "Maintain a spotless, professional workplace with daily, weekly, or custom cleaning schedules.",
        image: "/branded-office-cleaning.png"
    },
    {
        title: "Carpet Cleaning",
        icon: Wind,
        description: "Hot-water extraction tailored to remove deep-seated dirt, allergens, and stubborn stains.",
        image: "/branded-carpet-cleaning.png"
    },
    {
        title: "Window Cleaning",
        icon: AppWindow,
        description: "Streak-free, crystal-clear interior and exterior window washing for maximum natural light.",
        image: "/branded-window-cleaning.png"
    },
    {
        title: "Floor Care",
        icon: Layers,
        description: "Comprehensive floor maintenance including sweeping, mopping, scrubbing, and professional refinishing.",
        image: "/branded-floor-care.png"
    },
    {
        title: "Restroom Sanitation",
        icon: Droplets,
        description: "Hospital-grade disinfection protocols that completely eliminate bacteria and neutralize odors.",
        image: "/branded-restroom-sanitation.png"
    },
    {
        title: "Janitorial Services",
        icon: HardHat,
        description: "Full-scale janitorial support for commercial and industrial facilities, working around your hours.",
        image: "/branded-janitorial-services.png"
    },
    {
        title: "After-Hours Cleaning",
        icon: Moon,
        description: "Discrete, zero-disruption cleaning performed overnight so your space is perfect by morning.",
        image: "/branded-after-hours-cleaning.png"
    },
    {
        title: "Disinfection",
        icon: ShieldCheck,
        description: "Targeted application of EPA-approved disinfectants to protect against viruses and pathogens.",
        image: "/branded-disinfection.png"
    },
    {
        title: "Waste Management",
        icon: Trash2,
        description: "Dependable daily trash pickup, recycling sorting, and disposal bin sanitation services.",
        image: "/branded-waste-management.png"
    },
    {
        title: "Supply Restocking",
        icon: ShoppingCart,
        description: "Inventory management and restocking of essential paper products, soaps, and sanitizers.",
        image: "/branded-supply-restocking.png"
    },
    {
        title: "Facility Upkeep",
        icon: Home,
        description: "Ongoing routine maintenance and detail work to keep your facility operating flawlessly.",
        image: "/branded-facility-upkeep.png"
    },
];

interface ServiceCardProps {
    service: typeof services[0];
    index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
            className="group flex flex-col bg-white border border-gray-200 hover:border-primary/30 rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden"
        >
            {/* Image Banner */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="p-8 flex flex-col flex-grow">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white text-ink transition-colors duration-300 shadow-sm border border-gray-100 group-hover:border-transparent -mt-14 relative z-10">
                    <service.icon className="w-5 h-5" strokeWidth={2} />
                </div>

                <h3 className="text-xl font-semibold text-ink tracking-tight mb-3 group-hover:text-primary transition-colors duration-300">
                    {service.title}
                </h3>

                <p className="text-ink-muted text-sm leading-relaxed mb-8 flex-grow">
                    {service.description}
                </p>

                <Link
                    to={`/services/${service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink group-hover:text-primary mt-auto w-fit"
                >
                    Learn More
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </div>
        </motion.div>
    );
};

const Services = () => {
    return (
        <section id="services" className="py-32 bg-white selection:bg-primary/20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="max-w-2xl mb-20 text-center lg:text-left mx-auto lg:mx-0">
                    <h2 className="text-4xl md:text-5xl font-bold text-ink tracking-tight mb-6">
                        Complete Facility Care.
                    </h2>
                    <p className="text-lg md:text-xl text-ink-muted leading-relaxed">
                        From standard janitorial support to deep disinfection protocols, we provide
                        premium, fully-insured cleaning services tailored precisely to your environment.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <ServiceCard key={index} service={service} index={index} />
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 relative z-10"
                >
                    <Link
                        to="/get-quote"
                        className="block text-center bg-gray-50 rounded-3xl p-10 lg:p-14 border border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:scale-[1.01] group cursor-pointer no-underline"
                    >
                        <h3 className="text-2xl font-bold text-ink mb-4 tracking-tight group-hover:text-primary transition-colors duration-300">
                            Need a Specialized Service?
                        </h3>
                        <p className="text-ink-muted max-w-xl mx-auto mb-8 leading-relaxed">
                            We can customize any cleaning plan to fit your specific schedule and facility requirements.
                        </p>
                        <div className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-8 py-4 rounded-full group-hover:bg-primary-light transition-all shadow-sm group-hover:shadow-md">
                            Request a Free Quote <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>
                </motion.div>

            </div>
        </section>
    );
};

export default Services;
