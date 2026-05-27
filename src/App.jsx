import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Market from './pages/Market';
import AssetDetail from './pages/AssetDetail';
import RenterDashboard from './pages/RenterDashboard';
import LessorDashboard from './pages/LessorDashboard';

function MainAppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  
  // Shared filters so they transfer when searching from the Home page hero
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    priceRange: 1000000
  });

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            setCurrentPage={setCurrentPage} 
            setSelectedAssetId={setSelectedAssetId} 
            setFilters={setFilters} 
          />
        );
      case 'market':
        return (
          <Market 
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
      case 'renter-dashboard':
        return <RenterDashboard />;
      case 'lessor-dashboard':
        return <LessorDashboard />;
      default:
        return (
          <Home 
            setCurrentPage={setCurrentPage} 
            setSelectedAssetId={setSelectedAssetId} 
            setFilters={setFilters} 
          />
        );
    }
  };

  return (
    <>
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
      <Footer setCurrentPage={setCurrentPage} />
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
