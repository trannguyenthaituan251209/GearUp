import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
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
import Checkout from './pages/Checkout';
import AccountSettings from './pages/AccountSettings';
import Favorites from './pages/Favorites';
import GearMember from './pages/GearMember';
import SearchResult from './pages/SearchResult';
import PartnerProfile from './pages/PartnerProfile';
import AuthModal from './components/AuthModal';
import CskhChatModal from './components/CskhChatModal';

function MainAppContent() {
  const isPartnerPortal = 
    window.location.hostname.startsWith('partner.') || 
    window.location.search.includes('portal=partner');
  const isAdminPortal = 
    window.location.hostname.startsWith('admin.') || 
    window.location.hostname.startsWith('sso.') || 
    window.location.search.includes('portal=admin');
  const [currentPage, setInternalPage] = useState('home');
  const [selectedAssetId, setInternalAssetId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Sync state to URL and history
  const setCurrentPage = (page, assetId = null) => {
    setInternalPage(page);
    if (assetId) setInternalAssetId(assetId);

    let path = '/';
    if (page === 'home') path = '/';
    else if (page === 'asset-detail') path = `/asset/${assetId || selectedAssetId}`;
    else if (page === 'search-result') path = `/search?q=${encodeURIComponent(assetId || selectedAssetId || '')}`;
    else if (page === 'partner-profile') path = `/partner/${assetId || selectedAssetId}`;
    else path = `/${page}`;
    
    if (window.location.pathname + window.location.search !== path) {
      window.history.pushState({ page, assetId: assetId || selectedAssetId }, '', path);
    }
  };

  const setSelectedAssetId = (id) => {
    setInternalAssetId(id);
    if (currentPage === 'asset-detail' && id) {
       window.history.pushState({ page: 'asset-detail', assetId: id }, '', `/asset/${id}`);
    }
  };

  useEffect(() => {
    const handlePopState = (event) => {
      const state = event?.state;
      if (state && state.page) {
        setInternalPage(state.page);
        if (state.assetId) setInternalAssetId(state.assetId);
      } else {
        // Fallback parse URL on direct load
        const path = window.location.pathname;
        if (path === '/' || path === '') {
          setInternalPage('home');
        } else if (path === '/search') {
          setInternalPage('search-result');
          const searchParams = new URLSearchParams(window.location.search);
          setInternalAssetId(searchParams.get('q') || '');
        } else if (path.startsWith('/asset/')) {
          setInternalPage('asset-detail');
          setInternalAssetId(path.split('/')[2]);
        } else if (path.startsWith('/partner/')) {
          setInternalPage('partner-profile');
          setInternalAssetId(path.split('/')[2]);
        } else if (path.startsWith('/blog/')) {
          setInternalPage(`blog/${path.split('/')[2]}`);
        } else if (path.startsWith('/promo/welcome')) {
          setInternalPage('promo/welcome');
        } else {
          setInternalPage(path.substring(1));
        }
      }
    };
    
    // Initial parse to support direct URL access
    if (!window.history.state || !window.history.state.page) {
        const path = window.location.pathname;
        if (path === '/' || path === '') {
          window.history.replaceState({ page: 'home', assetId: null }, '', '/');
        }
    }
    handlePopState({ state: window.history.state });
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentPage, selectedAssetId]);

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
      case 'search-result':
        return (
          <SearchResult 
            searchQuery={selectedAssetId} 
            setCurrentPage={setCurrentPage} 
            filters={filters}
            setFilters={setFilters}
          />
        );
      case 'partner-profile':
        return <PartnerProfile partnerId={selectedAssetId} setCurrentPage={setCurrentPage} />;
      case 'checkout':
        return <Checkout setCurrentPage={setCurrentPage} />;
      case 'account-settings':
        return <AccountSettings setCurrentPage={setCurrentPage} />;
      case 'favorites':
        return <Favorites setCurrentPage={setCurrentPage} />;
      case 'gear-member':
        return <GearMember setCurrentPage={setCurrentPage} />;
      case 'giai-phap-doi-tac':
        return <BlogPage slug="giai-phap-doi-tac" setCurrentPage={setCurrentPage} />;
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

      {/* CSKH Floating Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          textDecoration: 'none',
          boxShadow: 'none',
          border: 'none',
          outline: 'none',
          transition: 'none',
          cursor: 'pointer'
        }}
        title="Nhắn tin cho bộ phận chăm sóc khách hàng"
      >
        <MessageCircle size={28} />
      </button>

      <CskhChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

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
