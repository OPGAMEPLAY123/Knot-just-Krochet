import React, { useState } from 'react';
import { Sparkles, Heart, Send, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CustomOrderRequest } from '../types';

interface CustomOrdersPageProps {
  navigate: (path: string) => void;
}

export const CustomOrdersPage: React.FC<CustomOrdersPageProps> = ({ navigate }) => {
  const { user, userProfile, signInWithGoogle } = useAuth();

  const [customerName, setCustomerName] = useState(userProfile?.displayName || user?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '');
  const [productIdea, setProductIdea] = useState('');
  const [preferredColors, setPreferredColors] = useState('');
  const [approximateSize, setApproximateSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [requiredByDate, setRequiredByDate] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setErrorMessage('Please sign in with Google to submit a custom crochet inquiry.');
      return;
    }

    if (!productIdea.trim()) {
      setErrorMessage('Please describe your product or gift idea.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage('Please provide your contact phone number so our maker can reach out.');
      return;
    }

    setSubmitting(true);
    const requestId = `COR-${Date.now()}`;
    const now = new Date().toISOString();

    const requestData: CustomOrderRequest = {
      id: requestId,
      userId: user.uid,
      customerName: customerName || user.displayName || 'Customer',
      customerEmail: user.email || '',
      customerPhone: customerPhone.trim(),
      productIdea: productIdea.trim(),
      preferredColors: preferredColors.trim(),
      approximateSize: approximateSize.trim(),
      quantity: Number(quantity) || 1,
      requiredByDate: requiredByDate || undefined,
      referenceImageUrl: referenceImageUrl.trim() || undefined,
      additionalNotes: additionalNotes.trim() || undefined,
      status: 'Received',
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'customOrderRequests', requestId), requestData);
      setSubmittedId(requestId);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `customOrderRequests/${requestId}`);
      setErrorMessage('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EFE8DE] text-[#6E5049] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#E8A598]" /> Handcrafted Commissions
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D2C28]">
          Custom Crochet Orders
        </h1>
        <p className="text-sm text-[#7A6158] max-w-xl mx-auto leading-relaxed">
          Dreaming of a bespoke floral bouquet, custom-colored granny square tote, or personalized initials? Tell us your vision, and we will tailor it with love.
        </p>
      </div>

      {submittedId ? (
        <div className="bg-[#FFFDF9] rounded-3xl p-8 sm:p-12 text-center border border-[#EFE8DE] shadow-xs space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#3D2C28]">
              Request Received with Joy!
            </h2>
            <p className="text-xs text-[#8B6B61]">Reference ID: <strong>#{submittedId}</strong></p>
            <p className="text-xs text-[#7A6158] leading-relaxed">
              Our maker at Knot Just Krochet will review your idea, yarn requirements, and estimated timeframe. We will reach out via WhatsApp/email with approved pricing and details!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSubmittedId(null);
                setProductIdea('');
              }}
              className="px-6 py-2.5 rounded-full bg-[#F4EFEA] hover:bg-[#EAE2D8] text-[#6E5049] text-xs font-semibold"
            >
              Submit Another Idea
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2.5 rounded-full bg-[#6E5049] text-white text-xs font-semibold hover:bg-[#5C433C]"
            >
              Browse Catalogue
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-10 border border-[#EFE8DE] shadow-xs space-y-8">
          {errorMessage && (
            <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!user && (
            <div className="p-4 bg-[#F4EFEA] rounded-2xl border border-[#D8C7B5] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#6E5049] text-center sm:text-left">
                <strong>Sign in with Google required:</strong> Log in so we can connect this commission inquiry with your account.
              </div>
              <button
                onClick={signInWithGoogle}
                className="px-5 py-2 rounded-full bg-[#3D2C28] text-white text-xs font-semibold hover:bg-[#2A1E1B] shrink-0"
              >
                Sign In with Google
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Customer Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3D2C28]">Your Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Shalini Roy"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3D2C28]">Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              {/* Product Idea */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-[#3D2C28]">
                  Product or Gift Idea Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={productIdea}
                  onChange={(e) => setProductIdea(e.target.value)}
                  placeholder="Describe what you want made (e.g. A 7-stem tulip and chamomile bouquet in baby pink & cream wrapping for an anniversary, or a personalized pastel yellow initial 'S' keychain charm...)"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              {/* Preferred Colors */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3D2C28]">Preferred Yarn Colors</label>
                <input
                  type="text"
                  value={preferredColors}
                  onChange={(e) => setPreferredColors(e.target.value)}
                  placeholder="e.g. Pastel lavender, sage green, and cream"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              {/* Approximate Size */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3D2C28]">Approximate Dimensions / Size</label>
                <input
                  type="text"
                  value={approximateSize}
                  onChange={(e) => setApproximateSize(e.target.value)}
                  placeholder="e.g. 30 cm height, or standard tote size"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3D2C28]">Quantity Required</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              {/* Required by date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3D2C28]">Needed By Date (Optional)</label>
                <input
                  type="date"
                  value={requiredByDate}
                  onChange={(e) => setRequiredByDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              {/* Reference image URL */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-[#3D2C28]">
                  Reference Image Link / URL (Pinterest, Google Drive, or Imgur)
                </label>
                <input
                  type="url"
                  value={referenceImageUrl}
                  onChange={(e) => setReferenceImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or Pinterest pin link"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>

              {/* Additional notes */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-[#3D2C28]">Additional Notes or Gift Card Message</label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any particular details, allergy-free requirements, or gift note to include..."
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E5DACD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#6E5049] hover:bg-[#5C433C] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Request...' : 'Submit Custom Request'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
