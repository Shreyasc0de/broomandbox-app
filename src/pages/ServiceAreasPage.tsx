import ServiceArea from '../components/home/ServiceArea';
import MarketingPageLayout from '../components/layout/MarketingPageLayout';
import PageHero from '../components/layout/PageHero';
import { MapPin } from 'lucide-react';

const ServiceAreasPage = () => {
    return (
        <MarketingPageLayout>
            <PageHero
                title="Our Service Areas"
                description="Find out where we operate and check if your location is within our service range."
                icon={<MapPin className="h-8 w-8 text-white" />}
            />
            <section className="py-20">
                <ServiceArea />
            </section>
        </MarketingPageLayout>
    );
};

export default ServiceAreasPage;
