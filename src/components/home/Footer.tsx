import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import { businessConfig } from '../../lib/config';

const socialLinks = [
    { key: 'FB', icon: Facebook, url: businessConfig.social.facebook },
    { key: 'TW', icon: Twitter, url: businessConfig.social.twitter },
    { key: 'IG', icon: Instagram, url: businessConfig.social.instagram },
    { key: 'LI', icon: Linkedin, url: businessConfig.social.linkedin },
];

const Footer = () => {
    return (
        <footer className="bg-ink text-white pt-8 pb-5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    <div>
                        <Link to="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
                            <Logo className="h-14 w-auto object-contain" />
                        </Link>
                        <p className="text-white/50 leading-relaxed mb-6 text-sm">
                            Premium cleaning and property maintenance services across DFW. We combine modern technology with traditional work ethics.
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map(s => (
                                <a 
                                    key={s.key} 
                                    href={s.url} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all group"
                                >
                                    <s.icon className="w-4 h-4 text-white/70 group-hover:text-white" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-base font-bold mb-5">Quick Links</h4>
                        <ul className="space-y-2 text-white/50 text-sm">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><a href="/#services" className="hover:text-primary transition-colors">Our Services</a></li>
                            <li><Link to="/why-choose-us" className="hover:text-primary transition-colors">Why Choose Us</Link></li>
                            <li><a href="/#about" className="hover:text-primary transition-colors">About Company</a></li>
                            <li><a href="/#areas" className="hover:text-primary transition-colors">Service Areas</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-base font-bold mb-5">Services</h4>
                        <ul className="space-y-2 text-white/50 text-sm">
                            <li><Link to="/services/deep-cleaning" className="hover:text-primary transition-colors">Deep Cleaning</Link></li>
                            <li><Link to="/services/office-cleaning" className="hover:text-primary transition-colors">Office Cleaning</Link></li>
                            <li><Link to="/services/janitorial-services" className="hover:text-primary transition-colors">Janitorial Services</Link></li>
                            <li><Link to="/services/disinfection" className="hover:text-primary transition-colors">Disinfection</Link></li>
                            <li><Link to="/services/facility-upkeep" className="hover:text-primary transition-colors">Facility Upkeep</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-base font-bold mb-5">Contact Info</h4>
                        <ul className="space-y-4 text-white/50 text-sm">
                            <li>
                                <a href={businessConfig.phoneTel} className="flex items-start gap-3 hover:text-primary transition-colors group">
                                    <Phone className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform mt-0.5" />
                                    <span>{businessConfig.phoneFormatted}</span>
                                </a>
                            </li>
                            <li>
                                <a href={businessConfig.emailHref} className="flex items-start gap-3 hover:text-primary transition-colors group">
                                    <Mail className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform mt-0.5" />
                                    <span>{businessConfig.email}</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href={businessConfig.addressUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-3 hover:text-primary transition-colors group"
                                >
                                    <MapPin className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform mt-0.5" />
                                    <span>{businessConfig.address}</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
                    <p>© 2024 Broom & Box. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
