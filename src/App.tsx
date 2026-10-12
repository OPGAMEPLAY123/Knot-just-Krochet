import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CompleteDeliveryDetailsModal } from './components/CompleteDeliveryDetailsModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { CustomOrdersPage } from './pages/CustomOrdersPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import {
  AboutPage,
  ContactPage,
  ShippingPolicyPage,
  RefundPolicyPage,
  PrivacyPolicyPage,
  TermsPage
} from './pages/PolicyPages';

export function AppContent() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [showDeliveryModal, setShowDeliveryModal] = useState<boolean>(false);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check if delivery details need to be completed after Google Sign-In
  useEffect(() => {
    if (user && userProfile && !userProfile.deliveryDetailsCompleted) {
      setShowDeliveryModal(true);
    } else {
      setShowDeliveryModal(false);
    }
  }, [user, userProfile]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleSelectOrder = (orderId: string) => {
    navigate(`/my-orders/${orderId}`);
  };

  const handleOrderSuccess = (orderId: string) => {
    navigate(`/my-orders/${orderId}`);
  };

  // If initial auth is checking, show smooth spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-center space-y-3">
        <div>
          <div className="w-12 h-12 rounded-full bg-[#F7D6D8] flex items-center justify-center mx-auto text-2xl animate-pulse mb-3">
            🧶
          </div>
          <p className="font-serif text-lg font-bold text-[#3D2C28]">Knot Just Krochet</p>
          <p className="text-xs text-[#8B6B61]">Loading handmade creations...</p>
        </div>
      </div>
    );
  }

  // Force first login then home all: If user is not authenticated, present login screen
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#3D2C28]">
        <LoginPage navigate={navigate} redirectTo="/" />
      </div>
    );
  }

  // Route matching for authenticated users
  const renderRoute = () => {
    // 1. Home
    if (currentPath === '/' || currentPath === '') {
      return <HomePage navigate={navigate} onSelectProduct={handleSelectProduct} />;
    }

    // 2. Shop
    if (currentPath === '/shop') {
      const urlParams = new URLSearchParams(window.location.search);
      const initialCat = urlParams.get('category') || undefined;
      return <ShopPage initialCategory={initialCat} onSelectProduct={handleSelectProduct} />;
    }

    // 3. Product Details (/product/:id)
    if (currentPath.startsWith('/product/')) {
      const productId = currentPath.replace('/product/', '').trim();
      return (
        <ProductDetailsPage
          productId={productId}
          navigate={navigate}
          onSelectProduct={handleSelectProduct}
        />
      );
    }

    // 4. Cart
    if (currentPath === '/cart') {
      return <CartPage navigate={navigate} onSelectProduct={handleSelectProduct} />;
    }

    // 5. Checkout
    if (currentPath === '/checkout') {
      return <CheckoutPage navigate={navigate} onOrderSuccess={handleOrderSuccess} />;
    }

    // 6. Login
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }

    // 7. Account
    if (currentPath === '/account') {
      return <AccountPage navigate={navigate} onSelectProduct={handleSelectProduct} />;
    }

    // 8. My Orders list
    if (currentPath === '/my-orders') {
      return <MyOrdersPage navigate={navigate} onSelectOrder={handleSelectOrder} />;
    }

    // 9. Order Details (/my-orders/:orderId)
    if (currentPath.startsWith('/my-orders/')) {
      const orderId = currentPath.replace('/my-orders/', '').trim();
      return <OrderDetailsPage orderId={orderId} navigate={navigate} />;
    }

    // 10. Custom Orders
    if (currentPath === '/custom-orders') {
      return <CustomOrdersPage navigate={navigate} />;
    }

    // 11. Admin Dashboard
    if (currentPath === '/admin') {
      return <AdminDashboardPage navigate={navigate} />;
    }

    // 12. Policies & Informational
    if (currentPath === '/about') return <AboutPage navigate={navigate} />;
    if (currentPath === '/contact') return <ContactPage navigate={navigate} />;
    if (currentPath === '/shipping-policy') return <ShippingPolicyPage navigate={navigate} />;
    if (currentPath === '/refund-policy') return <RefundPolicyPage navigate={navigate} />;
    if (currentPath === '/privacy') return <PrivacyPolicyPage navigate={navigate} />;
    if (currentPath === '/terms') return <TermsPage navigate={navigate} />;

    // 404 Not Found fallback
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="text-4xl">🧶</div>
        <h2 className="font-serif text-2xl font-bold text-[#3D2C28]">Page Not Found</h2>
        <p className="text-xs text-[#7A6158]">
          The crochet page you are searching for doesn't exist or has moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-full bg-[#6E5049] text-white text-xs font-semibold hover:bg-[#5C433C]"
        >
          Return to Home
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#3D2C28]">
      <Header currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">{renderRoute()}</main>
      <Footer navigate={navigate} />
      <CartDrawer navigate={navigate} />

      {/* Complete Your Delivery Details modal on first login */}
      <CompleteDeliveryDetailsModal
        isOpen={showDeliveryModal}
        canDismiss={true}
        onComplete={() => {
          setShowDeliveryModal(false);
          navigate('/');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
