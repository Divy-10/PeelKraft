import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from './UserContext';

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

const CART_KEY = 'pk_cart';

const getStoredCart = () => {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(getStoredCart);
  const { isAuthenticated } = useUser();
  const wasAuthenticated = useRef(isAuthenticated);

  // Clear cart on logout
  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      setItems([]);
      localStorage.removeItem(CART_KEY);
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product, selectedPackage = null, quantity = 1) => {
    setItems((prev) => {
      const cartItemId = selectedPackage ? `${product._id}_${selectedPackage._id}` : product._id;
      const existing = prev.find((item) => item._id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item._id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          _id: cartItemId,
          product: product._id,
          name: product.name,
          slug: product.slug,
          image: product.thumbnail?.url || product.gallery?.[0]?.url || '',
          price: selectedPackage ? selectedPackage.sellingPrice : (product.sellingPrice || product.mrp || 0),
          mrp: selectedPackage ? selectedPackage.mrp : (product.mrp || 0),
          stock: selectedPackage ? selectedPackage.stock : (product.stock || 0),
          packageOptionId: selectedPackage ? selectedPackage._id : '',
          packageName: selectedPackage ? selectedPackage.name : '',
          quantity,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item._id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const isInCart = useCallback(
    (productId, packageOptionId = '') => {
      const cartItemId = packageOptionId ? `${productId}_${packageOptionId}` : productId;
      return items.some((item) => item._id === cartItemId || (item.product === productId && item.packageOptionId === packageOptionId));
    },
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
