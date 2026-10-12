import React from 'react';
import { Heart, Instagram, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings } = useStore();

  return (
    <footer className="bg-[#F4EFEA] border-t border-[#E5DACD] text-[#5C433C]">
      {/* Brand value highlights */}
      <div className="border-b border-[#E5DACD]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#F7D6D8] flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-[#8B5E3C]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#3D2C28] text-sm">100% Handcrafted with Love</h4>
                <p className="text-xs text-[#7A6158] mt-0.5">Every stitch woven by hand using premium, skin-safe cotton & plush yarns.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#EFE8DE] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#8B5E3C]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#3D2C28] text-sm">Custom Commissions</h4>
                <p className="text-xs text-[#7A6158] mt-0.5">Personalized initials, custom flower palettes, and tailor-made gifts for every celebration.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#F7D6D8] flex items-center justify-center shrink-0">
                <Instagram className="w-5 h-5 text-[#8B5E3C]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#3D2C28] text-sm">Direct Maker Support</h4>
                <p className="text-xs text-[#7A6158] mt-0.5">DM us on Instagram @knot_just_krochet for fast inquiries & custom previews.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl" role="img" aria-label="crochet yarn">🧶</span>
              <span className="font-serif text-xl font-bold text-[#3D2C28]">Knot Just Krochet</span>
            </div>
            <p className="text-xs text-[#7A6158] leading-relaxed">
              Timeless handcrafted crochet creations designed to bring warmth, color, and heartfelt smiles to your everyday moments.
            </p>
            <div className="pt-1">
              <a
                href="https://instagram.com/knot_just_krochet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#6E5049] hover:text-[#3D2C28] bg-[#EFE8DE] hover:bg-[#EAE2D8] px-3 py-1.5 rounded-full transition-all"
              >
                <Instagram className="w-4 h-4 text-[#C13584]" />
                <span>@knot_just_krochet</span>
              </a>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-[#3D2C28] uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/shop')} className="hover:text-[#3D2C28] hover:underline">
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/custom-orders')} className="hover:text-[#3D2C28] hover:underline">
                  Custom Orders & Commissions
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-[#3D2C28] hover:underline">
                  Our Handmade Story
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-[#3D2C28] hover:underline">
                  Contact & Inquiries
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/my-orders')} className="hover:text-[#3D2C28] hover:underline">
                  Track My Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-[#3D2C28] uppercase tracking-wider mb-3">Policies</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/shipping-policy')} className="hover:text-[#3D2C28] hover:underline">
                  Shipping & Delivery Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/refund-policy')} className="hover:text-[#3D2C28] hover:underline">
                  Returns & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-[#3D2C28] hover:underline">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-[#3D2C28] hover:underline">
                  Terms and Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-[#3D2C28] uppercase tracking-wider mb-3">Get in Touch</h4>
            <ul className="space-y-2.5 text-xs text-[#7A6158]">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:underline">
                  {settings.contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
                <span>{settings.contactPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
                <span>Handcrafted in India • Pan-India Shipping</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Required Credit */}
        <div className="mt-12 pt-6 border-t border-[#E5DACD] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B6B61]">
          <p>© {new Date().getFullYear()} Knot Just Krochet. All rights reserved.</p>
          <div className="font-medium text-[#6E5049] flex items-center gap-1.5">
            <span>Built by</span>
            <span className="font-semibold text-[#3D2C28]">ZORVEX by OPG</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
