import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Instagram, ShieldCheck, Heart, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface PolicyPageProps {
  navigate: (path: string) => void;
}

// 1. About Us Page
export const AboutPage: React.FC<PolicyPageProps> = ({ navigate }) => {
  const { settings } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-8">
      <div className="space-y-3 text-center sm:text-left">
        <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">
          Our Story
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D2C28]">
          Welcome to Knot Just Krochet
        </h1>
        <p className="text-base text-[#7A6158] font-light leading-relaxed">
          Crafting gentle moments, timeless flowers, and heartfelt keepsakes with soft yarn and patience.
        </p>
      </div>

      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-10 border border-[#EFE8DE] shadow-xs space-y-6 text-xs sm:text-sm text-[#5C433C] leading-relaxed">
        <p>
          At <strong>Knot Just Krochet</strong>, crochet isn’t just loops and stitches — it is a handmade language of love, warmth, and mindfulness. Every single petal on our eternal flowers, every strap on our granny square tote bags, and every custom monogram keychain is crocheted entirely by hand using premium, skin-friendly milk cotton and plush yarns.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#3D2C28] pt-2">Why Everlasting Crochet Blooms?</h3>
        <p>
          Fresh flowers wilt within days, but handcrafted crochet bouquets remain vibrant for a lifetime. Whether it’s celebrating a graduation, wedding anniversary, birthday, or just brightening your study desk, our floral bouquets serve as everlasting reminders of life’s sweetest memories.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#3D2C28] pt-2">Bespoke Personalized Commissions</h3>
        <p>
          We take deep pride in bringing our customers’ custom ideas into reality. Whether you want custom colorways matching your wedding theme or a special character charm for your partner, we work closely with you through every loop.
        </p>

        <div className="pt-4 border-t border-[#F4EFEA] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧶</span>
            <span className="font-serif font-bold text-[#3D2C28]">Follow our journey on Instagram:</span>
          </div>
          <a
            href="https://instagram.com/knot_just_krochet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EFE8DE] hover:bg-[#EAE2D8] text-[#3D2C28] font-semibold text-xs transition-all"
          >
            <Instagram className="w-4 h-4 text-[#C13584]" />
            <span>@knot_just_krochet</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// 2. Contact Page
export const ContactPage: React.FC<PolicyPageProps> = ({ navigate }) => {
  const { settings } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">
          Let’s Connect
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D2C28]">
          Contact Knot Just Krochet
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6158] max-w-lg mx-auto">
          Have a question about an order, custom commission, or care instructions? Reach out directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#EFE8DE] shadow-xs space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#3D2C28]">Business Information</h2>
          <div className="space-y-4 text-xs text-[#7A6158]">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#8B5E3C] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#3D2C28]">Email Support</p>
                <a href={`mailto:${settings.contactEmail}`} className="hover:underline">
                  {settings.contactEmail}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#8B5E3C] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#3D2C28]">Phone / WhatsApp</p>
                <p>{settings.contactPhone}</p>
                <p className="text-[11px] text-[#8B6B61]">Monday - Saturday, 10 AM to 7 PM IST</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Instagram className="w-4 h-4 text-[#C13584] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#3D2C28]">Official Instagram</p>
                <a
                  href="https://instagram.com/knot_just_krochet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline font-medium text-[#6E5049]"
                >
                  @knot_just_krochet
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F4EFEA] text-[11px] text-[#8B6B61] leading-relaxed">
            <p>
              <strong>Handcrafted studio in India:</strong> Every piece is custom produced and packaged safely with protective mailers for nationwide delivery.
            </p>
          </div>
        </div>

        {/* Message form */}
        <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#EFE8DE] shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#3D2C28]">Send a Note</h2>
          {sent ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Thank you! Your message has been received. We will reply shortly.</span>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shalini Roy"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Your Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#6E5049] hover:bg-[#5C433C] text-white font-semibold flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Shipping Policy Page
export const ShippingPolicyPage: React.FC<PolicyPageProps> = ({ navigate }) => {
  const { settings } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-8">
      <div className="space-y-2 text-center sm:text-left">
        <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">Store Policy</span>
        <h1 className="font-serif text-3xl font-bold text-[#3D2C28]">Shipping & Delivery Policy</h1>
        <p className="text-xs text-[#7A6158]">Last updated: October 2026</p>
      </div>

      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-10 border border-[#EFE8DE] shadow-xs space-y-6 text-xs sm:text-sm text-[#5C433C] leading-relaxed">
        <h3 className="font-serif text-base font-bold text-[#3D2C28]">1. Handmade Dispatch Timelines</h3>
        <p>
          Because our crochet flowers, bouquets, bags, and wearables are meticulously handcrafted stitch-by-stitch, items in ready stock dispatch within <strong>3 to 5 business days</strong>. Custom commission requests or personalized monogram creations generally require <strong>5 to 10 business days</strong> for crafting prior to shipment.
        </p>

        <h3 className="font-serif text-base font-bold text-[#3D2C28]">2. Delivery Zones and Couriers</h3>
        <p>
          We provide pan-India delivery across all serviceable Indian PIN codes via trusted courier partners including Blue Dart, Delhivery, DTDC, and India Post Speed Post. Delivery typically takes <strong>3 to 7 business days</strong> post dispatch depending on the destination city.
        </p>

        <h3 className="font-serif text-base font-bold text-[#3D2C28]">3. Shipping Rates</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Standard Delivery:</strong> Flat ₹{settings.standardShippingFee} across India for orders under ₹{settings.freeShippingThreshold.toLocaleString('en-IN')}.</li>
          <li><strong>Free Shipping:</strong> Automatically applied at checkout on all orders totaling ₹{settings.freeShippingThreshold.toLocaleString('en-IN')} or more.</li>
        </ul>

        <h3 className="font-serif text-base font-bold text-[#3D2C28]">4. Order Tracking</h3>
        <p>
          Once your package has been handed over to the courier partner, an automated tracking update with your AWB/waybill number is updated in your <strong>My Orders</strong> page.
        </p>
      </div>
    </div>
  );
};

// 4. Returns & Refund Policy
export const RefundPolicyPage: React.FC<PolicyPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-8">
      <div className="space-y-2 text-center sm:text-left">
        <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">Store Policy</span>
        <h1 className="font-serif text-3xl font-bold text-[#3D2C28]">Returns, Refunds & Cancellation Policy</h1>
        <p className="text-xs text-[#7A6158]">Last updated: October 2026</p>
      </div>

      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-10 border border-[#EFE8DE] shadow-xs space-y-6 text-xs sm:text-sm text-[#5C433C] leading-relaxed">
        <h3 className="font-serif text-base font-bold text-[#3D2C28]">1. Handmade Nature of Items</h3>
        <p>
          Each item at Knot Just Krochet is uniquely handcrafted with artisanal care. Minor natural variations in stitch tension or color hues (due to camera lighting or yarn dye lots) are characteristics of authentic handmade crochet and are not deemed defects.
        </p>

        <h3 className="font-serif text-base font-bold text-[#3D2C28]">2. Transit Damage & Defect Claims</h3>
        <p>
          We pack every order with sturdy protective wrap. If an item arrives physically damaged during postal transit, please notify us within <strong>48 hours of delivery</strong>. An uninterrupted <strong>unboxing video</strong> from sealed packaging to opening is strictly required to process a replacement or refund.
        </p>

        <h3 className="font-serif text-base font-bold text-[#3D2C28]">3. Non-Returnable Items</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Customized or personalized crochet orders (custom letters, initials, bespoke color requests).</li>
          <li>Items damaged due to improper washing, harsh detergents, or customer mishandling.</li>
        </ul>

        <h3 className="font-serif text-base font-bold text-[#3D2C28]">4. Refund Process</h3>
        <p>
          Upon inspection and approval of a valid claim, refunds are processed back to the original payment source through Razorpay within <strong>5 to 7 business days</strong>.
        </p>
      </div>
    </div>
  );
};

// 5. Privacy Policy
export const PrivacyPolicyPage: React.FC<PolicyPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-8">
      <div className="space-y-2 text-center sm:text-left">
        <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">Legal</span>
        <h1 className="font-serif text-3xl font-bold text-[#3D2C28]">Privacy Policy</h1>
        <p className="text-xs text-[#7A6158]">Last updated: October 2026</p>
      </div>

      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-10 border border-[#EFE8DE] shadow-xs space-y-6 text-xs sm:text-sm text-[#5C433C] leading-relaxed">
        <p>
          At <strong>Knot Just Krochet</strong>, we value and respect your privacy. This policy outlines how your data is collected, used, and safeguarded.
        </p>
        <h3 className="font-serif text-base font-bold text-[#3D2C28]">1. Information We Collect</h3>
        <p>
          We collect personal information required strictly to process your orders and commissions: your name, email (via Google Authentication), phone number, and delivery postal address.
        </p>
        <h3 className="font-serif text-base font-bold text-[#3D2C28]">2. Payment Data Protection</h3>
        <p>
          We do NOT store or have access to your bank account passwords, credit/debit card numbers, or UPI PINs. Online payments are processed through Razorpay's secure, PCI-DSS compliant infrastructure.
        </p>
        <h3 className="font-serif text-base font-bold text-[#3D2C28]">3. Data Sharing</h3>
        <p>
          We never sell, rent, or trade your personal data with third parties. Your address is shared solely with postal and courier services for delivery fulfilment.
        </p>
      </div>
    </div>
  );
};

