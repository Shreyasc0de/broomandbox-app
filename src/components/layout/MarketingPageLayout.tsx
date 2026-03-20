import { useEffect, type ReactNode } from 'react';

import Chatbot from '../Chatbot';
import Footer from '../home/Footer';
import Navbar from '../home/Navbar';

interface MarketingPageLayoutProps {
  children: ReactNode;
  includeChatbot?: boolean;
  mainClassName?: string;
}

const MarketingPageLayout = ({
  children,
  includeChatbot = false,
  mainClassName = 'pt-24',
}: MarketingPageLayoutProps) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className={mainClassName}>{children}</main>
      <Footer />
      {includeChatbot ? <Chatbot /> : null}
    </div>
  );
};

export default MarketingPageLayout;
