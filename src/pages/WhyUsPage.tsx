import WhyChooseUs from '../components/home/WhyChooseUs';
import MarketingPageLayout from '../components/layout/MarketingPageLayout';

const WhyUsPage = () => {
    return (
        <MarketingPageLayout includeChatbot mainClassName="min-h-[calc(100vh-400px)] pt-24">
            <div>
                <WhyChooseUs />
            </div>
        </MarketingPageLayout>
    );
};

export default WhyUsPage;
