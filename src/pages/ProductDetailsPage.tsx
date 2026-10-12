import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailsPageProps {
  productId: string;
  navigate: (path: string) => void;
  onSelectProduct: (id: string) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  productId,
  navigate,
  onSelectProduct
}) => {
  const { products } = useStore();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, signInWithGoogle } = useAuth();

  const product = products.find((p) => p.id === productId);

  // States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(
    product?.colors && product.colors.length > 0 ? product.colors[0] : ''
  );
  const [selectedVariation, setSelectedVariation] = useState<string>(
    product?.variations && product.variations.length > 0 ? product.variations[0] : ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [customNote, setCustomNote] = useState<string>('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F4EFEA] flex items-center justify-center mx-auto text-3xl">
          🧶
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#3D2C28]">Product not found</h2>
        <p className="text-sm text-[#7A6158]">This crochet item may have been moved or is no longer listed.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-full bg-[#6E5049] text-white text-xs font-semibold hover:bg-[#5C433C]"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const effectivePrice = product.discountPrice ?? product.price;

  // Related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id && p.isActive)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedColor, selectedVariation, customNote);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedColor, selectedVariation, customNote);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#8B6B61]">
        <button onClick={() => navigate('/')} className="hover:text-[#3D2C28] flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Home
        </button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate('/shop')} className="hover:text-[#3D2C28]">
          Shop
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#6E5049] font-medium line-clamp-1">{product.name}</span>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Selected Image */}
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-[#F4EFEA] border border-[#EFE8DE] shadow-xs relative">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-[#E8A598] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                SALE
              </span>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-[#3D2C28]/40 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-[#FFFDF9] text-[#6E5049] text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-md">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-[#F4EFEA] ${
                    selectedImageIndex === idx
                      ? 'border-[#6E5049] shadow-xs scale-95'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Order Form */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-xs text-[#B0A39A]">•</span>
              <span className="text-xs text-[#8B6B61]">SKU: {product.sku}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2C28] leading-snug">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-[#3D2C28]">
                ₹{effectivePrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-[#9B8780] line-through">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Save ₹{(product.price - (product.discountPrice || 0)).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOutOfStock ? 'bg-red-500' : product.stock <= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              <span className="text-xs font-medium text-[#6E5049]">
                {isOutOfStock
                  ? 'Currently out of stock'
                  : product.stock <= 3
                  ? `Only ${product.stock} left in stock — order soon`
                  : `In stock (${product.stock} available)`}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#7A6158] leading-relaxed">
            {product.description}
          </p>

          {/* Options: Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#EFE8DE]">
              <label className="block text-xs font-bold text-[#3D2C28] uppercase tracking-wider">
                Select Color: <span className="font-normal text-[#6E5049]">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedColor === color
                        ? 'bg-[#6E5049] text-white shadow-xs'
                        : 'bg-[#FFFDF9] text-[#6E5049] border border-[#D8C7B5] hover:bg-[#F4EFEA]'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Options: Variation Selection */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-[#3D2C28] uppercase tracking-wider">
                Select Variation: <span className="font-normal text-[#6E5049]">{selectedVariation}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariation(v)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedVariation === v
                        ? 'bg-[#6E5049] text-white shadow-xs'
                        : 'bg-[#FFFDF9] text-[#6E5049] border border-[#D8C7B5] hover:bg-[#F4EFEA]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customization instructions note (if supported) */}
          {product.customizationAvailable && (
            <div className="p-3.5 bg-[#FFFDF9] rounded-2xl border border-[#E8A598]/50 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#6E5049]">
                <Sparkles className="w-3.5 h-3.5 text-[#E8A598]" />
                <span>Customization Available</span>
              </div>
              {product.customizationInstructions && (
                <p className="text-[11px] text-[#7A6158]">
                  {product.customizationInstructions}
                </p>
              )}
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Optional: Enter initial, gift message, or custom note..."
                className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-[#3D2C28] placeholder-[#9B8780] focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
              />
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs font-bold text-[#3D2C28] uppercase tracking-wider">Quantity:</span>
            <div className="flex items-center border border-[#D8C7B5] rounded-xl bg-white overflow-hidden shadow-2xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock || quantity <= 1}
                className="px-3 py-1.5 text-sm text-[#6E5049] hover:bg-[#F4EFEA] disabled:opacity-30"
              >
                -
              </button>
              <span className="px-4 text-xs font-bold text-[#3D2C28] min-w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={isOutOfStock || quantity >= product.stock}
                className="px-3 py-1.5 text-sm text-[#6E5049] hover:bg-[#F4EFEA] disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-all ${
                isOutOfStock
                  ? 'bg-[#EFE8DE] text-[#A89A90] cursor-not-allowed'
                  : 'bg-[#6E5049] hover:bg-[#5C433C] text-white hover:shadow-md'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? 'Sold Out' : addedAnimation ? 'Added to Bag! ✨' : 'Add to Bag'}</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`py-3 px-4 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border transition-all ${
                  isOutOfStock
                    ? 'bg-transparent text-[#A89A90] border-[#EFE8DE] cursor-not-allowed'
                    : 'bg-[#FFFDF9] hover:bg-[#F4EFEA] text-[#3D2C28] border-[#D8C7B5]'
                }`}
              >
                <span>Buy Now with 1-Click</span>
              </button>

              <button
                onClick={async () => {
                  if (!user) {
                    try {
                      await signInWithGoogle();
                    } catch {
                      return;
                    }
                  }
                  await toggleWishlist(product);
                }}
                className={`py-3 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  isInWishlist(product.id)
                    ? 'bg-[#F7D6D8] border-[#E8A598] text-[#8B5E3C]'
                    : 'bg-[#FFFDF9] border-[#D8C7B5] hover:bg-[#F4EFEA] text-[#6E5049]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current text-[#E8A598]' : ''}`} />
                <span>{isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>
          </div>

          {/* Genuine Policies & Specifications Accordion */}
          <div className="space-y-3 pt-4 border-t border-[#EFE8DE] text-xs text-[#7A6158]">
            {product.material && (
              <div className="flex items-start gap-2.5">
                <span className="font-semibold text-[#3D2C28] shrink-0">Materials:</span>
                <span>{product.material}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex items-start gap-2.5">
                <span className="font-semibold text-[#3D2C28] shrink-0">Dimensions:</span>
                <span>{product.dimensions}</span>
              </div>
            )}
            {product.careInstructions && (
              <div className="flex items-start gap-2.5">
                <span className="font-semibold text-[#3D2C28] shrink-0">Care:</span>
                <span>{product.careInstructions}</span>
              </div>
            )}

            {/* Delivery & Dispatch Note */}
            <div className="pt-2 border-t border-[#F4EFEA] space-y-1.5 text-[11px] text-[#8B6B61]">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#8B5E3C]" />
                <span>Handmade with care • Dispatches within 3-5 business days across India</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-[#8B5E3C]" />
                <span>Transit damage protection: unboxing video required for replacement within 7 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-[#EFE8DE] space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#3D2C28]">
              More from {product.category}
            </h2>
            <p className="text-xs text-[#7A6158]">Handcrafted creations you might also adore</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
