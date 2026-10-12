import React from 'react';
import { ShoppingBag, Sparkles, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, signInWithGoogle } = useAuth();

  const isOutOfStock = product.stock <= 0;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const effectivePrice = product.discountPrice ?? product.price;
  const inWishlist = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      try {
        await signInWithGoogle();
      } catch {
        return;
      }
    }
    await toggleWishlist(product);
  };

  return (
    <div
      onClick={() => onSelect(product.id)}
      className="group relative bg-[#FFFDF9] rounded-2xl border border-[#EFE8DE] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden cursor-pointer hover:-translate-y-1"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F4EFEA]">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full shadow-xs transition-all z-10 ${
            inWishlist
              ? 'bg-[#F7D6D8] text-[#E8A598] hover:bg-[#F3C7CE]'
              : 'bg-[#FFFDF9]/85 text-[#8B6B61] hover:text-[#E8A598] hover:bg-[#FFFDF9]'
          }`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current text-[#E8A598]' : ''}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {hasDiscount && (
            <span className="bg-[#E8A598] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              SALE
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-[#FFFDF9]/95 text-[#6E5049] text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#E8A598]" /> Featured
            </span>
          )}
        </div>

        {/* Stock tag */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-[#3D2C28]/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-[#FFFDF9] text-[#6E5049] text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
              Sold Out
            </span>
          </div>
        ) : product.stock <= 3 ? (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="bg-[#FFFDF9]/90 text-[#8B5E3C] text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
              Only {product.stock} left
            </span>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[11px] font-medium text-[#8B6B61] uppercase tracking-wider mb-1 line-clamp-1">
          {product.category}
        </span>

        <h3 className="font-medium text-sm text-[#3D2C28] group-hover:text-[#6E5049] transition-colors line-clamp-2 leading-snug mb-2">
          {product.name}
        </h3>

        {/* Color preview tags */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-[#7A6158] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8A598]" />
            <span>{product.colors.length} {product.colors.length === 1 ? 'color' : 'colors'} available</span>
          </div>
        )}

        {/* Price & Action Row */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-[#F4EFEA]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-[#3D2C28]">
              ₹{effectivePrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#9B8780] line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`p-2 rounded-xl transition-all flex items-center justify-center ${
              isOutOfStock
                ? 'bg-[#EFE8DE] text-[#B0A39A] cursor-not-allowed'
                : 'bg-[#F4EFEA] hover:bg-[#6E5049] text-[#6E5049] hover:text-white shadow-xs'
            }`}
            title={isOutOfStock ? 'Sold out' : 'Add to cart'}
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
