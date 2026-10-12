import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, Menu, X, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useWishlist } from '../context/WishlistContext';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate }) => {
  const { user, isAdmin } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop All', path: '/shop' },
    { name: 'Custom Orders', path: '/custom-orders' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EFE8DE] transition-all">
      {/* Announcement Bar */}
      {settings.announcement && (
        <div className="bg-[#6E5049] text-[#FFF9F5] text-xs font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#F7D6D8]" />
          <span>{settings.announcement}</span>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#6E5049] hover:text-[#3D2C28] rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo / Text Mark */}
          <div className="flex-1 md:flex-none flex items-center justify-center md:justify-start">
            <button
              onClick={() => handleNav('/')}
              className="group text-left flex items-center gap-3 transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-[#F7D6D8]/60 border border-[#E8A598]/40 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <span className="text-xl select-none" role="img" aria-label="crochet yarn">🧶</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-[#3D2C28] group-hover:text-[#6E5049] transition-colors block leading-tight">
                  Knot Just Krochet
                </span>
                <span className="text-[10px] tracking-widest text-[#8B6B61] uppercase font-semibold">
                  Handmade with Love
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`px-3 py-2 text-sm font-medium rounded-full transition-all ${
                    isActive
                      ? 'text-[#3D2C28] bg-[#EFE8DE] shadow-xs'
                      : 'text-[#6E5049] hover:text-[#3D2C28] hover:bg-[#F4EFEA]'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Admin Badge/Link if admin */}
            {isAdmin && (
              <button
                onClick={() => handleNav('/admin')}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  currentPath === '/admin'
                    ? 'bg-[#6E5049] text-white border-[#6E5049]'
                    : 'bg-[#F4EFEA] text-[#6E5049] border-[#D8C7B5] hover:bg-[#EAE2D8]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#E8A598]" />
                <span>Admin Panel</span>
              </button>
            )}

            {/* Account Icon */}
            <button
              onClick={() => handleNav(user ? '/account' : '/login')}
              className={`p-2.5 rounded-full transition-all relative ${
                currentPath === '/account' || currentPath === '/login'
                  ? 'bg-[#EFE8DE] text-[#3D2C28]'
                  : 'text-[#6E5049] hover:bg-[#F4EFEA] hover:text-[#3D2C28]'
              }`}
              title={user ? `Account: ${user.displayName || user.email}` : 'Sign in with Google'}
              aria-label="User Account"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 rounded-full object-cover border border-[#D8C7B5]"
                />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => handleNav(user ? '/account?tab=wishlist' : '/login')}
              className={`p-2.5 rounded-full transition-all relative ${
                currentPath.includes('wishlist')
                  ? 'bg-[#EFE8DE] text-[#3D2C28]'
                  : 'text-[#6E5049] hover:bg-[#F4EFEA] hover:text-[#3D2C28]'
              }`}
              title="Personal Wishlist"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F7D6D8] border border-[#E8A598] text-[#8B5E3C] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Icon & Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-full text-[#6E5049] hover:bg-[#F4EFEA] hover:text-[#3D2C28] transition-all relative"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E8A598] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#EFE8DE] px-4 pt-2 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNav(link.path)}
              className={`block w-full text-left px-4 py-2.5 text-base font-medium rounded-xl transition-all ${
                currentPath === link.path
                  ? 'bg-[#EFE8DE] text-[#3D2C28] font-semibold'
                  : 'text-[#6E5049] hover:bg-[#F4EFEA]'
              }`}
            >
              {link.name}
            </button>
          ))}

          {isAdmin && (
            <button
              onClick={() => handleNav('/admin')}
              className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-base font-medium text-[#6E5049] bg-[#F4EFEA] rounded-xl"
            >
              <ShieldCheck className="w-4 h-4 text-[#E8A598]" />
              <span>Admin Dashboard</span>
            </button>
          )}

          <div className="pt-2 border-t border-[#EFE8DE] flex justify-between items-center text-xs text-[#8B6B61] px-4">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-[#E8A598]" /> @knot_just_krochet
            </span>
            <span className="text-[11px] opacity-75">Built by ZORVEX by OPG</span>
          </div>
        </div>
      )}
    </header>
  );
};
