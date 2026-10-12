export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in INR
  discountPrice?: number; // optional discounted price in INR
  category: string;
  images: string[];
  colors: string[];
  variations?: string[];
  stock: number;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  customizationAvailable: boolean;
  customizationInstructions?: string;
  material?: string;
  careInstructions?: string;
  dimensions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  order: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number; // current price in INR
  image: string;
  selectedColor?: string;
  selectedVariation?: string;
  customNote?: string;
  quantity: number;
  maxStock: number;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productPrice: number;
  productDiscountPrice?: number;
  productImage: string;
  productCategory: string;
  createdAt: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  houseDetails?: string; // backward compat
  houseNumber: string;
  street: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  deliveryInstructions?: string;
}

export type OrderStatus = 
  | 'Payment Pending'
  | 'Payment Failed'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Refunded';

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  selectedColor?: string;
  selectedVariation?: string;
  customNote?: string;
  image?: string;
}

export interface Order {
  id: string;
  orderId: string; // e.g. KJK-2026-1042
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  trackingNumber?: string;
  courierPartner?: string;
  deliveryInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomOrderStatus = 
  | 'Received'
  | 'Reviewing'
  | 'Quote Sent'
  | 'Accepted'
  | 'In Production'
  | 'Completed'
  | 'Declined';

export interface CustomOrderRequest {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productIdea: string;
  preferredColors: string;
  approximateSize: string;
  quantity: number;
  requiredByDate?: string;
  referenceImageUrl?: string;
  additionalNotes?: string;
  status: CustomOrderStatus;
  quotedPrice?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  houseNumber?: string;
  street?: string;
  area?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string; // legacy fallback
  locality?: string; // legacy fallback
  deliveryDetailsCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  announcement: string;
  contactEmail: string;
  contactPhone: string;
  instagramHandle: string;
  standardShippingFee: number;
  freeShippingThreshold: number;
  updatedAt?: string;
}
