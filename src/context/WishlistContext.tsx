import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, WishlistItem } from '../types';

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'wishlist'));
        const items = snap.docs.map((d) => d.data() as WishlistItem);
        setWishlist(items);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item.productId === productId);
  };

  const toggleWishlist = async (product: Product) => {
    if (!user) return;

    const alreadyIn = isInWishlist(product.id);
    const itemDocRef = doc(db, 'users', user.uid, 'wishlist', product.id);

    if (alreadyIn) {
      try {
        await deleteDoc(itemDocRef);
        setWishlist((prev) => prev.filter((i) => i.productId !== product.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/wishlist/${product.id}`);
      }
    } else {
      const newItem: WishlistItem = {
        id: product.id,
        userId: user.uid,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productDiscountPrice: product.discountPrice,
        productImage: product.images[0] || '',
        productCategory: product.category,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(itemDocRef, newItem);
        setWishlist((prev) => [newItem, ...prev]);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/wishlist/${product.id}`);
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'wishlist', productId));
      setWishlist((prev) => prev.filter((i) => i.productId !== productId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/wishlist/${productId}`);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
