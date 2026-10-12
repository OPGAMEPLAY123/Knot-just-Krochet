import React, { useEffect, useState } from 'react';
import { ArrowLeft, Printer, Truck, ShieldCheck, CheckCircle2, Clock, MapPin, ExternalLink } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Order } from '../types';

interface OrderDetailsPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId, navigate }) => {
  const { user, isAdmin } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'orders', orderId));
        if (docSnap.exists()) {
          const data = docSnap.data() as Order;
          // Verify customer boundary
          if (data.userId === user?.uid || isAdmin) {
            setOrder(data);
          } else {
            setError('Unauthorized: You can only view your own orders.');
          }
        } else {
          setError('Order not found.');
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user, isAdmin]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-20 text-center text-xs text-[#8B6B61]">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#3D2C28]">{error || 'Order Not Found'}</h2>
        <button
          onClick={() => navigate('/my-orders')}
          className="px-6 py-2.5 rounded-full bg-[#6E5049] text-white text-xs font-semibold"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  const steps = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE8DE] pb-6">
        <button
          onClick={() => navigate('/my-orders')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E5049] hover:text-[#3D2C28]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFFDF9] hover:bg-[#F4EFEA] border border-[#D8C7B5] text-xs font-semibold text-[#6E5049] shadow-2xs transition-all self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" /> Print Order Receipt
        </button>
      </div>

      {/* Main Order Card */}
      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#EFE8DE] shadow-xs space-y-8 print:border-none print:shadow-none">
        {/* Order Title & Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F4EFEA] pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">
              Order Confirmation
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2C28]">
              #{order.orderId}
            </h1>
            <p className="text-xs text-[#7A6158]">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-xs text-[#8B6B61] block">Payment Status</span>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                order.paymentStatus === 'Paid'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Status Progress Bar */}
        {order.orderStatus !== 'Cancelled' ? (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#3D2C28] uppercase tracking-wider">Order Timeline</h3>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {steps.map((st, i) => {
                const isPassed = currentStepIndex >= i;
                const isCurrent = currentStepIndex === i;
                return (
                  <div key={st} className="space-y-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPassed ? 'bg-[#6E5049]' : 'bg-[#EFE8DE]'
                      }`}
                    />
                    <span
                      className={`block text-[11px] font-semibold ${
                        isCurrent
                          ? 'text-[#6E5049]'
                          : isPassed
                          ? 'text-[#3D2C28]'
                          : 'text-[#B0A39A]'
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-red-50 text-red-800 rounded-2xl text-xs font-medium">
            This order has been cancelled.
          </div>
        )}

        {/* Courier Tracking if available */}
        {order.trackingNumber && (
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DACD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8B5E3C]" />
              <span>
                Courier Partner: <strong>{order.courierPartner || 'Delhivery / India Post'}</strong>
              </span>
            </div>
            <div>
              <span>Tracking Waybill: <strong>{order.trackingNumber}</strong></span>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-[#3D2C28] border-b border-[#F4EFEA] pb-2">
            Items Ordered
          </h3>
          <div className="divide-y divide-[#F4EFEA]">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-[#F4EFEA] shrink-0"
                    />
                  )}
                  <div className="space-y-0.5">
                    <h4 className="font-medium text-xs sm:text-sm text-[#3D2C28]">{item.name}</h4>
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
                    <p className="text-xs text-[#7A6158]">
                      Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <span className="font-bold text-xs sm:text-sm text-[#3D2C28] shrink-0">
                  ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address & Summary Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#F4EFEA]">
          {/* Shipping Address */}
          <div className="space-y-2 text-xs">
            <h4 className="font-serif text-sm font-bold text-[#3D2C28] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#8B5E3C]" /> Shipping Address
            </h4>
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EFE8DE] space-y-1 text-[#7A6158]">
              <p className="font-semibold text-[#3D2C28]">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.houseNumber || order.shippingAddress.houseDetails}</p>
              <p>{order.shippingAddress.street}</p>
              {order.shippingAddress.area && <p>{order.shippingAddress.area}</p>}
              {order.shippingAddress.landmark && <p className="text-[11px] text-[#8B6B61]">Landmark: {order.shippingAddress.landmark}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="pt-1 text-[#3D2C28]">Phone: +91 {order.shippingAddress.phone}</p>
              {order.shippingAddress.deliveryInstructions && (
                <p className="text-[11px] italic pt-1 text-[#8B6B61]">
                  Instructions: {order.shippingAddress.deliveryInstructions}
                </p>
              )}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-3 text-xs text-[#7A6158]">
            <h4 className="font-serif text-sm font-bold text-[#3D2C28]">Payment Details</h4>
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EFE8DE] space-y-2.5">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-medium text-[#3D2C28]">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-medium text-[#3D2C28]">
                  {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E5DACD] flex justify-between items-baseline text-sm">
                <span className="font-bold text-[#3D2C28]">Total Amount</span>
                <span className="text-lg font-bold text-[#3D2C28]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {order.razorpayPaymentId && (
                <div className="pt-2 text-[10px] text-[#8B6B61] border-t border-[#E5DACD]/60 space-y-0.5">
                  <p>Razorpay Ref: {order.razorpayPaymentId}</p>
                  {order.razorpayOrderId && <p>Razorpay Order: {order.razorpayOrderId}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
