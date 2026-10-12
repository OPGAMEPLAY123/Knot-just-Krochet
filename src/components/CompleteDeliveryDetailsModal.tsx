import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CompleteDeliveryDetailsModalProps {
  isOpen: boolean;
  onComplete: () => void;
  canDismiss?: boolean;
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

export const CompleteDeliveryDetailsModal: React.FC<CompleteDeliveryDetailsModalProps> = ({
  isOpen,
  onComplete,
  canDismiss = false
}) => {
  const { user, userProfile, updateUserProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userProfile || user) {
      setFullName(userProfile?.displayName || user?.displayName || '');
      setPhone(userProfile?.phone || '');
      setHouseNumber(userProfile?.houseNumber || userProfile?.address || '');
      setStreet(userProfile?.street || userProfile?.locality || '');
      setArea(userProfile?.area || '');
      setCity(userProfile?.city || '');
      setState(userProfile?.state || 'Karnataka');
      setPincode(userProfile?.pincode || '');
      setLandmark(userProfile?.landmark || '');
    }
  }, [user, userProfile]);

  if (!isOpen) return null;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice({
        type: 'error',
        text: 'Geolocation is not supported by your browser. Please enter your address manually.'
      });
      return;
    }

    setDetectingLocation(true);
    setLocationNotice({
      type: 'info',
      text: 'Detecting your device GPS location...'
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          const result = await res.json();

          if (result.success && result.data) {
            const d = result.data;
            if (d.houseNumber) setHouseNumber(d.houseNumber);
            if (d.street) setStreet(d.street);
            if (d.area) setArea(d.area);
            if (d.city) setCity(d.city);
            if (d.state) setState(d.state);
            if (d.pincode) setPincode(d.pincode);

            setLocationNotice({
              type: 'success',
              text: 'Location detected! Please review and confirm your details below.'
            });
          } else {
            setLocationNotice({
              type: 'error',
              text: 'Could not auto-determine full address details. You can enter them manually.'
            });
          }
        } catch (err) {
          console.error('Reverse geocode error:', err);
          setLocationNotice({
            type: 'error',
            text: 'Address lookup service timed out. Please enter your address details manually.'
          });
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        console.warn('Geolocation denied or unavailable:', error);
        let errorMsg = 'Location access was denied or unavailable. Please fill in your address manually below.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied in your browser. You can enter your delivery address manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'GPS location unavailable. Please enter your address manually.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'GPS request timed out. Please enter your address manually.';
        }
        setLocationNotice({
          type: 'error',
          text: errorMsg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs.fullName = 'Full name is required';

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.phone = 'Valid 10-digit Indian phone number required';
    }

    if (!houseNumber.trim()) errs.houseNumber = 'House / flat number is required';
    if (!street.trim()) errs.street = 'Street or road name is required';
    if (!area.trim()) errs.area = 'Area or locality is required';
    if (!city.trim()) errs.city = 'City or town is required';

    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      errs.pincode = 'Valid 6-digit Indian PIN code required';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

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

      // Send Welcome email via Resend
      if (user?.email) {
        fetch('/api/emails/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toEmail: user.email,
            customerName: fullName.trim() || user.displayName || 'Friend'
          })
        }).catch(console.error);
      }

      onComplete();
    } catch (err) {
      console.error('Failed to save delivery profile:', err);
      setLocationNotice({
        type: 'error',
        text: 'Failed to save address. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3D2C28]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF9] rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-[#EFE8DE] shadow-2xl space-y-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-full bg-[#F7D6D8] flex items-center justify-center mx-auto text-xl shadow-xs">
            🏡
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#3D2C28]">
            Complete Your Delivery Details
          </h2>
          <p className="text-xs text-[#7A6158] max-w-md mx-auto">
            Welcome to Knot Just Krochet! Please provide your delivery address for safe, doorstep postal dispatch across India.
          </p>
        </div>

        {/* Location Notice / Alerts */}
        {locationNotice && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
              locationNotice.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : locationNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {locationNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : locationNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
            )}
            <span className="leading-snug">{locationNotice.text}</span>
          </div>
        )}

        {/* Use My Current Location CTA */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={detectingLocation}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#EFE8DE] hover:bg-[#EAE2D8] text-[#3D2C28] text-xs font-semibold flex items-center justify-center gap-2 border border-[#D8C7B5] transition-all shadow-2xs"
          >
            {detectingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#6E5049]" />
            ) : (
              <Navigation className="w-4 h-4 text-[#8B5E3C]" />
            )}
            <span>{detectingLocation ? 'Detecting GPS...' : 'Use My Current Location'}</span>
          </button>
        </div>

        {/* Address Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="font-semibold text-[#3D2C28]">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Radhika Verma"
                className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                  formErrors.fullName ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                }`}
              />
              {formErrors.fullName && <p className="text-[10px] text-red-600">{formErrors.fullName}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="font-semibold text-[#3D2C28]">Mobile Number *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6B61]">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className={`w-full pl-10 pr-3 py-2 bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                    formErrors.phone ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                  }`}
                />
              </div>
              {formErrors.phone && <p className="text-[10px] text-red-600">{formErrors.phone}</p>}
            </div>

            {/* House / Flat Number */}
            <div className="space-y-1">
              <label className="font-semibold text-[#3D2C28]">House / Flat Number *</label>
              <input
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="e.g. Flat 302, Block B"
                className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                  formErrors.houseNumber ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                }`}
              />
              {formErrors.houseNumber && <p className="text-[10px] text-red-600">{formErrors.houseNumber}</p>}
            </div>

            {/* Street */}
            <div className="space-y-1">
              <label className="font-semibold text-[#3D2C28]">Street / Road Name *</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. 100ft Road, 4th Cross"
                className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                  formErrors.street ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                }`}
              />
              {formErrors.street && <p className="text-[10px] text-red-600">{formErrors.street}</p>}
            </div>

            {/* Area */}
            <div className="space-y-1">
              <label className="font-semibold text-[#3D2C28]">Area / Locality / Suburb *</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Indiranagar"
                className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                  formErrors.area ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                }`}
              />
              {formErrors.area && <p className="text-[10px] text-red-600">{formErrors.area}</p>}
            </div>

            {/* City */}
            <div className="space-y-1">
              <label className="font-semibold text-[#3D2C28]">City / Town *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru"
                className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                  formErrors.city ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                }`}
              />
              {formErrors.city && <p className="text-[10px] text-red-600">{formErrors.city}</p>}
            </div>

            {/* State */}
            <div className="space-y-1">
              <label className="font-semibold text-[#3D2C28]">State *</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* PIN Code */}
            <div className="space-y-1">
              <label className="font-semibold text-[#3D2C28]">PIN Code (6 digits) *</label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="560038"
                className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                  formErrors.pincode ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                }`}
              />
              {formErrors.pincode && <p className="text-[10px] text-red-600">{formErrors.pincode}</p>}
            </div>

            {/* Landmark (Optional) */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-[#3D2C28]">Landmark (Optional)</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Metro Station Pillar 104"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4EFEA]">
            {canDismiss && (
              <button
                type="button"
                onClick={onComplete}
                className="px-5 py-2.5 rounded-full border border-[#D8C7B5] hover:bg-[#F4EFEA] text-xs font-semibold text-[#6E5049]"
              >
                Fill Later
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-7 py-2.5 rounded-full bg-[#6E5049] hover:bg-[#5C433C] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{saving ? 'Saving Address...' : 'Save & Enter Shop'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
