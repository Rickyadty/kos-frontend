import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import ConfirmModal from '../components/ui/ConfirmModal';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/rooms', label: 'Listing (Kamar)' },
  { path: '/tenants', label: 'Penghuni' },
  { path: '/rentals', label: 'Hunian' },
  { path: '/bills', label: 'Tagihan' },
  { path: '/payments', label: 'Pembayaran' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef(null);

  // Close menus on click outside or route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      addToast('Logout berhasil. Sampai jumpa!', 'success');
      navigate('/login');
    } catch {
      addToast('Gagal logout.', 'error');
    } finally {
      setLogoutLoading(false);
      setShowLogoutModal(false);
    }
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/rooms?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#ebebef] text-slate-800 flex flex-col antialiased">
      {/* Top Floating / Architectural Header */}
      <header className="sticky top-0 z-40 px-4 sm:px-8 pt-4 pb-2">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5 group flex-shrink-0"
            id="brand-logo"
          >
            {/* Minimalist modern geometric Aurex logo icon */}
            {/* <div className="w-10 h-10 rounded-2xl bg-jet flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 19.5h5.5l2.25-4.5h4.5l2.25 4.5H22L12 2zm0 6l1.75 3.5h-3.5L12 8z" />
              </svg>
            </div> */}
            <div>
              <span className="text-lg font-bold tracking-tight text-jet">
                Kos Ricky
              </span>
              <span className="hidden xl:inline text-xs text-slate-500 ml-2 font-medium">
                Manajemen Kos
              </span>
            </div>
          </NavLink>

          {/* Desktop Center Floating Pill Navigation */}
          <nav className="hidden lg:flex items-center bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-black/[0.04] shadow-sm">
            {navItems.map((item) => {
              const isActive =
                item.path === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-jet text-white shadow-sm'
                    : 'text-slate-600 hover:text-jet hover:bg-slate-100/70'
                    }`}
                  id={`nav-pill-${item.label.toLowerCase().replace(/[^a-z]/g, '')}`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Icons & Profile Avatar */}
          <div className="flex items-center gap-2.5">
            {/* Search Button */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="btn-circle"
                aria-label="Cari"
                title="Pencarian Cepat"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Quick Search Popover */}
              {searchOpen && (
                <form
                  onSubmit={handleQuickSearch}
                  className="absolute right-0 top-12 w-72 bg-white rounded-2xl p-2 shadow-float border border-black/5 animate-slide-in z-50"
                >
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Cari kamar / penghuni..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input py-2 pl-4 pr-10 text-xs w-full"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="absolute right-2 p-1.5 rounded-full bg-jet text-white hover:bg-neutral-800"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => addToast('Tidak ada notifikasi baru.', 'info')}
              className="btn-circle relative"
              aria-label="Notifikasi"
              title="Notifikasi"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
            </button>

            {/* Settings Gear Button */}
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="btn-circle"
              aria-label="Pengaturan"
              title="Menu Pengguna"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Profile Avatar / Dropdown Trigger */}
            <div className="relative" ref={userMenuRef}>
              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-56 bg-black-100 backdrop-blur-3xl rounded-3xl p-3 shadow-float border border-black/5 animate-slide-in z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-2">
                    <p className="text-sm font-bold text-jet truncate">{user?.name || 'Administrator'}</p>
                    <p className="text-xs text-slate-400 capitalize">{user?.role || 'Admin'} · {user?.email || 'admin@kos.test'}</p>
                  </div>
                  <div className="space-y-1">
                    <NavLink
                      to="/dashboard"
                      className="block px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-jet rounded-xl transition-colors"
                    >
                      Dashboard Overview
                    </NavLink>
                    <NavLink
                      to="/rooms"
                      className="block px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-jet rounded-xl transition-colors"
                    >
                      Kelola Listing Kamar
                    </NavLink>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 mt-1"
                      id="btn-dropdown-logout"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Keluar / Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden btn-circle"
              aria-label="Menu"
            >
              <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Pills */}
        {mobileMenuOpen && (
          <div className="lg:hidden max-w-[1600px] mx-auto mt-3 p-3 bg-white/95 backdrop-blur-md rounded-3xl border border-black/5 shadow-float animate-slide-in">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const isActive =
                  item.path === '/dashboard'
                    ? location.pathname === '/dashboard'
                    : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${isActive
                      ? 'bg-jet text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-5">
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari Aurex Kos Living?"
        confirmText="Ya, Logout"
        cancelText="Batal"
        variant="danger"
        loading={logoutLoading}
      />
    </div>
  );
}
