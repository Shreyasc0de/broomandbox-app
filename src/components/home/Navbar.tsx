import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Maximize2, Calendar, Sparkles, ChevronRight, Phone, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import { businessConfig } from '../../lib/config';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isServicesOpen, setIsServicesOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Services', href: '/#services', hasDropdown: true },
        { name: 'Why Choose Us', href: '/why-choose-us' },
        { name: 'About', href: '/about' },
        { name: 'Service Areas', href: '/service-areas' },
        { name: 'Contact', href: '/contact' },
    ];

    const servicesData = {
        'General Services': {
            icon: <Home className="w-4 h-4" />,
            items: ['Office Cleaning', 'Janitorial Services', 'After-Hours Cleaning', 'Facility Maintenance']
        },
        'Specialty Cleaning': {
            icon: <Sparkles className="w-4 h-4" />,
            items: ['Deep Cleaning', 'Floor Cleaning', 'Floor Refinishing', 'Carpet Cleaning', 'Window Cleaning']
        },
        'Sanitation & Supplies': {
            icon: <Maximize2 className="w-4 h-4" />,
            items: ['Restroom Sanitation', 'Trash Removal', 'Surface Disinfection', 'Supply Restocking']
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md py-3 shadow-md' : 'bg-white/80 backdrop-blur-sm py-5'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <a href="/" className="flex items-center gap-3">
                    <Logo className="h-12 w-auto object-contain" />
                    <span className="font-display font-bold text-2xl tracking-tight text-ink">Broom & Box</span>
                </a>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <div
                            key={link.name}
                            className="relative group"
                            onMouseEnter={() => link.hasDropdown && setIsServicesOpen(true)}
                            onMouseLeave={() => link.hasDropdown && setIsServicesOpen(false)}
                        >
                            <Link
                                to={link.href}
                                className={`text-sm font-bold flex items-center gap-1 transition-all duration-300 ${isServicesOpen && link.hasDropdown ? 'text-primary translate-y-[-1px]' : 'text-ink/80 hover:text-primary'}`}
                            >
                                {link.name}
                                {link.hasDropdown && <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isServicesOpen ? 'rotate-90 text-primary' : 'text-ink/40'}`} />}
                            </Link>

                            {/* Mega Menu Dropdown */}
                            {link.hasDropdown && (
                                <AnimatePresence>
                                    {isServicesOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-[960px]"
                                        >
                                            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden">
                                                <div className="p-12 grid grid-cols-3 gap-10">
                                                    {Object.entries(servicesData).map(([category, data]) => (
                                                        <div key={category}>
                                                            <div className="flex items-center gap-2 mb-6">
                                                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                                                    {data.icon}
                                                                </div>
                                                                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink">{category}</h4>
                                                            </div>
                                                            <ul className="space-y-5">
                                                                {data.items.map((item) => (
                                                                    <li key={item}>
                                                                        <Link
                                                                            to={`/services/${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                                                            onClick={() => setIsServicesOpen(false)}
                                                                            className="text-[14px] font-bold text-primary hover:text-primary-light transition-colors flex items-center gap-3 group/item"
                                                                        >
                                                                            <span className="-ml-3 transition-transform group-hover/item:translate-x-1">{item}</span>
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>


                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </div>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted leading-none mb-1">Call for a Free Estimate</p>
                        <a href={businessConfig.phoneTel} className="text-lg font-bold text-ink hover:text-primary transition-colors leading-none">
                            {businessConfig.phoneFormatted}
                        </a>
                    </div>
                    <a href="/get-quote" className="btn-primary py-3 px-6 text-sm whitespace-nowrap">
                        Get Free Estimate
                    </a>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="lg:hidden p-2 text-ink" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100 overflow-hidden lg:hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className="text-lg font-semibold py-2 border-b border-gray-50 text-ink"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-4 mt-4">
                                <a
                                    href="/get-quote"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="btn-primary w-full text-center block"
                                >
                                    Get Free Estimate
                                </a>
                                <a href={businessConfig.phoneTel} className="btn-secondary w-full flex items-center justify-center gap-2">
                                    <Phone className="w-4 h-4" /> Call Now
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
