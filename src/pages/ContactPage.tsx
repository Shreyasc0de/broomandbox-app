import ContactSection from '../components/home/ContactSection';
import MarketingPageLayout from '../components/layout/MarketingPageLayout';
import PageHero from '../components/layout/PageHero';
import { Mail } from 'lucide-react';

const ContactPage = () => {
    return (
        <MarketingPageLayout>
            <PageHero
                title="Get In Touch"
                description="Have questions or need a custom cleaning plan? We're here to help."
                icon={<Mail className="h-8 w-8 text-white" />}
            />
            <ContactSection />
        </MarketingPageLayout>
    );
};

export default ContactPage;
