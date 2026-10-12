import React, { useEffect, useState } from 'react';
import { Package, Clock, ArrowRight, ArrowLeft, AlertCircle, ShoppingBag } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Order } from '../types';

interface MyOrdersPageProps {
  navigate: (path: string) => void;
  onSelectOrder: (orderId: string) => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ navigate, onSelectOrder }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const userOrders: Order[] = snap.docs.map((d) => d.data() as Order);
        // Sort newest first
        userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(userOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#3D2C28]">Sign in to view orders</h2>
        <p className="text-xs text-[#7A6158]">Please authenticate with Google to view your order history.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-full bg-[#6E5049] text-white text-xs font-semibold"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Confirmed</span>;
      case 'Processing':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">In Stitches (Processing)</span>;
      case 'Shipped':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Shipped</span>;
      case 'Delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">Delivered 🎉</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="flex items-center justify-between border-b border-[#EFE8DE] pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#3D2C28]">
            My Orders
          </h1>
          <p className="text-xs text-[#7A6158]">
            Track status, view product snapshots, and delivery timelines.
          </p>
        </div>
        <button
          onClick={() => navigate('/account')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E5049] hover:text-[#3D2C28]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> My Account
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#8B6B61]">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-[#FFFDF9] rounded-3xl p-12 text-center border border-[#EFE8DE] space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#F4EFEA] flex items-center justify-center mx-auto text-3xl">
            📦
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#3D2C28]">No orders yet</h3>
            <p className="text-xs text-[#7A6158]">
              You haven't placed any orders with Knot Just Krochet yet. When you do, they will appear here!
            </p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2.5 rounded-full bg-[#6E5049] text-white text-xs font-semibold hover:bg-[#5C433C] transition-all shadow-xs"
          >
            Explore Catalogue
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderId}
              onClick={() => onSelectOrder(order.orderId)}
              className="bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 border border-[#EFE8DE] shadow-xs hover:shadow-md transition-all cursor-pointer space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4EFEA] pb-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-[#8B6B61] uppercase tracking-wider font-semibold">
                    Order #{order.orderId}
                  </span>
                  <p className="text-xs text-[#7A6158]">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.orderStatus)}
                  <span className="font-serif font-bold text-base text-[#3D2C28]">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Items Thumbnail Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#FAF7F2] p-1.5 rounded-xl border border-[#EFE8DE] shrink-0">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div className="text-left pr-2">
                        <p className="text-xs font-medium text-[#3D2C28] line-clamp-1 max-w-36">{item.name}</p>
                        <p className="text-[10px] text-[#8B6B61]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-xs text-[#8B6B61] font-medium shrink-0">
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-[#8B5E3C] shrink-0">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {order.trackingNumber && (
                <div className="text-[11px] text-[#6E5049] bg-[#F4EFEA] px-3 py-1.5 rounded-lg flex items-center justify-between">
                  <span>Courier: {order.courierPartner || 'India Post / BlueDart'}</span>
                  <span>Tracking: <strong>{order.trackingNumber}</strong></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
