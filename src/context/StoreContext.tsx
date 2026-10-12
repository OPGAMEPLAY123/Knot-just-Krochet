import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Category, StoreSettings } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_STORE_SETTINGS } from '../data/initialData';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  loading: boolean;
  refreshStoreData: () => Promise<void>;
  seedAllProductsToFirestore: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<string>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  // Automatically seed and write all initial products & categories to Firestore
  const seedAllProductsToFirestore = async () => {
    try {
      console.log('Syncing all catalogue products and categories to Firestore...');
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod, { merge: true });
      }
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
      }
      await setDoc(doc(db, 'storeSettings', 'main'), INITIAL_STORE_SETTINGS, { merge: true });
      console.log('Successfully synced all items into Firestore!');
    } catch (err) {
      console.warn('Seeding notice (might require authentication):', err);
    }
  };

  const fetchStoreData = async () => {
    try {
      // 1. Fetch Products from Firestore
      let loadedProducts: Product[] = [];
      try {
        const prodSnap = await getDocs(collection(db, 'products'));
        if (!prodSnap.empty) {
          loadedProducts = prodSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
        } else {
          // If Firestore is empty, seed everything to Firestore
          await seedAllProductsToFirestore();
          const retrySnap = await getDocs(collection(db, 'products'));
          if (!retrySnap.empty) {
            loadedProducts = retrySnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
          }
        }
      } catch (err) {
        console.warn('Using initial product catalogue as fallback', err);
      }

      if (loadedProducts.length > 0) {
        setProducts(loadedProducts);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }

      // 2. Fetch Categories from Firestore
      let loadedCategories: Category[] = [];
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        if (!catSnap.empty) {
          loadedCategories = catSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }));
        } else {
          for (const cat of INITIAL_CATEGORIES) {
            await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
          }
          loadedCategories = INITIAL_CATEGORIES;
        }
      } catch (err) {
        console.warn('Using initial categories as fallback', err);
      }

      if (loadedCategories.length > 0) {
        setCategories(loadedCategories);
      } else {
        setCategories(INITIAL_CATEGORIES);
      }

      // 3. Fetch Settings
      try {
        const settingsSnap = await getDocs(collection(db, 'storeSettings'));
        if (!settingsSnap.empty) {
          const settingData = settingsSnap.docs[0].data() as StoreSettings;
          setSettings(settingData);
        }
      } catch (err) {
        console.warn('Using initial settings as fallback', err);
      }
    } catch (err) {
      console.error('Error fetching store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `kjk_${Date.now()}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id,
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'products', id), newProduct);
      setProducts((prev) => [newProduct, ...prev]);
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${id}`);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();
    try {
      await setDoc(doc(db, 'products', id), { ...updates, updatedAt: now }, { merge: true });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now } : p))
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      throw err;
    }
  };

  const updateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = {
      ...settings,
      ...newSettings,
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'storeSettings', 'main'), updated, { merge: true });
      setSettings(updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'storeSettings/main');
      throw err;
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id'>): Promise<string> => {
    const id = categoryData.slug || `cat_${Date.now()}`;
    const newCat: Category = {
      ...categoryData,
      id
    };
    try {
      await setDoc(doc(db, 'categories', id), newCat);
      setCategories((prev) => [...prev, newCat]);
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${id}`);
      throw err;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        settings,
        loading,
        refreshStoreData: fetchStoreData,
        seedAllProductsToFirestore,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStoreSettings,
        addCategory
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
