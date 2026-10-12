import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  LogOut,
  Package,
  MapPin,
  Sparkles,
  Check,
  ShieldCheck,
  Heart,
  ShoppingBag,
  Trash2,
  Navigation,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface AccountPageProps {
  navigate: (path: string) => void;
  onSelectProduct?: (productId: string) => void;
}

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

export const AccountPage: React.FC<AccountPageProps> = ({ navigate, onSelectProduct }) => {
  const { user, userProfile, signOutUser, updateUserProfile, isAdmin } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { products } = useStore();

  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') === 'wishlist' ? 'wishlist' : 'address';
  const [activeTab, setActiveTab] = useState<'address' | 'wishlist'>(initialTab);

  const [fullName, setFullName] = useState(userProfile?.displayName || user?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [houseNumber, setHouseNumber] = useState(userProfile?.houseNumber || userProfile?.address || '');
  const [street, setStreet] = useState(userProfile?.street || userProfile?.locality || '');
  const [area, setArea] = useState(userProfile?.area || '');
  const [city, setCity] = useState(userProfile?.city || '');
  const [state, setState] = useState(userProfile?.state || 'Karnataka');
  const [pincode, setPincode] = useState(userProfile?.pincode || '');
  const [landmark, setLandmark] = useState(userProfile?.landmark || '');

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.displayName || user?.displayName || '');
      setPhone(userProfile.phone || '');
      setHouseNumber(userProfile.houseNumber || userProfile.address || '');
      setStreet(userProfile.street || userProfile.locality || '');
      setArea(userProfile.area || '');
      setCity(userProfile.city || '');
      setState(userProfile.state || 'Karnataka');
      setPincode(userProfile.pincode || '');
      setLandmark(userProfile.landmark || '');
    }
  }, [userProfile, user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    setLocationNotice('Detecting GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data.success && data.data) {
            const d = data.data;
            if (d.houseNumber) setHouseNumber(d.houseNumber);
            if (d.street) setStreet(d.street);
            if (d.area) setArea(d.area);
            if (d.city) setCity(d.city);
            if (d.state) setState(d.state);
            if (d.pincode) setPincode(d.pincode);
            setLocationNotice('Location details detected! Please review and save.');
          } else {
            setLocationNotice('Could not retrieve full address automatically. Please enter manually.');
          }
        } catch {
          setLocationNotice('Address service timeout. Please enter address manually.');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        setLocationNotice('Location permission was denied or unavailable. Please enter details manually.');
      },
      { timeout: 10000 }
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (pincode && !/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      setSaveError('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        displayName: fullName.trim(),
        phone: phone.trim(),
        houseNumber: houseNumber.trim(),
        street: street.trim(),
        area: area.trim(),
        city: city.trim(),
        state,
        pincode: pincode.trim(),
        landmark: landmark.trim(),
        address: `${houseNumber.trim()}, ${street.trim()}`,
        locality: area.trim(),
        deliveryDetailsCompleted: true
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setSaveError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveToCart = (item: any) => {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      addToCart(prod, 1);
      removeFromWishlist(item.productId);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#EFE8DE] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#E8A598]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#F4EFEA] flex items-center justify-center text-[#6E5049]">
              <UserIcon className="w-8 h-8" />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-[#3D2C28]">
                {user.displayName || 'Crochet Friend'}
              </h1>
              {isAdmin && (
                <span className="bg-[#6E5049] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#E8A598]" /> Admin
                </span>
              )}
            </div>
            <p className="text-xs text-[#7A6158]">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-[#F4EFEA] hover:bg-[#EAE2D8] text-[#6E5049] text-xs font-semibold transition-all"
            >
              Admin Dashboard
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-[#D8C7B5] hover:bg-[#F4EFEA] text-[#6E5049] text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/my-orders')}
          className="bg-[#FFFDF9] hover:bg-[#FAF7F2] rounded-2xl p-5 border border-[#EFE8DE] shadow-xs flex items-center justify-between text-left transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F7D6D8] flex items-center justify-center">
              <Package className="w-5 h-5 text-[#8B5E3C]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#3D2C28] group-hover:text-[#6E5049]">My Orders</h3>
              <p className="text-xs text-[#7A6158]">View order history, status & tracking details</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#8B5E3C] group-hover:translate-x-1 transition-transform">→</span>
        </button>

        <button
          onClick={() => navigate('/custom-orders')}
          className="bg-[#FFFDF9] hover:bg-[#FAF7F2] rounded-2xl p-5 border border-[#EFE8DE] shadow-xs flex items-center justify-between text-left transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EFE8DE] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#8B5E3C]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#3D2C28] group-hover:text-[#6E5049]">Custom Crochet Requests</h3>
              <p className="text-xs text-[#7A6158]">Submit a new commission or view your custom ideas</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#8B5E3C] group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#EFE8DE] pb-1">
        <button
          onClick={() => setActiveTab('address')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'address'
              ? 'bg-[#6E5049] text-white shadow-xs'
              : 'text-[#6E5049] hover:bg-[#F4EFEA]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Saved Delivery Address</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'wishlist'
              ? 'bg-[#6E5049] text-white shadow-xs'
              : 'text-[#6E5049] hover:bg-[#F4EFEA]'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>My Personal Wishlist ({wishlist.length})</span>
        </button>
      </div>

      {/* TAB 1: SAVED DELIVERY ADDRESS */}
      {activeTab === 'address' && (
        <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#EFE8DE] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F4EFEA] pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#3D2C28]">
                Doorstep Delivery Address
              </h2>
              <p className="text-xs text-[#7A6158]">
                Used to automatically pre-fill your checkout for fast and seamless orders.
              </p>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={detectingLocation}
              className="px-4 py-2 rounded-full bg-[#EFE8DE] hover:bg-[#EAE2D8] text-[#3D2C28] text-xs font-semibold flex items-center gap-1.5 border border-[#D8C7B5] transition-all self-start sm:self-auto"
            >
              {detectingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5 text-[#8B5E3C]" />}
              <span>{detectingLocation ? 'Detecting GPS...' : 'Use My Current Location'}</span>
            </button>
          </div>

          {locationNotice && (
            <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs">
              {locationNotice}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Shipping address updated successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Contact Phone Number *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B6B61]">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">House / Flat Number *</label>
                <input
                  type="text"
                  required
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="e.g. Flat 301, Sunshine Heights"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Street / Road Name *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 12th Main Road, HAL 2nd Stage"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Area / Locality *</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Indiranagar"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">City / Town *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">State *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">PIN Code (6 digits) *</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="560008"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-[#3D2C28]">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near HDFC Bank ATM"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-full bg-[#6E5049] hover:bg-[#5C433C] text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Delivery Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: PERSONAL WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {wishlist.length === 0 ? (
            <div className="bg-[#FFFDF9] rounded-3xl p-12 text-center border border-[#EFE8DE] space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F4EFEA] flex items-center justify-center mx-auto text-3xl">
                🌸
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#3D2C28]">Your Wishlist is Empty</h3>
                <p className="text-xs text-[#7A6158]">
                  Explore our handcrafted blooms, bags, and scarves to save your favorite creations!
                </p>
              </div>
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-2.5 rounded-full bg-[#6E5049] text-white text-xs font-semibold hover:bg-[#5C433C]"
              >
                Explore Shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FFFDF9] rounded-2xl p-4 border border-[#EFE8DE] shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex gap-3 items-center">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 rounded-xl object-cover bg-[#F4EFEA] shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="text-[10px] font-semibold text-[#8B5E3C] uppercase tracking-wider block truncate">
                        {item.productCategory}
                      </span>
                      <h4
                        onClick={() => onSelectProduct?.(item.productId)}
                        className="text-xs font-bold text-[#3D2C28] hover:text-[#6E5049] cursor-pointer line-clamp-1"
                      >
                        {item.productName}
                      </h4>
                      <p className="text-xs font-bold text-[#3D2C28]">
                        ₹{item.productPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F4EFEA]">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="flex-1 py-1.5 px-3 rounded-full bg-[#6E5049] hover:bg-[#5C433C] text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>

                    <button
                      onClick={() => removeFromWishlist(item.productId)}
                      className="p-1.5 rounded-full text-[#B0A39A] hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
