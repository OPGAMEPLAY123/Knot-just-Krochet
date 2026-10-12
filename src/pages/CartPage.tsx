import React from 'react';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartPageProps {
  navigate: (path: string) => void;
  onSelectProduct: (productId: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate, onSelectProduct }) => {
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    totalAmount,
    freeShippingRemaining,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#F4EFEA] flex items-center justify-center mx-auto text-4xl shadow-inner">
          🧶
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-[#3D2C28]">Your Shopping Bag is Empty</h1>
          <p className="text-sm text-[#7A6158] max-w-md mx-auto">
            You haven't added any handcrafted crochet items to your cart yet. Explore our bouquets, bags, and gifts!
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/shop')}
            className="px-8 py-3.5 rounded-full bg-[#6E5049] hover:bg-[#5C433C] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
          >
            Explore the Catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE8DE] pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#3D2C28]">
            Shopping Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-[#7A6158] mt-1">Review your selections before proceeding to checkout.</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-[#9B8780] hover:text-red-600 transition-colors self-start sm:self-auto font-medium"
        >
          Clear entire bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert */}
          <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#EFE8DE] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-medium text-[#6E5049] mb-2">
              <Truck className="w-4 h-4 text-[#E8A598]" />
              {freeShippingRemaining > 0 ? (
                <span>
                  Add <strong className="text-[#3D2C28]">₹{freeShippingRemaining.toLocaleString('en-IN')}</strong> more for <strong>FREE Pan-India delivery</strong>!
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold">
                  🎉 Congratulations! Your order qualifies for FREE shipping!
                </span>
              )}
            </div>
            <div className="w-full bg-[#F4EFEA] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#E8A598] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(5, ((1499 - freeShippingRemaining) / 1499) * 100))}%`
                }}
              />
            </div>
          </div>

          {/* Table / List */}
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE8DE] shadow-xs divide-y divide-[#F4EFEA] overflow-hidden">
            {items.map((item, idx) => (
              <div
                key={`${item.productId}-${item.selectedColor}-${item.selectedVariation}-${idx}`}
                className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={item.image}
                    alt={item.name}
                    onClick={() => onSelectProduct(item.productId)}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-[#F4EFEA] shrink-0 cursor-pointer hover:opacity-90"
                  />
                  <div className="space-y-1">
                    <h3
                      onClick={() => onSelectProduct(item.productId)}
                      className="font-medium text-sm text-[#3D2C28] hover:text-[#6E5049] cursor-pointer"
                    >
                      {item.name}
                    </h3>
                    {(item.selectedColor || item.selectedVariation) && (
                      <p className="text-xs text-[#8B6B61]">
                        {[item.selectedColor, item.selectedVariation].filter(Boolean).join(' • ')}
                      </p>
                    )}
                    {item.customNote && (
                      <p className="text-[11px] text-[#A3897E] italic">
                        Custom Note: {item.customNote}
                      </p>
                    )}
                    <p className="text-xs font-semibold text-[#3D2C28] sm:hidden">
                      ₹{item.price.toLocaleString('en-IN')} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-[#F4EFEA]">
                  <span className="hidden sm:inline text-xs text-[#8B6B61] w-20 text-right">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>

                  {/* Quantity */}
                  <div className="flex items-center border border-[#D8C7B5] rounded-xl bg-white overflow-hidden shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedColor, item.selectedVariation)}
                      className="px-2.5 py-1 text-xs text-[#6E5049] hover:bg-[#F4EFEA]"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-semibold text-[#3D2C28] min-w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedColor, item.selectedVariation)}
                      disabled={item.quantity >= item.maxStock}
                      className="px-2.5 py-1 text-xs text-[#6E5049] hover:bg-[#F4EFEA] disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-bold text-[#3D2C28] w-24 text-right">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.productId, item.selectedColor, item.selectedVariation)}
                    className="p-1.5 text-[#B0A39A] hover:text-red-600 rounded-lg"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E5049] hover:text-[#3D2C28]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </button>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 bg-[#FFFDF9] rounded-3xl p-6 border border-[#EFE8DE] shadow-xs space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#3D2C28] border-b border-[#F4EFEA] pb-3">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs text-[#7A6158]">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-[#3D2C28]">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Shipping & Handling</span>
              <span className="font-semibold">
                {shippingFee === 0 ? (
                  <span className="text-emerald-700 font-bold uppercase tracking-wide">FREE</span>
                ) : (
                  <span className="text-[#3D2C28]">₹{shippingFee}</span>
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-[#F4EFEA] flex justify-between items-baseline text-sm">
              <span className="font-bold text-[#3D2C28]">Total Payable</span>
              <span className="text-xl font-bold text-[#3D2C28]">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 px-6 rounded-full bg-[#6E5049] hover:bg-[#5C433C] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-2 text-[11px] text-[#8B6B61] pt-2 border-t border-[#F4EFEA]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span>Razorpay Secured 256-bit Encrypted Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">🧵</span>
              <span>100% Handcrafted • Dispatch in 3-5 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
