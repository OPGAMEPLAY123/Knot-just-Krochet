import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  Sparkles,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Truck,
  ExternalLink,
  Info
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Order, CustomOrderRequest, OrderStatus } from '../types';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { products, categories, settings, addProduct, updateProduct, deleteProduct, updateStoreSettings, seedAllProductsToFirestore } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'custom' | 'settings'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomOrderRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    category: categories[0]?.name || 'Crochet Flowers and Bouquets',
    imagesText: '',
    colorsText: '',
    variationsText: '',
    stock: 10,
    sku: '',
    isActive: true,
    isFeatured: false,
    customizationAvailable: false,
    customizationInstructions: ''
  });

  // Tracking modal state
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [courierPartnerInput, setCourierPartnerInput] = useState('');

  // Status message
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Fetch all orders and custom requests (admin privileged)
  useEffect(() => {
    if (!isAdmin) return;

    const fetchAdminData = async () => {
      setLoadingData(true);
      try {
        // Fetch Orders
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const allOrders = ordersSnap.docs.map((d) => d.data() as Order);
        allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(allOrders);

        // Fetch Custom Requests
        const customSnap = await getDocs(collection(db, 'customOrderRequests'));
        const allCustom = customSnap.docs.map((d) => d.data() as CustomOrderRequest);
        allCustom.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCustomRequests(allCustom);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAdminData();
  }, [isAdmin]);

  if (authLoading) {
    return <div className="py-20 text-center text-xs text-[#8B6B61]">Verifying security credentials...</div>;
  }

  // Strict Authorization Guard
  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto text-2xl">
          🔒
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#3D2C28]">Administrator Access Required</h2>
        <p className="text-xs text-[#7A6158]">
          This dashboard is strictly protected. Please sign in with an authorized administrator Google account (opgstudiosofficial@gmail.com).
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-full bg-[#6E5049] text-white text-xs font-semibold"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.totalAmount : 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing').length;
  const pendingCustomCount = customRequests.filter((r) => r.status === 'Received' || r.status === 'Reviewing').length;

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: 499,
      discountPrice: 0,
      category: categories[0]?.name || 'Crochet Flowers and Bouquets',
      imagesText: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
      colorsText: 'Blush Pink, Cream, Sage Green',
      variationsText: '',
      stock: 10,
      sku: `KJK-NEW-${Math.floor(100 + Math.random() * 900)}`,
      isActive: true,
      isFeatured: false,
      customizationAvailable: false,
      customizationInstructions: ''
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice || 0,
      category: p.category,
      imagesText: p.images.join('\n'),
      colorsText: p.colors.join(', '),
      variationsText: p.variations?.join(', ') || '',
      stock: p.stock,
      sku: p.sku,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      customizationAvailable: p.customizationAvailable,
      customizationInstructions: p.customizationInstructions || ''
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = productForm.imagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const colors = productForm.colorsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const variations = productForm.variationsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: productForm.name,
          description: productForm.description,
          price: Number(productForm.price),
          discountPrice: Number(productForm.discountPrice) || undefined,
          category: productForm.category,
          images: images.length > 0 ? images : editingProduct.images,
          colors,
          variations,
          stock: Number(productForm.stock),
          sku: productForm.sku,
          isActive: productForm.isActive,
          isFeatured: productForm.isFeatured,
          customizationAvailable: productForm.customizationAvailable,
          customizationInstructions: productForm.customizationInstructions
        });
        setActionNotice('Product updated successfully!');
      } else {
        await addProduct({
          name: productForm.name,
          description: productForm.description,
          price: Number(productForm.price),
          discountPrice: Number(productForm.discountPrice) || undefined,
          category: productForm.category,
          images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80'],
          colors,
          variations,
          stock: Number(productForm.stock),
          sku: productForm.sku,
          isActive: productForm.isActive,
          isFeatured: productForm.isFeatured,
          customizationAvailable: productForm.customizationAvailable,
          customizationInstructions: productForm.customizationInstructions
        });
        setActionNotice('New product added to catalogue!');
      }
      setIsProductModalOpen(false);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      setActionNotice('Product removed.');
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: newStatus,
        updatedAt: new Date().toISOString()
      });
      const targetOrder = orders.find((o) => o.orderId === orderId);
      if (targetOrder) {
        fetch('/api/emails/status-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: targetOrder, newStatus })
        }).catch(console.error);
      }

      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      setActionNotice(`Order #${orderId} marked as ${newStatus}`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForTracking) return;

    try {
      await updateDoc(doc(db, 'orders', selectedOrderForTracking.orderId), {
        trackingNumber: trackingNumberInput.trim(),
        courierPartner: courierPartnerInput.trim(),
        orderStatus: 'Shipped',
        updatedAt: new Date().toISOString()
      });

      fetch('/api/emails/status-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            ...selectedOrderForTracking,
            trackingNumber: trackingNumberInput.trim(),
            courierPartner: courierPartnerInput.trim(),
            orderStatus: 'Shipped'
          },
          newStatus: 'Shipped'
        })
      }).catch(console.error);

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === selectedOrderForTracking.orderId
            ? {
                ...o,
                trackingNumber: trackingNumberInput.trim(),
                courierPartner: courierPartnerInput.trim(),
                orderStatus: 'Shipped'
              }
            : o
        )
      );
      setSelectedOrderForTracking(null);
      setActionNotice('Tracking details saved and order marked as Shipped!');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${selectedOrderForTracking.orderId}`);
    }
  };

  const handleUpdateCustomStatus = async (requestId: string, status: any, quotedPrice?: number) => {
    try {
      const updates: any = {
        status,
        updatedAt: new Date().toISOString()
      };
      if (quotedPrice !== undefined) updates.quotedPrice = quotedPrice;

      await updateDoc(doc(db, 'customOrderRequests', requestId), updates);
      setCustomRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, ...updates } : r))
      );
      setActionNotice(`Custom request updated to ${status}`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `customOrderRequests/${requestId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Admin Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE8DE] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#6E5049] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E8A598]" /> Knot Just Krochet Admin
            </span>
            <span className="text-xs text-[#8B6B61]">{user.email}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#3D2C28]">
            Store Operations Dashboard
          </h1>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-full border border-[#D8C7B5] hover:bg-[#F4EFEA] text-xs font-semibold text-[#6E5049] self-start sm:self-auto"
        >
          View Live Website
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EFE8DE] overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'overview' ? 'bg-[#6E5049] text-white' : 'text-[#6E5049] hover:bg-[#F4EFEA]'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'products' ? 'bg-[#6E5049] text-white' : 'text-[#6E5049] hover:bg-[#F4EFEA]'
          }`}
        >
          Catalogue Management ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'orders' ? 'bg-[#6E5049] text-white' : 'text-[#6E5049] hover:bg-[#F4EFEA]'
          }`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'custom' ? 'bg-[#6E5049] text-white' : 'text-[#6E5049] hover:bg-[#F4EFEA]'
          }`}
        >
          Custom Inquiries ({customRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'settings' ? 'bg-[#6E5049] text-white' : 'text-[#6E5049] hover:bg-[#F4EFEA]'
          }`}
        >
          Store Settings
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#EFE8DE] shadow-xs space-y-2">
              <span className="text-[11px] font-semibold text-[#8B6B61] uppercase tracking-wider">Total Sales</span>
              <p className="font-serif text-2xl font-bold text-[#3D2C28]">₹{totalRevenue.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-[#A3897E]">Verified paid orders</p>
            </div>

            <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#EFE8DE] shadow-xs space-y-2">
              <span className="text-[11px] font-semibold text-[#8B6B61] uppercase tracking-wider">Active Products</span>
              <p className="font-serif text-2xl font-bold text-[#3D2C28]">{products.filter((p) => p.isActive).length}</p>
              <p className="text-[10px] text-[#A3897E]">Available in customer store</p>
            </div>

            <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#EFE8DE] shadow-xs space-y-2">
              <span className="text-[11px] font-semibold text-[#8B6B61] uppercase tracking-wider">Pending Orders</span>
              <p className="font-serif text-2xl font-bold text-[#3D2C28]">{pendingOrdersCount}</p>
              <p className="text-[10px] text-[#A3897E]">Requiring packing / dispatch</p>
            </div>

            <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#EFE8DE] shadow-xs space-y-2">
              <span className="text-[11px] font-semibold text-[#8B6B61] uppercase tracking-wider">Custom Requests</span>
              <p className="font-serif text-2xl font-bold text-[#3D2C28]">{pendingCustomCount}</p>
              <p className="text-[10px] text-[#A3897E]">Awaiting quote review</p>
            </div>
          </div>

          {/* Quick Notice on Razorpay & Firebase */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E5DACD] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#3D2C28]">
              <Info className="w-4 h-4 text-[#8B5E3C]" />
              <span>Production Integration Status</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#7A6158]">
              <div className="bg-white p-4 rounded-xl border border-[#EFE8DE] space-y-1">
                <p className="font-semibold text-[#3D2C28]">🔥 Firebase Firestore & Auth</p>
                <p className="text-emerald-700 font-medium">✓ Provisioned (knotjustkrochetopg)</p>
                <p className="text-[11px] text-[#8B6B61]">Security rules active and deployed.</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#EFE8DE] space-y-1">
                <p className="font-semibold text-[#3D2C28]">💳 Razorpay Payments</p>
                <p className="text-amber-800 font-medium">Ready for Merchant Keys</p>
                <p className="text-[11px] text-[#8B6B61]">
                  Configure RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in server env for live payment collection.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#3D2C28]">
              Manage Product Catalogue
            </h2>
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 rounded-full bg-[#6E5049] hover:bg-[#5C433C] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE8DE] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#6E5049] border-b border-[#EFE8DE] font-semibold">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFEA]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF7F2]/50">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=100&q=80'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-[#F4EFEA]"
                        />
                        <div>
                          <p className="font-semibold text-[#3D2C28]">{p.name}</p>
                          <p className="text-[10px] text-[#8B6B61]">SKU: {p.sku}</p>
                        </div>
                      </td>
                      <td className="p-3.5 text-[#7A6158]">{p.category}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-[#3D2C28]">₹{p.price.toLocaleString('en-IN')}</span>
                        {p.discountPrice && (
                          <span className="block text-[10px] text-emerald-700">Sale: ₹{p.discountPrice}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`font-semibold ${p.stock <= 3 ? 'text-amber-700' : 'text-[#3D2C28]'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-1.5 text-[#6E5049] hover:bg-[#F4EFEA] rounded-lg"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="font-serif text-xl font-bold text-[#3D2C28]">
            Customer Orders
          </h2>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-[#FFFDF9] rounded-2xl p-10 text-center border border-[#EFE8DE] text-xs text-[#8B6B61]">
                No orders placed yet.
              </div>
            ) : (
              orders.map((o) => (
                <div
                  key={o.orderId}
                  className="bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 border border-[#EFE8DE] shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4EFEA] pb-3">
                    <div>
                      <p className="font-serif font-bold text-base text-[#3D2C28]">#{o.orderId}</p>
                      <p className="text-xs text-[#7A6158]">
                        Customer: <strong>{o.customerName}</strong> ({o.customerEmail}) • Phone: +91 {o.customerPhone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(o.orderId, e.target.value as any)}
                        className="py-1 px-2.5 text-xs font-semibold bg-[#FAF7F2] border border-[#D8C7B5] rounded-xl text-[#3D2C28]"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing (In Stitches)</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <button
                        onClick={() => {
                          setSelectedOrderForTracking(o);
                          setTrackingNumberInput(o.trackingNumber || '');
                          setCourierPartnerInput(o.courierPartner || 'India Post');
                        }}
                        className="p-1.5 rounded-lg border border-[#D8C7B5] text-[#6E5049] hover:bg-[#F4EFEA]"
                        title="Add Courier Tracking"
                      >
                        <Truck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Delivery address */}
                  <div className="text-xs text-[#7A6158] bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE8DE]">
                    <p className="font-semibold text-[#3D2C28]">Delivery Address:</p>
                    <p>{o.shippingAddress.houseDetails}, {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.pincode}</p>
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-[#3D2C28]">
                        <span>{item.quantity}× {item.name} {item.selectedColor ? `(${item.selectedColor})` : ''}</span>
                        <span className="font-medium">₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-[#F4EFEA] flex justify-between font-bold text-xs text-[#3D2C28]">
                      <span>Total Amount Paid</span>
                      <span>₹{o.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOM INQUIRIES */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <h2 className="font-serif text-xl font-bold text-[#3D2C28]">
            Personalized Crochet Inquiries
          </h2>

          <div className="space-y-4">
            {customRequests.length === 0 ? (
              <div className="bg-[#FFFDF9] rounded-2xl p-10 text-center border border-[#EFE8DE] text-xs text-[#8B6B61]">
                No custom commission requests yet.
              </div>
            ) : (
              customRequests.map((r) => (
                <div key={r.id} className="bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 border border-[#EFE8DE] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4EFEA] pb-3">
                    <div>
                      <p className="font-serif font-bold text-base text-[#3D2C28]">Request #{r.id}</p>
                      <p className="text-xs text-[#7A6158]">
                        From: <strong>{r.customerName}</strong> • WhatsApp: +91 {r.customerPhone} ({r.customerEmail})
                      </p>
                    </div>

                    <select
                      value={r.status}
                      onChange={(e) => handleUpdateCustomStatus(r.id, e.target.value)}
                      className="py-1 px-2.5 text-xs font-semibold bg-[#FAF7F2] border border-[#D8C7B5] rounded-xl text-[#3D2C28]"
                    >
                      <option value="Received">Received</option>
                      <option value="Reviewing">Reviewing</option>
                      <option value="Quote Sent">Quote Sent</option>
                      <option value="Accepted">Accepted</option>
                      <option value="In Production">In Production</option>
                      <option value="Completed">Completed</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </div>

                  <div className="space-y-2 text-xs text-[#7A6158]">
                    <p><strong>Idea:</strong> {r.productIdea}</p>
                    {r.preferredColors && <p><strong>Preferred Colors:</strong> {r.preferredColors}</p>}
                    {r.approximateSize && <p><strong>Dimensions:</strong> {r.approximateSize}</p>}
                    <p><strong>Quantity:</strong> {r.quantity}</p>
                    {r.requiredByDate && <p><strong>Needed By:</strong> {r.requiredByDate}</p>}
                    {r.referenceImageUrl && (
                      <p>
                        <strong>Reference Image:</strong>{' '}
                        <a
                          href={r.referenceImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#6E5049] underline inline-flex items-center gap-1"
                        >
                          View Image Link <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#EFE8DE] shadow-xs space-y-6 max-w-2xl">
          <h2 className="font-serif text-xl font-bold text-[#3D2C28]">
            Store Policies & Settings
          </h2>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#3D2C28]">Store Header Announcement</label>
              <input
                type="text"
                defaultValue={settings.announcement}
                onBlur={(e) => updateStoreSettings({ announcement: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Standard Shipping Fee (₹)</label>
                <input
                  type="number"
                  defaultValue={settings.standardShippingFee}
                  onBlur={(e) => updateStoreSettings({ standardShippingFee: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Free Shipping Minimum (₹)</label>
                <input
                  type="number"
                  defaultValue={settings.freeShippingThreshold}
                  onBlur={(e) => updateStoreSettings({ freeShippingThreshold: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#3D2C28]">Contact Phone / WhatsApp</label>
              <input
                type="text"
                defaultValue={settings.contactPhone}
                onBlur={(e) => updateStoreSettings({ contactPhone: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3D2C28]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-[#EFE8DE] shadow-2xl space-y-5 animate-in zoom-in-95">
            <h3 className="font-serif text-xl font-bold text-[#3D2C28]">
              {editingProduct ? 'Edit Product' : 'Add New Crochet Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#3D2C28]">Regular Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#3D2C28]">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#3D2C28]">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#3D2C28]">Inventory Stock *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Image URLs (one per line) *</label>
                <textarea
                  rows={2}
                  required
                  value={productForm.imagesText}
                  onChange={(e) => setProductForm({ ...productForm, imagesText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#3D2C28]">Colors (comma separated)</label>
                  <input
                    type="text"
                    value={productForm.colorsText}
                    onChange={(e) => setProductForm({ ...productForm, colorsText: e.target.value })}
                    placeholder="Pink, Cream, Sage"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#3D2C28]">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isActive}
                    onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#6E5049] accent-[#6E5049]"
                  />
                  <span>Active in Store</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-[#6E5049] accent-[#6E5049]"
                  />
                  <span>Featured on Home</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F4EFEA]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-[#D8C7B5] hover:bg-[#F4EFEA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#6E5049] hover:bg-[#5C433C] text-white font-semibold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 bg-[#3D2C28]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full p-6 border border-[#EFE8DE] shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#3D2C28]">
              Dispatch Tracking for #{selectedOrderForTracking.orderId}
            </h3>

            <form onSubmit={handleSaveTracking} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Courier Partner</label>
                <input
                  type="text"
                  required
                  value={courierPartnerInput}
                  onChange={(e) => setCourierPartnerInput(e.target.value)}
                  placeholder="e.g. Blue Dart, Delhivery, India Post Speed Post"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3D2C28]">Tracking Waybill / AWB Number</label>
                <input
                  type="text"
                  required
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. 1248590123"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F4EFEA]">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForTracking(null)}
                  className="px-4 py-2 rounded-full border border-[#D8C7B5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#6E5049] text-white font-semibold"
                >
                  Mark as Shipped
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
