import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import AssetDetail from './pages/AssetDetail';
import CustomerDashboard from './pages/CustomerDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import Register from './pages/Register';
import PartnerRegister from './pages/PartnerRegister';
import PartnerPortal from './pages/PartnerPortal';
import PlatformDashboard from './pages/PlatformDashboard';
import BlogPage from './pages/BlogPage';
import WelcomePromoPage from './pages/WelcomePromoPage';
import AuthModal from './components/AuthModal';

function MainAppContent() {
  const isPartnerPortal = 
    window.location.hostname.startsWith('partner.') || 
    window.location.search.includes('portal=partner');
  const isAdminPortal = 
    window.location.hostname.startsWith('admin.') || 
    window.location.hostname.startsWith('sso.') || 
    window.location.search.includes('portal=admin');
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    priceRange: 1000000
  });

  useEffect(() => {
    let faviconUrl = 'https://imgh.in/host/tq3swf'; // Default / Home
    if (isAdminPortal) {
      faviconUrl = 'https://imgh.in/host/q7l877'; // SSO / Admin
    } else if (isPartnerPortal) {
      faviconUrl = 'https://imgh.in/host/j7ws9k'; // Partner
    }

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconUrl;
  }, [isAdminPortal, isPartnerPortal]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            setCurrentPage={setCurrentPage} 
            setSelectedAssetId={setSelectedAssetId} 
            filters={filters}
            setFilters={setFilters} 
          />
        );
      case 'asset-detail':
        return (
          <AssetDetail 
            assetId={selectedAssetId} 
            setCurrentPage={setCurrentPage} 
          />
        );
      case 'customer-dashboard':
        return <CustomerDashboard />;
      case 'partner-dashboard':
        return <PartnerDashboard />;
      case 'register':
        return <Register setCurrentPage={setCurrentPage} />;
      case 'partner-register':
        return <PartnerRegister setCurrentPage={setCurrentPage} />;
      default:
        if (currentPage.startsWith('blog/')) {
          const slug = currentPage.replace('blog/', '');
          return <BlogPage slug={slug} setCurrentPage={setCurrentPage} />;
        }
        if (currentPage === 'promo/welcome') {
          return (
            <WelcomePromoPage 
              setCurrentPage={setCurrentPage} 
              setSelectedAssetId={setSelectedAssetId}
              setFilters={setFilters}
              filters={filters}
            />
          );
        }
        return (
          <Home 
            setCurrentPage={setCurrentPage} 
            setSelectedAssetId={setSelectedAssetId} 
            filters={filters}
            setFilters={setFilters} 
          />
        );
    }
  };

  if (isAdminPortal) {
    return <PlatformDashboard />;
  }

  if (isPartnerPortal) {
    return <PartnerPortal />;
  }

  return (
    <>
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
      <Footer setCurrentPage={setCurrentPage} />

      {/* Global Modals */}
      <AuthModal setCurrentPage={setCurrentPage} />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
