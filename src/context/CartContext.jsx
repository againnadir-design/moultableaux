import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  isSidebarOpen: false,
  toggleSidebar: () => {},
  clearCart: () => {},
  subtotal: 0,
  originalSubtotal: 0,
  savings: 0,
  appliedOffers: [],
  total: 0,
  totalItems: 0,
  deliveryFee: 30,
  cartMessage: null,
  SIZES: {},
  OFFERS: [],
  calculateItemPrice: () => ({}),
});

const DELIVERY_FEE = 30;

const SIZES = {
  small: { label: 'Small', size: '21×30 cm', price: 30, minQty: 3 },
  large: { label: 'Large', size: '30×42 cm', price: 50, minQty: 2 },
};

const OFFERS = [
  { id: 'small10', sizeKey: 'small', requiredQty: 10, bundlePrice: 250, originalPrice: 300, label: 'عرض خاص: 10 لوحات مقابل 250 DH' },
  { id: 'large5', sizeKey: 'large', requiredQty: 5, bundlePrice: 200, originalPrice: 250, label: 'عرض خاص: 5 لوحات مقابل 200 DH' },
];

export const useCart = () => useContext(CartContext);

function getOfferForItem(sizeKey, quantity) {
  const offer = OFFERS.find(o => o.sizeKey === sizeKey && quantity >= o.requiredQty);
  return offer || null;
}

function calculateItemPrice(item) {
  const offer = getOfferForItem(item.sizeKey, item.quantity);
  if (offer) {
    const unitPrice = offer.bundlePrice / offer.requiredQty;
    return {
      unitPrice,
      appliedOffer: offer,
      lineTotal: unitPrice * item.quantity,
      originalTotal: item.price * item.quantity,
      itemSavings: (item.price * item.quantity) - (unitPrice * item.quantity),
    };
  }
  return {
    unitPrice: item.price,
    appliedOffer: null,
    lineTotal: item.price * item.quantity,
    originalTotal: item.price * item.quantity,
    itemSavings: 0,
  };
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('moul_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('moul_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const showMessage = (msg) => {
    setCartMessage(msg);
    setTimeout(() => setCartMessage(null), 3000);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product, sizeKey = 'small') => {
    const sizeInfo = SIZES[sizeKey];
    if (!sizeInfo) return;

    const itemKey = `${product.id}-${sizeKey}`;

    setCartItems(prev => {
      const existing = prev.find(item => item.key === itemKey);
      if (existing) {
        return prev.map(item =>
          item.key === itemKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        image: product.image,
        category: product.category,
        sizeKey,
        sizeLabel: sizeInfo.label,
        sizeCm: sizeInfo.size,
        price: sizeInfo.price,
        minQty: sizeInfo.minQty,
        quantity: 1,
        key: itemKey,
      }];
    });
    setIsSidebarOpen(true);
  };

  const removeFromCart = (itemKey) => {
    setCartItems(prev => prev.filter(item => item.key !== itemKey));
  };

  const updateQuantity = (itemKey, amount) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.key !== itemKey) return item;
        const newQty = Math.max(item.minQty, item.quantity + amount);
        if (newQty !== item.quantity + amount && amount < 0) {
          showMessage(`الحد الأدنى ${item.minQty} ${item.sizeLabel} مطلوب`);
        }
        return { ...item, quantity: newQty };
      });
    });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('moul_cart');
  };

  const cartSummary = cartItems.reduce((acc, item) => {
    const { unitPrice, appliedOffer, lineTotal, originalTotal, itemSavings } = calculateItemPrice(item);
    acc.subtotal += lineTotal;
    acc.originalSubtotal += originalTotal;
    acc.savings += itemSavings;
    if (appliedOffer && !acc.appliedOffers.find(o => o.id === appliedOffer.id)) {
      acc.appliedOffers.push(appliedOffer);
    }
    return acc;
  }, { subtotal: 0, originalSubtotal: 0, savings: 0, appliedOffers: [] });

  const finalTotal = cartSummary.subtotal + DELIVERY_FEE;

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      isSidebarOpen,
      toggleSidebar,
      clearCart,
      subtotal: cartSummary.subtotal,
      originalSubtotal: cartSummary.originalSubtotal,
      savings: cartSummary.savings,
      appliedOffers: cartSummary.appliedOffers,
      total: finalTotal,
      totalItems,
      deliveryFee: DELIVERY_FEE,
      cartMessage,
      SIZES,
      OFFERS,
      calculateItemPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};
