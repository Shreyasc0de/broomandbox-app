import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import ServicePage from './pages/ServicePage';
import WhyUsPage from './pages/WhyUsPage';
import GetQuote from './pages/GetQuote';
import AboutPage from './pages/AboutPage';
import ServiceAreasPage from './pages/ServiceAreasPage';
import ContactPage from './pages/ContactPage';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

// Lazy load admin components
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const Scheduling = lazy(() => import('./admin/Scheduling'));
const Jobs = lazy(() => import('./admin/Jobs'));
const Customers = lazy(() => import('./admin/Customers'));
const Staff = lazy(() => import('./admin/Staff'));
const Analytics = lazy(() => import('./admin/Analytics'));
const Inventory = lazy(() => import('./admin/Inventory'));
const ServiceAreas = lazy(() => import('./admin/ServiceAreas'));
const ServicesContent = lazy(() => import('./admin/ServicesContent'));
const Transformations = lazy(() => import('./admin/Transformations'));
const Compliance = lazy(() => import('./admin/Compliance'));
const Settings = lazy(() => import('./admin/Settings'));
const QuotesDashboard = lazy(() => import('./admin/QuotesDashboard'));

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <div className="flex flex-col items-center gap-4 text-primary">
      <Loader2 className="w-12 h-12 animate-spin" />
      <p className="font-bold animate-pulse text-ink">Loading Broom & Box System...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/why-choose-us" element={<WhyUsPage />} />
            <Route path="/services/:id" element={<ServicePage />} />
            <Route path="/get-quote" element={<GetQuote />} />
            <Route path="/about" element={<AboutPage />} />
          <Route path="/service-areas" element={<ServiceAreasPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<Scheduling />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="customers" element={<Customers />} />
            <Route path="staff" element={<Staff />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="quotes" element={<QuotesDashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="service-areas" element={<ServiceAreas />} />
            <Route path="services-content" element={<ServicesContent />} />
            <Route path="transformations" element={<Transformations />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
