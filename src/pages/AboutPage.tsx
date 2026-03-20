import About from '../components/home/About';
import MarketingPageLayout from '../components/layout/MarketingPageLayout';
import PageHero from '../components/layout/PageHero';

const AboutPage = () => {
    return (
        <MarketingPageLayout>
            <PageHero
                title="About Broom & Box"
                description="Excellence in commercial and residential cleaning services with a focus on hygiene and professional reliability."
            />
            <About />
        </MarketingPageLayout>
    );
};

export default AboutPage;