// 6. Terms and Conditions
export const TermsPage: React.FC<PolicyPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-8">
      <div className="space-y-2 text-center sm:text-left">
        <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">Legal</span>
        <h1 className="font-serif text-3xl font-bold text-[#3D2C28]">Terms and Conditions</h1>
        <p className="text-xs text-[#7A6158]">Last updated: October 2026</p>
      </div>

      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-10 border border-[#EFE8DE] shadow-xs space-y-6 text-xs sm:text-sm text-[#5C433C] leading-relaxed">
        <p>
          By visiting, browsing, or purchasing from <strong>Knot Just Krochet</strong>, you agree to comply with and be bound by these terms.
        </p>
        <h3 className="font-serif text-base font-bold text-[#3D2C28]">1. Pricing and Indian Currency</h3>
        <p>
          All prices displayed are denominated in Indian Rupees (INR, ₹). We reserve the right to revise product prices and promotional discounts at any time without prior notice.
        </p>
        <h3 className="font-serif text-base font-bold text-[#3D2C28]">2. Handmade Craftsmanship</h3>
        <p>
          Items are individually handmade. Dimensions provided are approximate and may exhibit slight variations of up to 1-2 cm.
        </p>
        <h3 className="font-serif text-base font-bold text-[#3D2C28]">3. Intellectual Property</h3>
        <p>
          All photographs, patterns, and creative content presented on this website are the property of Knot Just Krochet and developer ZORVEX by OPG. Unauthorized reproduction is prohibited.
        </p>
      </div>
    </div>
  );
};
