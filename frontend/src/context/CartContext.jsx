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
    const maxStock = selectedPackage ? (selectedPackage.stock ?? 0) : (product.stock ?? 0);
    const trackInventory = product.trackInventory !== false;

    setItems((prev) => {
      const cartItemId = selectedPackage ? `${product._id}_${selectedPackage._id}` : product._id;
      const existing = prev.find((item) => item._id === cartItemId);
      if (existing) {
        return prev.map((item) => {
          if (item._id === cartItemId) {
            const newQty = trackInventory ? Math.min(maxStock, item.quantity + quantity) : item.quantity + quantity;
            return { ...item, quantity: newQty };
          }
          return item;
        });
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
          stock: maxStock,
          packageOptionId: selectedPackage ? selectedPackage._id : '',
          packageName: selectedPackage ? selectedPackage.name : '',
          quantity: trackInventory ? Math.min(maxStock, quantity) : quantity,
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
      prev.map((item) => {
        if (item._id === productId) {
          const maxStock = item.stock ?? 999;
          const finalQty = Math.min(maxStock, quantity);
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );
  }, []);

  const updateCartStocks = useCallback((stockMap) => {
    setItems((prev) =>
      prev.map((item) => {
        const fresh = stockMap[item._id];
        if (!fresh) return item;
        const trackInventory = fresh.trackInventory !== false;
        if (!trackInventory) return item;
        let maxStock = item.stock;
        if (item.packageOptionId && fresh.packageOptions && fresh.packageOptions.length > 0) {
          const opt = fresh.packageOptions.find(o => o._id.toString() === item.packageOptionId);
          if (opt) maxStock = opt.stock ?? 0;
        } else {
          maxStock = fresh.stock ?? 0;
        }
        
        // Clamp quantity if it exceeds maxStock
        const newQty = Math.min(maxStock, item.quantity);
        return { ...item, stock: maxStock, quantity: newQty };
      })
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
        updateCartStocks,
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
