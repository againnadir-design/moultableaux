import { createContext, useState, useContext, useEffect } from 'react';
import { api, checkBackendAvailable } from '../lib/api.js';
import { isSupabaseConfigured } from '../lib/supabase.js';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

const BLANK_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f5f0e8' stroke='%23d4c5a9' stroke-width='2' stroke-dasharray='8 4'/%3E%3Ctext x='200' y='200' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif' font-size='14' fill='%23b0a48a'%3EImage à venir%3C/text%3E%3C/svg%3E";

const PRODUCTS_VERSION = 'v6';

const productsData = [
  {
    id: 1,
    name: 'Luffy Gear 5 Wanted Poster',
    category: 'anime',
    image: '/img1.webp',
    badge: 'new',
    description: 'Bounty Wanted Poster of Monkey D. Luffy in his legendary Gear 5 form.',
    rating: 5.0,
    reviews: [{ id: 1, author: 'Youssef B.', rating: 5, date: '2026-06-12', text: 'Qualite d impression incrayable!' }]
  },
  {
    id: 2,
    name: 'Zoro Roronoa Wanted Poster',
    category: 'anime',
    image: '/img2.webp',
    badge: 'bestseller',
    description: 'The updated post-Wano bounty wanted poster for Roronoa Zoro.',
    rating: 4.9,
    reviews: [{ id: 1, author: 'Tariq A.', rating: 5, date: '2026-06-14', text: 'Superbe! Je recommande vivement.' }]
  },
  {
    id: 3,
    name: 'Demon Slayer Hinokami Kagura',
    category: 'anime',
    image: '/img3.webp',
    badge: 'new',
    description: 'Vibrant, high-contrast digital brush artwork capturing Tanjiro Kamado.',
    rating: 4.8,
    reviews: [{ id: 1, author: 'Nassim M.', rating: 5, date: '2026-06-03', text: 'Les couleurs explosent sur le mur.' }]
  },
  {
    id: 4,
    name: 'Naruto & Sasuke Final Valley',
    category: 'anime',
    image: '/img4.webp',
    badge: null,
    description: 'Epic minimal silhouette depiction of the legendary final valley clash.',
    rating: 4.9,
    reviews: [{ id: 1, author: 'Salma T.', rating: 5, date: '2026-05-29', text: 'Il a adore!' }]
  },
  {
    id: 5,
    name: 'Berserk Guts Black Swordsman',
    category: 'manga',
image: '/img5.webp',
    badge: 'bestseller',
    description: 'Dark, highly detailed manga panel engraving print of Guts.',
    rating: 5.0,
    reviews: [{ id: 1, author: 'Kenza P.', rating: 5, date: '2026-06-01', text: 'Le niveau de detail est incroyable.' }]
  },
  {
    id: 6,
    name: 'Elden Ring The Tarnished',
    category: 'gaming',
image: '/img6.webp',
    badge: 'new',
    description: 'Dark fantasy wall art showcasing the Tarnished facing the Erdtree.',
    rating: 4.7,
    reviews: []
  },
  {
    id: 7,
    name: 'Interstellar Gargantua Black Hole',
    category: 'movies',
image: '/img7.webp',
    badge: null,
    description: 'High-definition glossy space art representing Gargantua.',
    rating: 4.8,
    reviews: []
  },
  {
    id: 8,
    name: 'Hakimi: Moroccan Lion Splash',
    category: 'football',
image: '/img8.webp',
    badge: 'bestseller',
    description: 'Stunning dynamic watercolor paint-splatter poster of Achraf Hakimi.',
    rating: 5.0,
    reviews: [{ id: 1, author: 'Morad L.', rating: 5, date: '2026-06-10', text: 'Magnifique hommage a Hakimi!' }]
  },
  {
    id: 9,
    name: 'Cyberpunk Neon City Art',
    category: 'gaming',
image: '/img9.webp',
    badge: null,
    description: 'Neon-drenched cyberpunk cityscape with vibrant purple and blue hues.',
    rating: 4.8,
    reviews: []
  },
  {
    id: 10,
    name: 'Attack on Titan Survey Corps',
    category: 'anime',
image: '/img10.webp',
    badge: 'new',
    description: 'Epic Survey Corps formation with Wings of Freedom emblem.',
    rating: 4.9,
    reviews: []
  },
  {
    id: 11,
    name: 'Dragon Ball Z Super Saiyan',
    category: 'anime',
image: '/img11.webp',
    badge: null,
    description: 'Iconic Super Saiyan transformation with golden aura energy blast.',
    rating: 5.0,
    reviews: []
  },
  {
    id: 12,
    name: 'One Piece Straw Hat Pirates',
    category: 'anime',
image: '/img12.webp',
    badge: 'bestseller',
    description: 'The complete Straw Hat crew in their Wano arc outfits.',
    rating: 4.9,
    reviews: []
  },
  {
    id: 13,
    name: 'Tableau Premium 1',
    category: 'anime',
    image: '/img13.webp',
    badge: 'new',
    description: 'Impression premium sur toile haute qualite.',
    rating: 5.0,
    reviews: []
  },
  {
    id: 14,
    name: 'Tableau Premium 2',
    category: 'anime',
    image: '/img14.webp',
    badge: null,
    description: 'Impression premium sur toile haute qualite.',
    rating: 4.9,
    reviews: []
  },
  {
    id: 15,
    name: 'Tableau Premium 3',
    category: 'anime',
    image: '/img15.webp',
    badge: 'new',
    description: 'Impression premium sur toile haute qualite.',
    rating: 4.8,
    reviews: []
  },
  {
    id: 16,
    name: 'Tableau Premium 4',
    category: 'anime',
    image: '/img16.webp',
    badge: null,
    description: 'Impression premium sur toile haute qualite.',
    rating: 4.9,
    reviews: []
  },
];

