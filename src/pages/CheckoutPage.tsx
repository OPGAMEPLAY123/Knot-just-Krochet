import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, ArrowLeft, AlertCircle, CheckCircle2, Lock, Navigation, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ShippingAddress, Order, OrderStatus, PaymentStatus } from '../types';

interface CheckoutPageProps {
  navigate: (path: string) => void;
  onOrderSuccess: (orderId: string) => void;
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

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate, onOrderSuccess }) => {
  const { user, userProfile, signInWithGoogle, loading: authLoading } = useAuth();
  const { items, clearCart } = useCart();

  // Form State
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: userProfile?.displayName || user?.displayName || '',
    phone: userProfile?.phone || '',
    houseNumber: userProfile?.houseNumber || userProfile?.address || '',
    street: userProfile?.street || userProfile?.locality || '',
    area: userProfile?.area || '',
    city: userProfile?.city || '',
    state: userProfile?.state || 'Karnataka',
    pincode: userProfile?.pincode || '',
    landmark: userProfile?.landmark || '',
    deliveryInstructions: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [serverCalculation, setServerCalculation] = useState<{
    subtotal: number;
    shippingFee: number;
    discount: number;
    totalAmount: number;
  } | null>(null);
  const [calculationLoading, setCalculationLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null);

  // Auto-fill from profile when user or profile changes
  useEffect(() => {
    if (userProfile || user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || userProfile?.displayName || user?.displayName || '',
        phone: prev.phone || userProfile?.phone || '',
        houseNumber: prev.houseNumber || userProfile?.houseNumber || userProfile?.address || '',
        street: prev.street || userProfile?.street || userProfile?.locality || '',
        area: prev.area || userProfile?.area || '',
        city: prev.city || userProfile?.city || '',
        state: prev.state || userProfile?.state || 'Karnataka',
        pincode: prev.pincode || userProfile?.pincode || '',
        landmark: prev.landmark || userProfile?.landmark || ''
      }));
    }
  }, [user, userProfile]);

  // Recalculate total on server
  useEffect(() => {
    if (items.length === 0) {
      setCalculationLoading(false);
      return;
    }

    const fetchServerCalculation = async () => {
      setCalculationLoading(true);
      try {
        const response = await fetch('/api/orders/calculate-total', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
          })
        });
        const data = await response.json();
        if (data.success) {
          setServerCalculation({
            subtotal: data.subtotal,
            shippingFee: data.shippingFee,
            discount: data.discount,
            totalAmount: data.totalAmount
          });
        }
      } catch (err) {
        console.error('Error calculating total:', err);
      } finally {
        setCalculationLoading(false);
      }
    };

    fetchServerCalculation();
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#3D2C28]">Your bag is empty</h2>
        <p className="text-xs text-[#7A6158]">Add products before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-full bg-[#6E5049] text-white text-xs font-semibold"
        >
          Go to Shop
        </button>
      </div>
    );
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }

    setDetectingLocation(true);
    setStatusMessage({ type: 'info', text: 'Detecting GPS location...' });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          const result = await res.json();
          if (result.success && result.data) {
            const d = result.data;
            setFormData((prev) => ({
              ...prev,
              houseNumber: d.houseNumber || prev.houseNumber,
              street: d.street || prev.street,
              area: d.area || prev.area,
              city: d.city || prev.city,
              state: d.state || prev.state,
              pincode: d.pincode || prev.pincode
            }));
            setStatusMessage({ type: 'info', text: 'Location detected! Please review and confirm below.' });
          } else {
            setStatusMessage({ type: 'error', text: 'Could not auto-determine full address. Please enter manually.' });
          }
        } catch {
          setStatusMessage({ type: 'error', text: 'Geocoding service timed out. Please enter manually.' });
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        setStatusMessage({ type: 'error', text: 'Location access denied or unavailable. Please enter manually.' });
      },
      { timeout: 10000 }
    );
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Please enter your full name';
    }

    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (!formData.houseNumber.trim()) {
      errors.houseNumber = 'Please enter flat/house/building number';
    }

    if (!formData.street.trim()) {
      errors.street = 'Please enter street, area or road';
    }

    if (!formData.area.trim()) {
      errors.area = 'Please enter locality or area';
    }

    if (!formData.city.trim()) {
      errors.city = 'Please enter city / town';
    }

    if (!formData.state.trim()) {
      errors.state = 'Please select a state';
    }

    // 6-digit Indian PIN code validation
    if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      errors.pincode = 'Please enter a valid 6-digit Indian PIN code';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handlePaymentAndOrder = async () => {
    if (!user) {
      setStatusMessage({
        type: 'error',
        text: 'Google Sign-In is required to secure your order and provide tracking updates.'
      });
      return;
    }

    if (!validateForm()) {
      setStatusMessage({
        type: 'error',
        text: 'Please correct the highlighted delivery address fields.'
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      // 1. Call server to create Razorpay Order & validate total
      const createOrderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: formData,
          customerInfo: {
            name: formData.fullName,
            email: user.email,
            phone: formData.phone
          }
        })
      });

      const orderData = await createOrderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize order on server');
      }

      const generatedOrderId = `KJK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date().toISOString();

      // Check if Razorpay is configured with merchant keys
      if (orderData.isConfigured && window.Razorpay) {
        // Open live Razorpay Checkout modal
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Knot Just Krochet',
          description: `Order ${generatedOrderId}`,
          image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=200&q=80',
          order_id: orderData.orderId,
          handler: async function (response: any) {
            // Verify payment on server
            try {
              const verifyRes = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...response,
                  order: {
                    orderId: generatedOrderId,
                    customerName: formData.fullName,
                    customerEmail: user.email,
                    totalAmount: orderData.calculation.totalAmount,
                    razorpayPaymentId: response.razorpay_payment_id
                  }
                })
              });
              const verifyData = await verifyRes.json();

              if (!verifyData.verified) {
                setStatusMessage({
                  type: 'error',
                  text: 'Payment verification failed on server. Please contact support.'
                });
                setIsProcessing(false);
                return;
              }

              // Save verified order in Firestore
              await saveOrderToFirestore({
                id: generatedOrderId,
                orderId: generatedOrderId,
                userId: user.uid,
                customerName: formData.fullName,
                customerEmail: user.email || '',
                customerPhone: formData.phone,
                shippingAddress: formData,
                items: items.map((i) => ({
                  productId: i.productId,
                  name: i.name,
                  unitPrice: i.price,
                  quantity: i.quantity,
                  selectedColor: i.selectedColor,
                  selectedVariation: i.selectedVariation,
                  customNote: i.customNote,
                  image: i.image
                })),
                subtotal: orderData.calculation.subtotal,
                shippingFee: orderData.calculation.shippingFee,
                discount: orderData.calculation.discount,
                totalAmount: orderData.calculation.totalAmount,
                currency: 'INR',
                paymentStatus: 'Paid',
                orderStatus: 'Confirmed',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                createdAt: now,
                updatedAt: now
              });
            } catch (err) {
              console.error('Error finalizing order:', err);
              setIsProcessing(false);
            }
          },
          prefill: {
            name: formData.fullName,
            email: user.email,
            contact: formData.phone
          },
          theme: {
            color: '#6E5049'
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              setStatusMessage({
                type: 'info',
                text: 'Payment was cancelled. Your bag items are saved.'
              });
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Razorpay keys pending merchant configuration
        await saveOrderToFirestore({
          id: generatedOrderId,
          orderId: generatedOrderId,
          userId: user.uid,
          customerName: formData.fullName,
          customerEmail: user.email || '',
          customerPhone: formData.phone,
          shippingAddress: formData,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            unitPrice: i.price,
            quantity: i.quantity,
            selectedColor: i.selectedColor,
            selectedVariation: i.selectedVariation,
            customNote: i.customNote,
            image: i.image
          })),
          subtotal: orderData.calculation.subtotal,
          shippingFee: orderData.calculation.shippingFee,
          discount: orderData.calculation.discount,
          totalAmount: orderData.calculation.totalAmount,
          currency: 'INR',
          paymentStatus: 'Pending',
          orderStatus: 'Confirmed',
          razorpayOrderId: orderData.orderId,
          createdAt: now,
          updatedAt: now
        });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred during checkout.'
      });
      setIsProcessing(false);
    }
  };

  const saveOrderToFirestore = async (orderData: Order) => {
    try {
      await setDoc(doc(db, 'orders', orderData.orderId), orderData);

      // Trigger Resend Order Confirmation Email
      fetch('/api/emails/order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderData })
      }).catch(console.error);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      clearCart();
      setIsProcessing(false);
      onOrderSuccess(orderData.orderId);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderData.orderId}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EFE8DE] pb-4">
        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E5049] hover:text-[#3D2C28]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Bag
        </button>
        <span className="text-xs text-[#8B6B61] flex items-center gap-1 font-medium">
          <Lock className="w-3.5 h-3.5 text-[#8B5E3C]" /> 256-bit Secure Checkout
        </span>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
            statusMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Google Sign In Requirement Notice */}
      {!user && (
        <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#E8A598]/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-lg font-bold text-[#3D2C28]">
              Sign in with Google to Checkout
            </h3>
            <p className="text-xs text-[#7A6158] max-w-lg">
              We use Google Authentication to link your handcrafted order, allow real-time tracking, and keep your shipping address securely saved for future visits.
            </p>
          </div>
          <button
            onClick={signInWithGoogle}
            disabled={authLoading}
            className="px-6 py-3 rounded-full bg-[#3D2C28] hover:bg-[#2A1E1B] text-white text-xs font-semibold flex items-center gap-2.5 shadow-xs transition-all shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Shipping Details Form */}
        <div className="lg:col-span-7 bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#EFE8DE] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4EFEA] pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#3D2C28]">
                Delivery Address (India)
              </h2>
              <p className="text-xs text-[#7A6158]">Please enter accurate details for safe doorstep delivery.</p>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={detectingLocation}
              className="px-4 py-2 rounded-full bg-[#EFE8DE] hover:bg-[#EAE2D8] text-[#3D2C28] text-xs font-semibold flex items-center gap-1.5 border border-[#D8C7B5] transition-all self-start sm:self-auto"
            >
              {detectingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5 text-[#8B5E3C]" />}
              <span>{detectingLocation ? 'Detecting...' : 'Use My Current Location'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[#3D2C28]">Recipient Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="e.g. Radhika Verma"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                  formErrors.fullName ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                }`}
              />
              {formErrors.fullName && <p className="text-[11px] text-red-600">{formErrors.fullName}</p>}
            </div>

            {/* Phone */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[#3D2C28]">Contact Phone Number *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8B6B61] font-medium">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="9876543210"
                  className={`w-full pl-12 pr-4 py-2 text-xs sm:text-sm bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                    formErrors.phone ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                  }`}
                />
              </div>
              {formErrors.phone && <p className="text-[11px] text-red-600">{formErrors.phone}</p>}
            </div>

            {/* House / Flat Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3D2C28]">House / Flat Number *</label>
              <input
                type="text"
                value={formData.houseNumber}
                onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                placeholder="e.g. Apt 402, Block B"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                  formErrors.houseNumber ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                }`}
              />
              {formErrors.houseNumber && <p className="text-[11px] text-red-600">{formErrors.houseNumber}</p>}
            </div>

            {/* Street */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3D2C28]">Street / Road Name *</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="e.g. 5th Main Road"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                  formErrors.street ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                }`}
              />
              {formErrors.street && <p className="text-[11px] text-red-600">{formErrors.street}</p>}
            </div>

            {/* Area */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3D2C28]">Area / Locality *</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                placeholder="e.g. Indiranagar"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                  formErrors.area ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                }`}
              />
              {formErrors.area && <p className="text-[11px] text-red-600">{formErrors.area}</p>}
            </div>

            {/* City */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3D2C28]">City / Town *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g. Bengaluru"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                  formErrors.city ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                }`}
              />
              {formErrors.city && <p className="text-[11px] text-red-600">{formErrors.city}</p>}
            </div>

            {/* State */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3D2C28]">State *</label>
              <select
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-[#3D2C28] focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
              >
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* PIN Code */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3D2C28]">PIN Code (6 digits) *</label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                placeholder="560038"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border rounded-xl focus:outline-none focus:ring-1 ${
                  formErrors.pincode ? 'border-red-400 focus:ring-red-400' : 'border-[#E5DACD] focus:ring-[#E8A598]'
                }`}
              />
              {formErrors.pincode && <p className="text-[11px] text-red-600">{formErrors.pincode}</p>}
            </div>

            {/* Landmark */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[#3D2C28]">Landmark (Optional)</label>
              <input
                type="text"
                value={formData.landmark || ''}
                onChange={(e) => handleInputChange('landmark', e.target.value)}
                placeholder="e.g. Near HDFC Bank ATM"
                className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
              />
            </div>

            {/* Delivery Instructions */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[#3D2C28]">Optional Delivery Instructions</label>
              <input
                type="text"
                value={formData.deliveryInstructions || ''}
                onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                placeholder="e.g. Leave with security guard, call upon arrival..."
                className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
              />
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Place Order */}
        <div className="lg:col-span-5 bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#EFE8DE] shadow-xs space-y-6">
          <h2 className="font-serif text-xl font-bold text-[#3D2C28] border-b border-[#F4EFEA] pb-3">
            Items in Order
          </h2>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover bg-[#F4EFEA] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#3D2C28] truncate">{item.name}</p>
                  <p className="text-[11px] text-[#8B6B61]">
                    Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                  </p>
                </div>
                <span className="font-semibold text-[#3D2C28] shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="space-y-3 pt-4 border-t border-[#F4EFEA] text-xs text-[#7A6158]">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-[#3D2C28]">
                ₹{(serverCalculation?.subtotal ?? 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Shipping Fee</span>
              <span className="font-semibold">
                {serverCalculation?.shippingFee === 0 ? (
                  <span className="text-emerald-700 font-bold uppercase tracking-wide">FREE</span>
                ) : (
                  <span className="text-[#3D2C28]">₹{serverCalculation?.shippingFee ?? 80}</span>
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-[#F4EFEA] flex justify-between items-baseline text-sm">
              <span className="font-bold text-[#3D2C28]">Final Amount Payable</span>
              <span className="text-2xl font-bold text-[#3D2C28]">
                ₹{(serverCalculation?.totalAmount ?? 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Place Order CTA */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handlePaymentAndOrder}
              disabled={isProcessing || calculationLoading}
              className={`w-full py-4 px-6 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all ${
                isProcessing || calculationLoading
                  ? 'bg-[#A89A90] text-white cursor-wait'
                  : 'bg-[#6E5049] hover:bg-[#5C433C] text-white hover:shadow-md'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Processing Order...'
                  : calculationLoading
                  ? 'Validating Totals...'
                  : `Pay ₹${(serverCalculation?.totalAmount ?? 0).toLocaleString('en-IN')} via Razorpay`}
              </span>
            </button>

            <p className="text-[11px] text-center text-[#8B6B61] leading-relaxed">
              By placing this order, you agree to Knot Just Krochet's handcrafted shipping and returns policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
