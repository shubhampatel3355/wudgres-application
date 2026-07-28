import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, Settings, Menu, Bell, IndianRupee, MapPin, Users, MessageSquare, Image as ImageIcon } from 'lucide-react';
import DashboardOverview from './pages/DashboardOverview';
import ProductsList from './pages/ProductsList';
import ProductForm from './pages/ProductForm';
import PricingManager from './pages/PricingManager';
import SeriesManager from './pages/SeriesManager';
import DealerManager from './pages/DealerManager';
import UserManager from './pages/UserManager';
import LeadManager from './pages/LeadManager';
import NotificationCenter from './pages/NotificationCenter';
import SettingsManager from './pages/SettingsManager';
import FinishesManager from './pages/FinishesManager';
import HomeContentManager from './pages/HomeContentManager';
import footerLogo from './assets/footer_logo.png';
import logoIcon from './assets/logo.png';

// Layout Component
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} color="var(--text-primary)" />
          </button>
          <img src={footerLogo} alt="WudGres" style={{ height: '30px', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header" style={{ height: '80px', overflow: 'hidden' }}>
          <img src={logoIcon} alt="W" className="sidebar-logo-collapsed" />
          <img src={footerLogo} alt="WudGres" className="sidebar-logo-expanded" />
        </div>

        <nav className="nav-menu">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/products" className={`nav-item ${location.pathname.includes('/products') ? 'active' : ''}`}>
            <Package size={20} />
            <span>Products</span>
          </Link>
          <Link to="/series" className={`nav-item ${location.pathname === '/series' ? 'active' : ''}`}>
            <FolderTree size={20} />
            <span>Series & Categories</span>
          </Link>
          <Link to="/pricing" className={`nav-item ${location.pathname === '/pricing' ? 'active' : ''}`}>
            <IndianRupee size={20} />
            <span>Pricing Rules</span>
          </Link>
          <Link to="/finishes" className={`nav-item ${location.pathname === '/finishes' ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Global Finishes</span>
          </Link>
          <Link to="/dealers" className={`nav-item ${location.pathname === '/dealers' ? 'active' : ''}`}>
            <MapPin size={20} />
            <span>Dealers & Stores</span>
          </Link>
          <Link to="/users" className={`nav-item ${location.pathname === '/users' ? 'active' : ''}`}>
            <Users size={20} />
            <span>Users</span>
          </Link>
          <Link to="/leads" className={`nav-item ${location.pathname === '/leads' ? 'active' : ''}`}>
            <MessageSquare size={20} />
            <span>Inquiries</span>
          </Link>
          <Link to="/notifications" className={`nav-item ${location.pathname === '/notifications' ? 'active' : ''}`}>
            <Bell size={20} />
            <span>Notifications</span>
          </Link>
          <Link to="/home-content" className={`nav-item ${location.pathname === '/home-content' ? 'active' : ''}`}>
            <ImageIcon size={20} />
            <span>Home Content</span>
          </Link>
          <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/edit/:id" element={<ProductForm />} />
          <Route path="/series" element={<SeriesManager />} />
          <Route path="/pricing" element={<PricingManager />} />
          <Route path="/finishes" element={<FinishesManager />} />
          <Route path="/dealers" element={<DealerManager />} />
          <Route path="/users" element={<UserManager />} />
          <Route path="/leads" element={<LeadManager />} />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/home-content" element={<HomeContentManager />} />
          <Route path="/settings" element={<SettingsManager />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
