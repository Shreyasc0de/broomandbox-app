import React from 'react';
import { ShoppingCart } from 'lucide-react';
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import About from '../components/home/About';
import Gallery from '../components/home/Gallery';
import Testimonials from '../components/home/Testimonials';
import ServiceArea from '../components/home/ServiceArea';
import ContactSection from '../components/home/ContactSection';
import Footer from '../components/home/Footer';
import Chatbot from '../components/Chatbot';
import FloatingWidget from '../components/home/FloatingWidget';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />


            <main>
                <Hero />
                <Services />
                <About />
                <Gallery />
                <Testimonials />
                <ServiceArea />
                <ContactSection />
            </main>
            <Footer />
            <FloatingWidget />
            <Chatbot />
        </div>
    );
};

export default LandingPage;
