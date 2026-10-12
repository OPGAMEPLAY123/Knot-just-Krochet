import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  navigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ navigate }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    freeShippingRemaining,
    itemCount
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#3D2C28]/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col border-l border-[#EFE8DE] animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-[#EFE8DE] flex items-center justify-between bg-[#FFFDF9]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#6E5049]" />
              <h2 className="font-serif text-lg font-bold text-[#3D2C28]">
                Your Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-[#7A6158] hover:bg-[#F4EFEA] hover:text-[#3D2C28]"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Tracker */}
          <div className="p-4 bg-[#F4EFEA]/80 border-b border-[#EFE8DE]">
            <div className="flex items-center gap-2 text-xs font-medium text-[#6E5049] mb-1.5">
              <Truck className="w-4 h-4 text-[#E8A598]" />
              {freeShippingRemaining > 0 ? (
                <span>
                  Add <strong className="text-[#3D2C28]">₹{freeShippingRemaining.toLocaleString('en-IN')}</strong> more for FREE shipping!
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold">
                  🎉 You have qualified for FREE Pan-India shipping!
                </span>
              )}
            </div>
            <div className="w-full bg-[#E5DACD] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#E8A598] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(5, ((1499 - freeShippingRemaining) / 1499) * 100))}%`
                }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F4EFEA] flex items-center justify-center text-3xl">
                  🧶
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-semibold text-[#3D2C28]">Your bag is empty</h3>
                  <p className="text-xs text-[#7A6158]">
                    Explore our handcrafted blooms, bags, and gifts to add a touch of warmth.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#6E5049] text-white text-xs font-semibold hover:bg-[#5C433C] transition-all shadow-xs"
                >
                  Explore Shop
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.selectedColor}-${item.selectedVariation}-${idx}`}
                  className="bg-[#FFFDF9] rounded-xl p-3 border border-[#EFE8DE] flex gap-3 shadow-xs"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80'}
                    alt={item.name}
                    className="w-18 h-18 rounded-lg object-cover bg-[#F4EFEA] shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-medium text-[#3D2C28] line-clamp-1">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.selectedColor, item.selectedVariation)}
                          className="text-[#B0A39A] hover:text-red-500 p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {(item.selectedColor || item.selectedVariation) && (
                        <p className="text-[11px] text-[#8B6B61] mt-0.5">
                          {[item.selectedColor, item.selectedVariation].filter(Boolean).join(' • ')}
                        </p>
                      )}

                      {item.customNote && (
                        <p className="text-[10px] text-[#A3897E] italic line-clamp-1 mt-0.5">
                          Note: {item.customNote}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F4EFEA]">
                      <div className="flex items-center border border-[#D8C7B5] rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedColor, item.selectedVariation)}
                          className="px-2 py-0.5 text-xs text-[#6E5049] hover:bg-[#F4EFEA]"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-[#3D2C28] min-w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedColor, item.selectedVariation)}
                          disabled={item.quantity >= item.maxStock}
                          className="px-2 py-0.5 text-xs text-[#6E5049] hover:bg-[#F4EFEA] disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-[#3D2C28]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Actions */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#EFE8DE] bg-[#FFFDF9] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6E5049] font-medium">Subtotal</span>
                <span className="font-bold text-base text-[#3D2C28]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-[#8B6B61]">
                Taxes & calculated shipping finalized at checkout.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 px-4 rounded-xl bg-[#6E5049] hover:bg-[#5C433C] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleViewCart}
                  className="w-full py-2 px-4 rounded-xl bg-[#F4EFEA] hover:bg-[#EFE8DE] text-[#6E5049] text-xs font-semibold transition-all"
                >
                  View Full Cart Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