const defaultGalleryItems = [
  { id: 1, title: 'Luffy Gear 5 Wanted', image: BLANK_PLACEHOLDER, category: 'anime' },
  { id: 2, title: 'Witcher Kaer Morhen Travel', image: BLANK_PLACEHOLDER, category: 'gaming' },
  { id: 3, title: 'Achraf Hakimi Maroc', image: BLANK_PLACEHOLDER, category: 'football' },
  { id: 4, title: 'Tableau Couple Sur Mesure', image: BLANK_PLACEHOLDER, category: 'custom' },
  { id: 5, title: 'Interstellar Cinematic Black Hole', image: BLANK_PLACEHOLDER, category: 'movies' },
  { id: 6, title: 'Demon Slayer Tanjiro Flame', image: BLANK_PLACEHOLDER, category: 'anime' },
  { id: 7, title: 'Zoro Bounty Poster Wano', image: BLANK_PLACEHOLDER, category: 'anime' },
  { id: 8, title: 'Cyberpunk Neon Street Frame', image: BLANK_PLACEHOLDER, category: 'gaming' }
];

export const AppProvider = ({ children }) => {
  const [backendReady, setBackendReady] = useState(false);
  const [page, setPageState] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    checkBackendAvailable().then(ok => setBackendReady(ok));
  }, []);

  const [wishlist, setWishlist] = useState(() => {
    try {
      const local = localStorage.getItem('moul_wishlist');
      return local ? JSON.parse(local) : [];
    } catch { return []; }
  });

  // Dark Mode Support
  const [themeMode, setThemeMode] = useState(() => {
    const local = localStorage.getItem('moul_theme');
    return local || 'light';
  });

  // Discount Codes
  const [activeDiscountCode, setActiveDiscountCode] = useState(null);
  const [activeDiscountPercentage, setActiveDiscountPercentage] = useState(0);


  // Custom Orders List
  const [customOrders, setCustomOrders] = useState(() => {
    try {
      const local = localStorage.getItem('moul_custom_orders');
      return local ? JSON.parse(local) : [];
    } catch { return []; }
  });

  // Regular E-commerce Orders List
  const [checkoutOrders, setCheckoutOrders] = useState(() => {
    try {
      const local = localStorage.getItem('moul_checkout_orders');
      return local ? JSON.parse(local) : [];
    } catch { return []; }
  });

  // Gallery items (Placeholders + owner dynamic uploads)
  const [galleryItems, setGalleryItems] = useState(() => {
    try {
      const local = localStorage.getItem('moul_gallery_items');
      return local ? JSON.parse(local) : defaultGalleryItems;
    } catch { return defaultGalleryItems; }
  });

  const [products, setProducts] = useState(() => {
    try {
      const storedVersion = localStorage.getItem('moul_products_version');
      const stored = localStorage.getItem('moul_products');
      if (storedVersion === PRODUCTS_VERSION && stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem('moul_products_version', PRODUCTS_VERSION);
      localStorage.setItem('moul_products', JSON.stringify(productsData));
      return productsData;
    } catch {
      return productsData;
    }
  });

  useEffect(() => {
    if (!backendReady && !isSupabaseConfigured()) return;
    api.products.list().then(({ products: p }) => {
      if (p?.length) {
        setProducts(p);
        try {
          localStorage.setItem('moul_products', JSON.stringify(p));
          localStorage.setItem('moul_products_version', PRODUCTS_VERSION);
        } catch {}
      }
    }).catch(() => {});
  }, [backendReady]);

  // User Feedback
  const [feedbacks, setFeedbacks] = useState(() => {
    try {
      const local = localStorage.getItem('moul_feedbacks');
      return local ? JSON.parse(local) : [];
    } catch { return []; }
  });

  // Dynamic Categories
  const FALLBACK_CATEGORIES = [
    { id: 1, name: 'Anime Art', slug: 'anime', description: 'Tableaux animes et heroiques', image: '/img10.webp', sort_order: 1, active: 1 },
    { id: 2, name: 'Manga Panels', slug: 'manga', description: 'Planches de manga cultes', image: '/img9.webp', sort_order: 2, active: 1 },
    { id: 3, name: 'Wanted Posters', slug: 'wanted', description: 'Booster reward posters', image: '/img11.webp', sort_order: 3, active: 1 },
    { id: 4, name: 'Gaming & Neon', slug: 'gaming', description: 'Art de jeux video et univers neon', image: '/img7.webp', sort_order: 4, active: 1 },
    { id: 5, name: 'Cinema & Retro', slug: 'movies', description: 'Films cultes et affiches vintage', image: '/img5.webp', sort_order: 5, active: 1 },
    { id: 6, name: 'Football Legends', slug: 'football', description: 'As du ballon rond', image: '/img6.webp', sort_order: 6, active: 1 },
    { id: 7, name: 'Personal Photos', slug: 'personal', description: 'Photos personnalisees', image: '/img12.webp', sort_order: 7, active: 1 },
    { id: 8, name: 'Custom Creations', slug: 'custom', description: 'Projets sur mesure', image: '/img8.webp', sort_order: 8, active: 1 },
  ];
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

  useEffect(() => {
    if (!backendReady && !isSupabaseConfigured()) return;
    api.categories.listActive().then(({ categories: cats }) => {
      if (cats?.length) setCategories(cats);
    }).catch(() => {});
  }, [backendReady]);

  // Synchronize layout dark mode class on document body
  useEffect(() => {
    if (themeMode === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('moul_theme', themeMode);
  }, [themeMode]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('moul_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);


  useEffect(() => {
    localStorage.setItem('moul_custom_orders', JSON.stringify(customOrders));
  }, [customOrders]);

  useEffect(() => {
    localStorage.setItem('moul_checkout_orders', JSON.stringify(checkoutOrders));
  }, [checkoutOrders]);

  useEffect(() => {
    localStorage.setItem('moul_gallery_items', JSON.stringify(galleryItems));
  }, [galleryItems]);

  useEffect(() => {
    localStorage.setItem('moul_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem('moul_products', JSON.stringify(products));
  }, [products]);

  // Page Routing & Scrolling
  const setPage = (newPage) => {
    setPageState(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const inWishlist = (productId) => wishlist.some(item => item.id === productId);


  const applyDiscountCode = async (code) => {
    const cleanCode = code.toUpperCase().trim();
    if (backendReady || isSupabaseConfigured()) {
      try {
        const { discount } = await api.settings.discounts.validate(cleanCode);
        setActiveDiscountCode(discount.code);
        setActiveDiscountPercentage(discount.percentage / 100);
        return { success: true, message: `${discount.percentage}% discount applied!` };
      } catch { /* fall through to local */ }
    }
    if (cleanCode === 'MAROC10' || cleanCode === 'WELCOME10') {
      setActiveDiscountCode(cleanCode);
      setActiveDiscountPercentage(0.10);
      return { success: true, message: '10% discount applied!' };
    } else if (cleanCode === 'OTAKU20' || cleanCode === 'GAMER20') {
      setActiveDiscountCode(cleanCode);
      setActiveDiscountPercentage(0.20);
      return { success: true, message: '20% discount applied!' };
    } else if (cleanCode === 'MOU50') {
      setActiveDiscountCode(cleanCode);
      setActiveDiscountPercentage(0.50);
      return { success: true, message: '50% mega discount applied!' };
    }
    return { success: false, message: 'Invalid code.' };
  };

  const removeDiscountCode = () => {
    setActiveDiscountCode(null);
    setActiveDiscountPercentage(0);
  };

  // Add custom order request (drag-and-drop file upload)
  const addCustomOrder = (orderData) => {
    const id = 'M-CUST-' + Math.floor(Math.random() * 90000 + 10000);
    const newOrder = {
      id,
      ...orderData,
      date: new Date().toLocaleDateString(),
      status: 'Received'
    };
    setCustomOrders(prev => [newOrder, ...prev]);
    return id;
  };

  // Add Checkout order request
  const addCheckoutOrder = async (orderData) => {
    const id = 'M-ORD-' + Math.floor(Math.random() * 90000 + 10000);
    const newOrder = {
      id,
      customer_name: orderData.fullName || orderData.customer_name || orderData.full_name,
      phone: orderData.phone,
      whatsapp: orderData.whatsapp || '',
      address: orderData.address,
      city: orderData.city,
      products: orderData.cartItems || orderData.cart_items || orderData.products || [],
      images: orderData.images || [],
      total: orderData.total,
      delivery_fee: orderData.delivery_fee || 30,
      instructions: orderData.notes || orderData.instructions || '',
      date: new Date().toLocaleDateString(),
      status: 'pending'
    };
    if (backendReady || isSupabaseConfigured()) {
      try {
        const { order } = await api.orders.create({
          full_name: newOrder.customer_name,
          phone: newOrder.phone,
          whatsapp: newOrder.whatsapp,
          address: newOrder.address,
          city: newOrder.city,
          cart_items: newOrder.products,
          images: newOrder.images,
          total: newOrder.total,
          delivery_fee: newOrder.delivery_fee,
          instructions: newOrder.instructions
        });
        setCheckoutOrders(prev => [order, ...prev]);
        return order.id;
      } catch { /* fall through to local */ }
    }
    setCheckoutOrders(prev => [newOrder, ...prev]);
    return id;
  };

  // Add new image into masonry gallery (Admin)
  const addGalleryItem = async (title, base64Image, category) => {
    const newGalleryItem = {
      id: Date.now(),
      title,
      image: base64Image,
      category
    };
    if (backendReady || isSupabaseConfigured()) {
      try {
        const { item } = await api.settings.gallery.create({ title, image: base64Image, category });
        setGalleryItems(prev => [item, ...prev]);
        return;
      } catch { /* fall through to local */ }
    }
    setGalleryItems(prev => [newGalleryItem, ...prev]);
  };

  // Add user feedback
  const addFeedback = async (name, rating, comment) => {
    const newFeedback = {
      id: Date.now(),
      rating,
      comment,
      author: name || 'Anonyme',
      date: new Date().toLocaleDateString()
    };
    if (backendReady || isSupabaseConfigured()) {
      try {
        const { feedback } = await api.feedbacks.create({ author: newFeedback.author, rating, comment });
        setFeedbacks(prev => [feedback, ...prev]);
        return feedback;
      } catch { /* fall through to local */ }
    }
    setFeedbacks(prev => [newFeedback, ...prev]);
    return newFeedback;
  };

  // Delete a feedback item
  const deleteFeedback = async (feedbackId) => {
    setFeedbacks(prev => prev.filter(fb => fb.id !== feedbackId));
    if (backendReady || isSupabaseConfigured()) {
      try { await api.feedbacks.delete(feedbackId); } catch { /* local already updated */ }
    }
  };

  // Product CRUD
  const addProduct = async (productData) => {
    const newProduct = {
      id: Date.now(),
      ...productData,
      rating: productData.rating || 5.0,
      reviews: [],
      image: productData.image || BLANK_PLACEHOLDER,
    };
    if (backendReady || isSupabaseConfigured()) {
      try {
        const { product } = await api.products.create({ ...productData, images: productData.image ? [productData.image] : [] });
        setProducts(prev => [{ ...product, image: product.image || product.images?.[0] || BLANK_PLACEHOLDER }, ...prev]);
        return product;
      } catch { /* fall through to local */ }
    }
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (productId, updates) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    if (backendReady || isSupabaseConfigured()) {
      try { await api.products.update(productId, updates); } catch { /* local already updated */ }
    }
  };

  const deleteProduct = async (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (backendReady || isSupabaseConfigured()) {
      try { await api.products.delete(productId); } catch { /* local already updated */ }
    }
  };

  // Sound triggers — disabled for silent UX
  const playPop = () => {};
  const playSparkle = () => {};
  const playSuccess = () => {};

  return (
    <AppContext.Provider value={{
      page,
      setPage,
      selectedProductId,
      setSelectedProductId,
      wishlist,
      toggleWishlist,
      inWishlist,
      themeMode,
      toggleTheme,
      activeDiscountCode,
      activeDiscountPercentage,
      applyDiscountCode,
      removeDiscountCode,
      playPop,
      playSparkle,
      playSuccess,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      customOrders,
      addCustomOrder,
      checkoutOrders,
      addCheckoutOrder,
      galleryItems,
      addGalleryItem,
      feedbacks,
      addFeedback,
      deleteFeedback,
      categories,
      setCategories,
      backendReady,
    }}>
      {children}
    </AppContext.Provider>
  );
};
