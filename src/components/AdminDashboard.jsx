import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListOrdered, LogOut, Upload,
  Percent, Image as ImageIcon, Package, Check, X, LayoutDashboard, ShoppingBag,
  MessageSquare, Plus, Trash2, Edit2, Star, ExternalLink, Store,
  RefreshCw, Search, Download, Settings, Filter,
  Truck, Clock, ToggleLeft, ToggleRight, BarChart3, Tag, Calendar, Send, Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { api, checkBackendAvailable } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';
import NotificationBell from './NotificationBell';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { logout: adminLogout, isAuthenticated } = useAdminAuth();
  const {
    products, addProduct, updateProduct, deleteProduct,
    feedbacks, addFeedback, deleteFeedback,
    checkoutOrders, customOrders,
    galleryItems, addGalleryItem,
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Remote data (null = not loaded yet)
  const [remoteProducts, setRemoteProducts] = useState(null);
  const [remoteFeedbacks, setRemoteFeedbacks] = useState(null);
  const [remoteOrders, setRemoteOrders] = useState(null);
  const [remoteCustomOrders, setRemoteCustomOrders] = useState(null);
  const [remoteOffers, setRemoteOffers] = useState(null);
  const [remoteCategories, setRemoteCategories] = useState(null);

  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image: '', sort_order: 0 });
  const [categorySaving, setCategorySaving] = useState(false);

  // Order detail modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', category: 'anime', description: '', badge: '', images: [],
  });
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [productSaving, setProductSaving] = useState(false);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ author: '', rating: 5, comment: '' });

  // Gallery upload states
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('anime');
  const [galleryImageFile, setGalleryImageFile] = useState(null);
  const [galleryImagePreview, setGalleryImagePreview] = useState('');
  const [addGallerySuccess, setAddGallerySuccess] = useState(false);

  // Discount Codes (from DB)
  const [discountCodes, setDiscountCodes] = useState([]);
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodePercentage, setNewCodePercentage] = useState(15);

  // Offers
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState({
    title: '', description: '', discount_type: 'percentage', discount_value: 10,
    product_ids: [], start_date: '', end_date: '',
  });
  const [offerSaving, setOfferSaving] = useState(false);

  // Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Settings (from DB)
  const [deliveryFee, setDeliveryFee] = useState(30);
  const [minOrderQty, setMinOrderQty] = useState(3);
  const [siteSettings, setSiteSettings] = useState({ showInstagram: true, showTiktok: false, showGallery: true, heroTagline: '' });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Telegram settings
  const [tgEnabled, setTgEnabled] = useState(false);
  const [tgToken, setTgToken] = useState('');
  const [tgChatId, setTgChatId] = useState('');
  const [tgTestStatus, setTgTestStatus] = useState('');

  // Change password form
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdStatus, setPwdStatus] = useState(''); // '' | 'loading' | 'success' | 'error'
  const [pwdError, setPwdError] = useState('');

  // WhatsApp settings
  const [waPhone, setWaPhone] = useState('212623391688');
  const [waTemplate, setWaTemplate] = useState('');
  const [waPrefix, setWaPrefix] = useState('');
  const [waSuffix, setWaSuffix] = useState('');
  const [waImagesEnabled, setWaImagesEnabled] = useState(true);

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const effectiveProducts = remoteProducts !== null ? remoteProducts : products;
  const effectiveFeedbacks = remoteFeedbacks !== null ? remoteFeedbacks : feedbacks;
  const effectiveOrders = remoteOrders !== null ? remoteOrders : checkoutOrders;
  const effectiveCustomOrders = remoteCustomOrders !== null ? remoteCustomOrders : customOrders;
  const effectiveOffers = remoteOffers !== null ? remoteOffers : [];
  const effectiveCategories = remoteCategories !== null ? remoteCategories : [];

  // Filtered data
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return effectiveProducts;
    const q = productSearch.toLowerCase();
    return effectiveProducts.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [effectiveProducts, productSearch]);

  const filteredOrders = useMemo(() => {
    let list = effectiveOrders;
    if (orderStatusFilter !== 'all') {
      list = list.filter(o => o.status === orderStatusFilter);
    }
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      list = list.filter(o => 
        (o.id || '').toLowerCase().includes(q) ||
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.city || '').toLowerCase().includes(q) ||
        (o.phone || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [effectiveOrders, orderStatusFilter, orderSearch]);

  // ── Load from Express backend on mount ──
  const ADMIN_FALLBACK_CATEGORIES = [
    { id: 1, name: 'Anime Art', slug: 'anime', description: 'Tableaux animes et heroiques', image: '/img10.webp', sort_order: 1, active: 1 },
    { id: 2, name: 'Manga Panels', slug: 'manga', description: 'Planches de manga cultes', image: '/img9.webp', sort_order: 2, active: 1 },
    { id: 3, name: 'Wanted Posters', slug: 'wanted', description: 'Booster reward posters', image: '/img11.webp', sort_order: 3, active: 1 },
    { id: 4, name: 'Gaming & Neon', slug: 'gaming', description: 'Art de jeux video et univers neon', image: '/img7.webp', sort_order: 4, active: 1 },
    { id: 5, name: 'Cinema & Retro', slug: 'movies', description: 'Films cultes et affiches vintage', image: '/img5.webp', sort_order: 5, active: 1 },
    { id: 6, name: 'Football Legends', slug: 'football', description: 'As du ballon rond', image: '/img6.webp', sort_order: 6, active: 1 },
    { id: 7, name: 'Personal Photos', slug: 'personal', description: 'Photos personnalisees', image: '/img12.webp', sort_order: 7, active: 1 },
    { id: 8, name: 'Custom Creations', slug: 'custom', description: 'Projets sur mesure', image: '/img8.webp', sort_order: 8, active: 1 },
  ];

  const loadRemoteData = useCallback(async () => {
    const available = await checkBackendAvailable();
    setBackendAvailable(available);

    // ── Products: try Supabase first, then Express ──
    if (isSupabaseConfigured()) {
      try {
        const prods = await api.products.listAll();
        setRemoteProducts(prods.products || []);
      } catch (err) {
        console.warn('Failed to load products from Supabase:', err);
      }
    } else if (available) {
      try {
        const prods = await api.products.listAll();
        setRemoteProducts(prods.products || []);
      } catch (err) {
        console.warn('Failed to load products from Express:', err);
      }
    }

    if (!available && !isSupabaseConfigured()) {
      setRemoteCategories(ADMIN_FALLBACK_CATEGORIES);
      return;
    }
    try {
      const [fbs, ords, offers, cats] = await Promise.all([
        api.feedbacks.list(100),
        api.orders.list(),
        api.offers.list(),
        api.categories.list(),
      ]);
      setRemoteFeedbacks(fbs.feedbacks || []);
      setRemoteOrders(ords.orders || []);
      setRemoteCustomOrders([]);
      setRemoteOffers(offers.offers || []);
      setRemoteCategories(cats.categories || []);

      const settings = await api.settings.get();
      const s = settings.settings || {};
      setDeliveryFee(Number(s.delivery_fee) || 30);
      setMinOrderQty(Number(s.min_order_qty) || 3);
      setSiteSettings({
        showInstagram: s.instagram_enabled !== 'false',
        showTiktok: s.tiktok_enabled === 'true',
        showGallery: s.show_gallery !== 'false',
        heroTagline: s.hero_tagline || '',
      });
      setTgEnabled(s.telegram_enabled === 'true');
      setTgToken(s.telegram_bot_token || '');
      setTgChatId(s.telegram_chat_id || '');
      setWaPhone(s.whatsapp_phone || '212623391688');
      setWaTemplate(s.whatsapp_template || '');
      setWaPrefix(s.whatsapp_prefix || '');
      setWaSuffix(s.whatsapp_suffix || '');
      setWaImagesEnabled(s.whatsapp_images_enabled !== 'false');
      setSettingsLoaded(true);

      const discounts = await api.settings.discounts.list();
      setDiscountCodes(discounts.discounts || []);
    } catch (err) {
      console.warn('Failed to load from backend:', err);
    }
  }, []);

  useEffect(() => { loadRemoteData(); }, [loadRemoteData]);

  // ── Logout ──
  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/login', { replace: true });
  };

  // ── Products ──
  const resetProductForm = () => {
    setProductForm({ name: '', category: 'anime', description: '', badge: '', images: [] });
    setEditingProduct(null);
    setShowProductForm(false);
    setProductImageFile(null);
    setProductImagePreview('');
  };

  const handleProductImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProductImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProductImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductSaving(true);
    try {
      let imageUrl = editingProduct?.images?.[0] || '';

      if (productImageFile) {
        const uploaded = await api.upload.image(productImageFile);
        imageUrl = uploaded.url;
      }

      const data = {
        name: productForm.name,
        price: 0,
        category: productForm.category,
        description: productForm.description,
        badge: productForm.badge || null,
        images: imageUrl ? [imageUrl] : [],
      };

      if (editingProduct) {
        await api.products.update(editingProduct.id, data);
      } else {
        await api.products.create(data);
      }
      const res = await api.products.listAll();
      setRemoteProducts(res.products || []);
      resetProductForm();
    } catch (err) {
      console.error('Product save failed:', err);
      alert('Erreur: ' + (err.message || 'Echec de sauvegarde'));
    } finally {
      setProductSaving(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      description: product.description,
      badge: product.badge || '',
      images: product.images || [],
    });
    setProductImagePreview(product.images?.[0] || '');
    setProductImageFile(null);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    setDeleteConfirm({ type: 'product', id: productId, name: effectiveProducts.find(p => p.id === productId)?.name || '' });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'product') {
        await api.products.delete(deleteConfirm.id);
        setRemoteProducts(prev => prev ? prev.filter(p => p.id !== deleteConfirm.id) : prev);
      } else if (deleteConfirm.type === 'feedback') {
        await api.feedbacks.delete(deleteConfirm.id);
        setRemoteFeedbacks(prev => prev ? prev.filter(fb => fb.id !== deleteConfirm.id) : prev);
      } else if (deleteConfirm.type === 'offer') {
        await api.offers.delete(deleteConfirm.id);
        setRemoteOffers(prev => prev ? prev.filter(o => o.id !== deleteConfirm.id) : prev);
      } else if (deleteConfirm.type === 'discount') {
        await api.settings.discounts.delete(deleteConfirm.id);
        setDiscountCodes(prev => prev.filter(c => c.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === 'category') {
        await api.categories.delete(deleteConfirm.id);
        setRemoteCategories(prev => prev ? prev.filter(c => c.id !== deleteConfirm.id) : prev);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setDeleteConfirm(null);
  };

  // ── Reviews ──
  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const fb = {
        author: reviewForm.author || 'Admin',
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        date: new Date().toLocaleDateString(),
      };
      await api.feedbacks.create(fb);
      const res = await api.feedbacks.list(100);
      setRemoteFeedbacks(res.feedbacks || []);
      setReviewForm({ author: '', rating: 5, comment: '' });
      setShowReviewForm(false);
    } catch (err) {
      console.error('Feedback insert failed:', err);
    }
  };

  const handleDeleteReview = async (feedbackId) => {
    setDeleteConfirm({ type: 'feedback', id: feedbackId });
  };

  // ── Gallery ──
  const handleGalleryFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setGalleryImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setGalleryImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAddGalleryItem = async (e) => {
    e.preventDefault();
    if (!galleryTitle || !galleryImageFile) return;
    try {
      const uploaded = await api.upload.image(galleryImageFile);
      await api.settings.gallery.create({ title: galleryTitle, image: uploaded.url, category: galleryCategory });
      setAddGallerySuccess(true);
      setGalleryTitle('');
      setGalleryImageFile(null);
      setGalleryImagePreview('');
      setTimeout(() => setAddGallerySuccess(false), 3000);
    } catch (err) {
      console.error('Gallery insert failed:', err);
    }
  };

  // ── Discounts ──
  const handleAddDiscount = async (e) => {
    e.preventDefault();
    if (!newCodeName.trim()) return;
    try {
      await api.settings.discounts.create({ code: newCodeName.toUpperCase().trim(), percentage: Number(newCodePercentage) });
      const res = await api.settings.discounts.list();
      setDiscountCodes(res.discounts || []);
      setNewCodeName('');
    } catch (err) {
      console.error('Discount add failed:', err);
    }
  };

  const handleRemoveDiscount = (id) => {
    setDeleteConfirm({ type: 'discount', id });
  };

  // ── Order Status Update ──
  const handleStatusChange = async (orderId, newStatus) => {
    let previousStatus;
    setRemoteOrders(prev => {
      if (!prev) return prev;
      const order = prev.find(o => o.id === orderId);
      previousStatus = order?.status;
      return prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    });
    setRemoteCustomOrders(prev => {
      if (!prev) return prev;
      return prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    });
    try {
      await api.orders.updateStatus(orderId, newStatus);
    } catch (err) {
      setRemoteOrders(prev => {
        if (!prev) return prev;
        return prev.map(o => o.id === orderId ? { ...o, status: previousStatus } : o);
      });
      setRemoteCustomOrders(prev => {
        if (!prev) return prev;
        return prev.map(o => o.id === orderId ? { ...o, status: previousStatus } : o);
      });
    }
  };

  // ── CSV Export ──
  const handleExportOrders = () => {
    const headers = ['ID', 'Date', 'Client', 'Phone', 'City', 'Address', 'Total', 'Status', 'Items'];
    const rows = effectiveOrders.map(o => [
      o.id,
      o.created_at,
      o.customer_name || '',
      o.phone || '',
      o.city || '',
      o.address || '',
      o.total || 0,
      o.status || 'pending',
      (Array.isArray(o.products) ? o.products : JSON.parse(o.products || '[]')).map(i => `${i.quantity}x ${i.name}`).join('; ')
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes-moul-tableaux-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Offers ──
  const resetOfferForm = () => {
    setOfferForm({ title: '', description: '', discount_type: 'percentage', discount_value: 10, product_ids: [], start_date: '', end_date: '' });
    setEditingOffer(null);
    setShowOfferForm(false);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    setOfferSaving(true);
    try {
      if (editingOffer) {
        await api.offers.update(editingOffer.id, offerForm);
      } else {
        await api.offers.create(offerForm);
      }
      const res = await api.offers.list();
      setRemoteOffers(res.offers || []);
      resetOfferForm();
    } catch (err) {
      console.error('Offer save failed:', err);
      alert('Erreur: ' + (err.message || 'Echec'));
    } finally {
      setOfferSaving(false);
    }
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title,
      description: offer.description || '',
      discount_type: offer.discount_type || 'percentage',
      discount_value: offer.discount_value || 10,
      product_ids: offer.product_ids || [],
      start_date: offer.start_date || '',
      end_date: offer.end_date || '',
    });
    setShowOfferForm(true);
  };

  const handleDeleteOffer = (id) => {
    setDeleteConfirm({ type: 'offer', id });
  };

  const handleToggleOfferActive = async (offer) => {
    try {
      await api.offers.update(offer.id, { active: !offer.active });
      const res = await api.offers.list();
      setRemoteOffers(res.offers || []);
    } catch (err) {
      console.error('Offer toggle failed:', err);
    }
  };

  // ── Settings Save ──
  const handleSaveSettings = async () => {
    try {
      await api.settings.update({
        delivery_fee: deliveryFee,
        min_order_qty: minOrderQty,
        instagram_enabled: siteSettings.showInstagram ? 'true' : 'false',
        tiktok_enabled: siteSettings.showTiktok ? 'true' : 'false',
        show_gallery: siteSettings.showGallery,
        hero_tagline: siteSettings.heroTagline,
        telegram_enabled: tgEnabled,
        telegram_bot_token: tgToken,
        telegram_chat_id: tgChatId,
        whatsapp_phone: waPhone,
        whatsapp_template: waTemplate,
        whatsapp_prefix: waPrefix,
        whatsapp_suffix: waSuffix,
        whatsapp_images_enabled: waImagesEnabled ? 'true' : 'false',
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) {
      console.error('Settings save failed:', err);
    }
  };

  const handleTelegramTest = async () => {
    setTgTestStatus('sending');
    try {
      await api.settings.telegramTest(tgToken, tgChatId);
      setTgTestStatus('success');
    } catch (err) {
      setTgTestStatus('error');
    }
    setTimeout(() => setTgTestStatus(''), 4000);
  };

  const handleChangePassword = async () => {
    setPwdError('');
    if (!pwdCurrent || !pwdNew || !pwdConfirm) {
      setPwdError('Tous les champs sont requis.');
      return;
    }
    if (pwdNew.length < 8) {
      setPwdError('Le nouveau mot de passe doit contenir au moins 8 caracteres.');
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setPwdError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (pwdCurrent === pwdNew) {
      setPwdError('Le nouveau mot de passe doit etre different de l\'actuel.');
      return;
    }
    setPwdStatus('loading');
    try {
      await api.auth.changePassword(pwdCurrent, pwdNew);
      setPwdStatus('success');
      setPwdCurrent('');
      setPwdNew('');
      setPwdConfirm('');
      setTimeout(() => {
        setPwdStatus('');
        adminLogout();
        navigate('/admin/login');
      }, 2000);
    } catch (err) {
      setPwdStatus('error');
      setPwdError(err.message || 'Erreur lors de la modification du mot de passe.');
      setTimeout(() => setPwdStatus(''), 3000);
    }
  };

  // ── Categories ──
  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '', image: '', sort_order: 0 });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCategorySaving(true);
    try {
      if (editingCategory) {
        await api.categories.update(editingCategory.id, categoryForm);
      } else {
        await api.categories.create(categoryForm);
      }
      const res = await api.categories.list();
      setRemoteCategories(res.categories || []);
      resetCategoryForm();
    } catch (err) {
      console.error('Category save failed:', err);
      const newCat = {
        id: Date.now(),
        name: categoryForm.name,
        slug: categoryForm.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, ''),
        description: categoryForm.description || '',
        image: categoryForm.image || '',
        sort_order: categoryForm.sort_order || 0,
        active: 1,
      };
      setRemoteCategories(prev => prev ? [...prev, newCat] : [newCat]);
      resetCategoryForm();
    } finally {
      setCategorySaving(false);
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description || '', image: cat.image || '', sort_order: cat.sort_order || 0 });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = (id) => {
    setDeleteConfirm({ type: 'category', id });
  };

  // ── Stats ──
  const totalProducts = effectiveProducts.length;
  const totalOrders = effectiveOrders.length + effectiveCustomOrders.length;
  const totalReviews = effectiveFeedbacks.length;
  const totalRevenue = effectiveOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrders = effectiveOrders.filter(o => o.status === 'pending' || !o.status).length;
  const topProducts = useMemo(() => {
    const counts = {};
    effectiveOrders.forEach(o => {
      let items = o.products || o.cartItems || [];
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch { items = []; }
      }
      if (!Array.isArray(items)) return;
      items.forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + (item.quantity || 1);
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [effectiveOrders]);

  // ── Sidebar ──
  const sidebarItems = [
    { id: 'overview', label: 'Apercu', icon: LayoutDashboard },
    { id: 'products', label: 'Produits', icon: ShoppingBag, count: totalProducts },
    { id: 'categories', label: 'Categories', icon: Filter, count: effectiveCategories.length },
    { id: 'orders', label: 'Commandes', icon: ListOrdered, count: effectiveOrders.length },
    { id: 'custom', label: 'Sur Mesure', icon: Package, count: effectiveCustomOrders.length },
    { id: 'reviews', label: 'Avis Clients', icon: MessageSquare, count: totalReviews },
    { id: 'offers', label: 'Offres', icon: Tag, count: effectiveOffers.length },
    { id: 'gallery', label: 'Galerie', icon: ImageIcon },
    { id: 'discounts', label: 'Codes Promo', icon: Percent },
    { id: 'settings', label: 'Parametres', icon: Settings },
  ];

  const handleNewOrder = useCallback((order) => {
    setRemoteOrders(prev => prev ? [order, ...prev] : prev);
  }, []);

  const pageNames = {
    overview: 'Apercu General',
    products: 'Produits',
    categories: 'Categories',
    orders: 'Commandes',
    custom: 'Sur Mesure',
    reviews: 'Avis Clients',
    offers: 'Offres & Promotions',
    gallery: 'Galerie',
    discounts: 'Codes Promo',
    settings: 'Parametres',
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7]">
      <div className="flex min-h-screen">

        {/* ── Desktop Sidebar ── */}
        <aside className="w-[240px] hidden lg:flex flex-col bg-white border-r border-gray-200 sticky top-0 h-screen shrink-0">
          <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#B54A3A] flex items-center justify-center">
                <Store size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900 leading-tight">Admin</h1>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${backendAvailable ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  {backendAvailable ? 'API Connectee' : 'Mode Local'}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  activeTab === item.id
                    ? 'bg-[#B54A3A] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <item.icon size={18} />
                  {item.label}
                </span>
                {item.count !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    activeTab === item.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>{item.count}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-gray-100 space-y-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${backendAvailable ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
              <span className={`w-2 h-2 rounded-full ${backendAvailable ? 'bg-green-500' : 'bg-amber-500'}`} />
              {backendAvailable ? 'Backend connecte' : 'Backend indisponible'}
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors"
            >
              <LogOut size={18} />
              Deconnexion
            </button>
          </div>
        </aside>

        {/* ── Mobile Sidebar Overlay ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-white shadow-xl flex flex-col animate-fade-in">
              <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#B54A3A] flex items-center justify-center">
                    <Store size={16} className="text-white" />
                  </div>
                  <h1 className="text-sm font-semibold text-gray-900">Admin</h1>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                      activeTab === item.id
                        ? 'bg-[#B54A3A] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <item.icon size={18} />
                      {item.label}
                    </span>
                    {item.count !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        activeTab === item.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>{item.count}</span>
                    )}
                  </button>
                ))}
              </nav>
              <div className="px-3 py-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors"
                >
                  <LogOut size={18} />
                  Deconnexion
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Top Bar */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <LayoutDashboard size={20} className="text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">{pageNames[activeTab]}</h2>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell onNewOrder={handleNewOrder} />
                <button
                  onClick={() => navigate('/')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                >
                  <ExternalLink size={14} /> Site
                </button>
                <button
                  onClick={handleLogout}
                  className="sm:hidden p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <LogOut size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6">

            {/* ===== OVERVIEW ===== */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Bienvenue, Admin</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <ShoppingBag size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                        <p className="text-xs text-gray-500 font-medium">Produits</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <ListOrdered size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                        <p className="text-xs text-gray-500 font-medium">Commandes</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <BarChart3 size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{totalRevenue} DH</p>
                        <p className="text-xs text-gray-500 font-medium">Revenu Total</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Clock size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-amber-600">{pendingOrders}</p>
                        <p className="text-xs text-gray-500 font-medium">En Attente</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activite Recentes</h3>
                  {effectiveOrders.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Aucune activite recente.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            <th className="pb-3 pr-4">Commande</th>
                            <th className="pb-3 pr-4">Client</th>
                            <th className="pb-3 pr-4">Montant</th>
                            <th className="pb-3">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {effectiveOrders.slice(0, 5).map((ord) => (
                            <tr key={ord.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                              <td className="py-3 pr-4 text-sm font-mono text-gray-900">{ord.id}</td>
                              <td className="py-3 pr-4 text-sm text-gray-700">{ord.customer_name}</td>
                              <td className="py-3 pr-4 text-sm font-semibold text-gray-900">{ord.total} DH</td>
                              <td className="py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  ord.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                  ord.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                  ord.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                                  ord.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {ord.status || 'pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {topProducts.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Produits Vendus</h3>
                    <div className="space-y-3">
                      {topProducts.map(([name, qty], idx) => (
                        <div key={name} className="flex items-center justify-between">
                          <span className="flex items-center gap-3">
                            <span className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[250px]">{name}</span>
                          </span>
                          <span className="text-sm text-gray-500 font-medium">{qty} vendu(s)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {backendAvailable && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                    <RefreshCw size={16} className="text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Base de donnees connectee</p>
                      <p className="text-xs text-green-600">Les donnees sont synchronisees via l'API Express.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== CATEGORIES ===== */}
            {activeTab === 'categories' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Categories ({effectiveCategories.length})</h3>
                  <button
                    onClick={() => { resetCategoryForm(); setShowCategoryForm(!showCategoryForm); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#B54A3A] hover:bg-[#9A3D2F] text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"
                  >
                    <Plus size={16} /> Nouvelle Categorie
                  </button>
                </div>

                {showCategoryForm && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingCategory ? 'Modifier la Categorie' : 'Nouvelle Categorie'}
                    </h3>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1.5">Nom de la categorie</label>
                          <input type="text" required value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1.5">Ordre d'affichage</label>
                          <input type="number" min="0" value={categoryForm.sort_order} onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) })}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Description (optionnel)</label>
                        <input type="text" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Image URL (optionnel)</label>
                        <input type="url" value={categoryForm.image} onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={categorySaving} className="bg-[#B54A3A] hover:bg-[#9A3D2F] text-white font-medium text-sm py-2 px-5 rounded-lg cursor-pointer disabled:opacity-50 transition-colors">
                          {categorySaving ? 'Envoi...' : editingCategory ? 'Enregistrer' : 'Creer'}
                        </button>
                        <button type="button" onClick={resetCategoryForm} className="bg-white border border-gray-200 text-gray-700 font-medium text-sm py-2 px-5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {effectiveCategories.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Filter size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Aucune categorie. Creez-en une pour commencer.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Categorie</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Slug</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Ordre</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Statut</th>
                          <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {effectiveCategories.map((cat) => (
                          <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {cat.image ? (
                                  <img src={cat.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Filter size={16} className="text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                                  {cat.description && <p className="text-xs text-gray-500 truncate max-w-[200px]">{cat.description}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{cat.slug}</span>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <span className="text-sm text-gray-600">{cat.sort_order}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {cat.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleEditCategory(cat)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors" title="Modifier">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" title="Supprimer">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ===== PRODUCTS ===== */}
            {activeTab === 'products' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Produits ({filteredProducts.length})</h3>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full sm:w-56 bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all"
                      />
                    </div>
                    <button
                      onClick={() => { resetProductForm(); setShowProductForm(!showProductForm); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#B54A3A] hover:bg-[#9A3D2F] text-white rounded-lg text-sm font-medium cursor-pointer shrink-0 transition-colors"
                    >
                      <Plus size={16} /> Ajouter
                    </button>
                  </div>
                </div>

                {showProductForm && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
                    </h3>
                    <form onSubmit={handleProductSubmit}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">Nom du produit</label>
                            <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">Categorie</label>
                            <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all">
                              {effectiveCategories.map(cat => (
                                <option key={cat.id} value={cat.slug}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">Badge (optionnel)</label>
                            <select value={productForm.badge} onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all">
                              <option value="">Aucun</option>
                              <option value="new">Nouveau</option>
                              <option value="bestseller">Bestseller</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">Description</label>
                            <textarea rows="3" required value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all resize-none" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">Prix</label>
                            <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">Small: 30 DH | Large: 50 DH</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1.5">Image du produit</label>
                          <label className="flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#B54A3A]/40 rounded-xl p-8 cursor-pointer transition-colors text-center">
                            <Upload size={32} className="text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-gray-600">
                              {productImageFile ? productImageFile.name : 'Cliquez pour choisir une image'}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">PNG, JPG jusqu'a 10MB</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleProductImageSelect} />
                          </label>
                          {productImagePreview && (
                            <div className="mt-4 w-full h-48 border border-gray-200 rounded-xl overflow-hidden">
                              <img src={productImagePreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                        <button type="submit" disabled={productSaving}
                          className="bg-[#B54A3A] hover:bg-[#9A3D2F] text-white text-sm font-medium py-2.5 px-5 rounded-lg cursor-pointer disabled:opacity-50 transition-colors">
                          {productSaving ? 'Envoi...' : editingProduct ? 'Enregistrer' : 'Ajouter le produit'}
                        </button>
                        <button type="button" onClick={resetProductForm}
                          className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium py-2.5 px-5 rounded-lg cursor-pointer transition-colors">
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Desktop Table */}
                <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-3">Produit</th>
                          <th className="px-6 py-3">Categorie</th>
                          <th className="px-6 py-3">Prix</th>
                          <th className="px-6 py-3">Avis</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {product.images?.[0] && (
                                  <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" width="40" height="40" />
                                )}
                                <div>
                                  <span className="text-sm font-medium text-gray-900 block">{product.name}</span>
                                  {product.badge && (
                                    <span className="inline-block mt-1 text-[10px] bg-[#B54A3A]/10 text-[#B54A3A] px-2 py-0.5 rounded-full font-medium capitalize">{product.badge}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">{product.category}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">30 / 50 DH</td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1 text-sm text-gray-600">
                                <Star size={14} className="text-amber-400 fill-amber-400" /> {product.rating}
                                <span className="text-gray-400">({product.reviews?.length || 0})</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleEditProduct(product)}
                                  className="p-2 rounded-lg border border-gray-200 hover:border-[#B54A3A]/30 hover:bg-[#B54A3A]/5 text-gray-500 hover:text-[#B54A3A] cursor-pointer transition-colors" title="Modifier">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer transition-colors" title="Supprimer">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredProducts.length === 0 && (
                    <div className="py-12 text-center">
                      <ShoppingBag size={40} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Aucun produit trouve.</p>
                    </div>
                  )}
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0" width="56" height="56" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-900 block truncate">{product.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 capitalize">{product.category}</span>
                            {product.badge && (
                              <span className="text-[10px] bg-[#B54A3A]/10 text-[#B54A3A] px-2 py-0.5 rounded-full font-medium capitalize">{product.badge}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">30/50 DH</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Star size={14} className="text-amber-400 fill-amber-400" /> {product.rating}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditProduct(product)}
                            className="p-2 rounded-lg border border-gray-200 hover:border-[#B54A3A]/30 text-gray-500 hover:text-[#B54A3A] cursor-pointer transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== ORDERS ===== */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Commandes ({filteredOrders.length})</h3>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="ID, client, ville..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full sm:w-48 bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all"
                      />
                    </div>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all"
                    >
                      <option value="all">Tous</option>
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirme</option>
                      <option value="processing">En prod.</option>
                      <option value="shipped">Expedie</option>
                      <option value="delivered">Livre</option>
                      <option value="cancelled">Annule</option>
                    </select>
                    <button
                      onClick={handleExportOrders}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-sm font-medium cursor-pointer shrink-0 transition-colors"
                    >
                      <Download size={14} /> CSV
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {filteredOrders.length === 0 ? (
                    <div className="py-12 text-center">
                      <ListOrdered size={40} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Aucune commande recue.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3">Commande</th>
                            <th className="px-6 py-3 hidden sm:table-cell">Date</th>
                            <th className="px-6 py-3">Client</th>
                            <th className="px-6 py-3">Montant</th>
                            <th className="px-6 py-3">Statut</th>
                            <th className="px-6 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((ord) => (
                            <tr key={ord.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-mono text-gray-900">{ord.id}</td>
                              <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{ord.created_at}</td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-medium text-gray-900 block">{ord.customer_name}</span>
                                <span className="text-xs text-gray-500 block sm:hidden">{ord.created_at}</span>
                                <span className="text-xs text-gray-500 block">{ord.city}</span>
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">{ord.total} DH</td>
                              <td className="px-6 py-4">
                                <select
                                  value={ord.status || 'pending'}
                                  onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                  className={`border rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none cursor-pointer transition-colors ${
                                    ord.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                    ord.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    ord.status === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    ord.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-gray-50 text-gray-600 border-gray-200'
                                  }`}
                                >
                                  <option value="pending">En attente</option>
                                  <option value="confirmed">Confirme</option>
                                  <option value="processing">En prod.</option>
                                  <option value="shipped">Expedie</option>
                                  <option value="delivered">Livre</option>
                                  <option value="cancelled">Annule</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => setSelectedOrderDetails(ord)}
                                  className="px-3 py-1.5 bg-white border border-gray-200 hover:border-[#B54A3A]/30 hover:bg-[#B54A3A]/5 text-gray-700 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                                  Voir
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== CUSTOM ORDERS ===== */}
            {activeTab === 'custom' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-900">Commandes Sur Mesure ({effectiveCustomOrders.length})</h3>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {effectiveCustomOrders.length === 0 ? (
                    <div className="py-12 text-center">
                      <Package size={40} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Aucune demande personnalisee.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3">Projet ID</th>
                            <th className="px-6 py-3">Client</th>
                            <th className="px-6 py-3">Produit</th>
                            <th className="px-6 py-3">Images</th>
                            <th className="px-6 py-3">Statut</th>
                            <th className="px-6 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {effectiveCustomOrders.map((ord) => (
                            <tr key={ord.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-mono text-gray-900">{ord.id}</td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-medium text-gray-900 block">{ord.full_name || ord.fullName}</span>
                                <span className="text-xs text-gray-500 block">{ord.whatsapp}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-gray-900 capitalize block">{ord.product_type || ord.productType}</span>
                                <span className="text-xs text-gray-500 block">{ord.size}</span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{ord.images?.length || 0} image(s)</td>
                              <td className="px-6 py-4">
                                <StatusBadge status={ord.status} />
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => setSelectedOrderDetails(ord)}
                                  className="px-3 py-1.5 bg-white border border-gray-200 hover:border-[#B54A3A]/30 hover:bg-[#B54A3A]/5 text-gray-700 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                                  Gerer
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== REVIEWS ===== */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Avis Clients ({totalReviews})</h3>
                  <button
                    onClick={() => { setShowReviewForm(!showReviewForm); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#B54A3A] hover:bg-[#9A3D2F] text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"
                  >
                    <Plus size={16} /> Ajouter
                  </button>
                </div>

                {showReviewForm && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un Avis</h3>
                    <form onSubmit={handleAddReview} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1.5">Nom de l'auteur</label>
                          <input type="text" required value={reviewForm.author} onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                            placeholder="Ex: Mohammed B."
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1.5">Note</label>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })} className="cursor-pointer p-0.5">
                                <Star size={28} className={star <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Commentaire</label>
                        <textarea rows="3" required value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all resize-none" />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="submit"
                          className="bg-[#B54A3A] hover:bg-[#9A3D2F] text-white text-sm font-medium py-2.5 px-5 rounded-lg cursor-pointer transition-colors">
                          Publier
                        </button>
                        <button type="button" onClick={() => setShowReviewForm(false)}
                          className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium py-2.5 px-5 rounded-lg cursor-pointer transition-colors">
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {effectiveFeedbacks.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-12 text-center">
                    <MessageSquare size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Aucun avis pour le moment.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {effectiveFeedbacks.map((fb) => (
                      <div key={fb.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-semibold text-gray-900">{fb.author}</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={12} className={s <= fb.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">{fb.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed italic">"{fb.comment}"</p>
                        </div>
                        <button onClick={() => handleDeleteReview(fb.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer flex-shrink-0 transition-colors" title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== OFFERS ===== */}
            {activeTab === 'offers' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Offres & Promotions ({effectiveOffers.length})</h3>
                  <button
                    onClick={() => { resetOfferForm(); setShowOfferForm(!showOfferForm); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#B54A3A] hover:bg-[#9A3D2F] text-white rounded-lg text-sm font-medium cursor-pointer shrink-0 transition-colors"
                  >
                    <Plus size={16} /> Nouvelle Offre
                  </button>
                </div>

                {showOfferForm && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingOffer ? "Modifier l'Offre" : 'Nouvelle Offre'}
                    </h3>
                    <form onSubmit={handleOfferSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1.5">Titre</label>
                          <input type="text" required value={offerForm.title} onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                            placeholder="Ex: Soldes d'ete"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1.5">Type de remise</label>
                          <select value={offerForm.discount_type} onChange={(e) => setOfferForm({ ...offerForm, discount_type: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all">
                            <option value="percentage">Pourcentage (%)</option>
                            <option value="fixed">Montant fixe (DH)</option>
                            <option value="bundle">Bundle (prix groupe)</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1.5">Valeur</label>
                          <input type="number" required min="0" value={offerForm.discount_value} onChange={(e) => setOfferForm({ ...offerForm, discount_value: Number(e.target.value) })}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1.5">Description</label>
                          <input type="text" value={offerForm.description} onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                            placeholder="Optionnel"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1.5">Date de debut</label>
                          <input type="date" value={offerForm.start_date} onChange={(e) => setOfferForm({ ...offerForm, start_date: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1.5">Date de fin</label>
                          <input type="date" value={offerForm.end_date} onChange={(e) => setOfferForm({ ...offerForm, end_date: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={offerSaving}
                          className="bg-[#B54A3A] hover:bg-[#9A3D2F] text-white text-sm font-medium py-2.5 px-5 rounded-lg cursor-pointer disabled:opacity-50 transition-colors">
                          {offerSaving ? 'Envoi...' : editingOffer ? 'Enregistrer' : "Creer l'offre"}
                        </button>
                        <button type="button" onClick={resetOfferForm}
                          className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium py-2.5 px-5 rounded-lg cursor-pointer transition-colors">
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {effectiveOffers.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-12 text-center">
                    <Tag size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Aucune offre pour le moment.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {effectiveOffers.map((offer) => (
                      <div key={offer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-semibold text-gray-900">{offer.title}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              offer.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {offer.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {offer.discount_type === 'percentage' && `${offer.discount_value}% de remise`}
                            {offer.discount_type === 'fixed' && `${offer.discount_value} DH de remise`}
                            {offer.discount_type === 'bundle' && `Prix bundle: ${offer.discount_value} DH`}
                          </p>
                          {(offer.start_date || offer.end_date) && (
                            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                              <Calendar size={12} />
                              {offer.start_date || '...'} — {offer.end_date || '...'}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggleOfferActive(offer)}
                            className={`p-2 rounded-lg border cursor-pointer transition-colors ${offer.active ? 'border-green-200 text-green-600 hover:bg-green-50' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                            title={offer.active ? 'Desactiver' : 'Activer'}>
                            {offer.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button onClick={() => handleEditOffer(offer)}
                            className="p-2 rounded-lg border border-gray-200 hover:border-[#B54A3A]/30 hover:bg-[#B54A3A]/5 text-gray-500 hover:text-[#B54A3A] cursor-pointer transition-colors" title="Modifier">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteOffer(offer.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer transition-colors" title="Supprimer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== GALLERY ===== */}
            {activeTab === 'gallery' && (
              <div className="space-y-6 animate-fade-in max-w-lg">
                <h3 className="text-lg font-semibold text-gray-900">Televerser dans la Galerie</h3>

                {addGallerySuccess && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm font-medium text-green-700">
                    <Check size={16} /> Image ajoutee avec succes !
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <form onSubmit={handleAddGalleryItem} className="space-y-5">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1.5">Titre de l'oeuvre</label>
                      <input type="text" required value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)}
                        placeholder="Ex: Luffy Gear 5 Parchment"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1.5">Categorie</label>
                      <select value={galleryCategory} onChange={(e) => setGalleryCategory(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all">
                        <option value="anime">Anime Art</option>
                        <option value="gaming">Gaming</option>
                        <option value="football">Football</option>
                        <option value="custom">Custom</option>
                        <option value="movies">Cinema</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1.5">Image</label>
                      <label className="flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#B54A3A]/40 rounded-xl p-6 cursor-pointer transition-colors text-center">
                        <Upload size={28} className="text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-600">
                          {galleryImageFile ? galleryImageFile.name : 'Cliquez pour choisir une image'}
                        </span>
                        <input type="file" required accept="image/*" className="hidden" onChange={handleGalleryFileSelect} />
                      </label>
                    </div>
                    {galleryImagePreview && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium block mb-2">Apercu</span>
                        <div className="w-32 h-32 border border-gray-200 rounded-xl overflow-hidden">
                          <img src={galleryImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                    <button type="submit"
                      className="bg-[#B54A3A] hover:bg-[#9A3D2F] text-white text-sm font-medium py-2.5 px-5 rounded-lg cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                      <Check size={16} /> Ajouter
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ===== DISCOUNTS ===== */}
            {activeTab === 'discounts' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-900">Codes Promo ({discountCodes.length})</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Codes Actifs</h4>
                    {discountCodes.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">Aucun code promo actif.</p>
                    ) : (
                      <div className="space-y-2">
                        {discountCodes.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                              <span className="bg-[#B54A3A]/10 text-[#B54A3A] font-mono font-bold text-xs px-2.5 py-1 rounded-md uppercase tracking-wider">{item.code}</span>
                              <span className="text-sm text-gray-500 font-medium">-{item.percentage}%</span>
                            </div>
                            <button onClick={() => handleRemoveDiscount(item.id)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer transition-colors" title="Supprimer">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Generer un Coupon</h4>
                    <form onSubmit={handleAddDiscount} className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Code</label>
                        <input type="text" required value={newCodeName} onChange={(e) => setNewCodeName(e.target.value)} placeholder="Ex: TARIQ20"
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Pourcentage (%)</label>
                        <input type="number" required min="5" max="95" value={newCodePercentage} onChange={(e) => setNewCodePercentage(Number(e.target.value))}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all" />
                      </div>
                      <button type="submit"
                        className="bg-[#B54A3A] hover:bg-[#9A3D2F] text-white text-sm font-medium py-2.5 px-5 rounded-lg cursor-pointer transition-colors">
                        Enregistrer
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* ===== SETTINGS ===== */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings size={20} className="text-gray-400" /> Parametres du Store
                </h3>

                {settingsSaved && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm font-medium text-green-700">
                    <Check size={16} /> Parametres enregistres !
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck size={16} className="text-gray-400" /> Livraison et Commandes
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1.5">Frais de livraison (DH)</label>
                      <input
                        type="number"
                        min="0"
                        value={deliveryFee}
                        onChange={(e) => setDeliveryFee(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all"
                      />
                      <p className="text-xs text-gray-400 mt-1">Montant fixe charge au client</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1.5">Quantite min. par commande</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={minOrderQty}
                        onChange={(e) => setMinOrderQty(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all"
                      />
                      <p className="text-xs text-gray-400 mt-1">Nombre minimum d'articles requis</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <LayoutDashboard size={16} className="text-gray-400" /> Sections Homepage
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'showInstagram', label: 'Section Instagram Reels', icon: ImageIcon },
                      { key: 'showTiktok', label: 'Section TikTok', icon: Package },
                      { key: 'showGallery', label: 'Section Galerie', icon: ImageIcon },
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </div>
                        <button
                          onClick={() => setSiteSettings(s => ({ ...s, [key]: !s[key] }))}
                          className="cursor-pointer"
                        >
                          {siteSettings[key] ? (
                            <ToggleRight size={32} className="text-[#B54A3A]" />
                          ) : (
                            <ToggleLeft size={32} className="text-gray-300" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Send size={16} className="text-gray-400" /> Telegram Notifications
                  </h4>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                    <div className="flex items-center gap-2.5">
                      <Send size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Activer les notifications Telegram</span>
                    </div>
                    <button onClick={() => setTgEnabled(v => !v)} className="cursor-pointer">
                      {tgEnabled ? (
                        <ToggleRight size={32} className="text-[#B54A3A]" />
                      ) : (
                        <ToggleLeft size={32} className="text-gray-300" />
                      )}
                    </button>
                  </div>

                  {tgEnabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Bot Token</label>
                        <input
                          type="password"
                          value={tgToken}
                          onChange={(e) => setTgToken(e.target.value)}
                          placeholder="123456:ABC-DEF..."
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all font-mono"
                        />
                        <p className="text-xs text-gray-400 mt-1">Recuperez via @BotFather sur Telegram</p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Chat ID</label>
                        <input
                          type="text"
                          value={tgChatId}
                          onChange={(e) => setTgChatId(e.target.value)}
                          placeholder="-1001234567890"
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all font-mono"
                        />
                        <p className="text-xs text-gray-400 mt-1">Recuperez via @userinfobot ou en ajoutant le bot a un groupe</p>
                      </div>

                      <button
                        onClick={handleTelegramTest}
                        disabled={!tgToken || !tgChatId || tgTestStatus === 'sending'}
                        className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-sm font-medium py-2 px-5 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors"
                      >
                        {tgTestStatus === 'sending' ? 'Envoi...' : tgTestStatus === 'success' ? 'Envoye !' : tgTestStatus === 'error' ? 'Echec' : 'Tester la connexion'}
                        {tgTestStatus === 'success' && <Check size={14} className="text-green-500" />}
                        {tgTestStatus === 'error' && <X size={14} className="text-red-500" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* ── WhatsApp Order Configuration ── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Send size={16} className="text-gray-400" /> Configuration WhatsApp
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1.5">Numero WhatsApp (format international)</label>
                      <input
                        type="text"
                        value={waPhone}
                        onChange={(e) => setWaPhone(e.target.value)}
                        placeholder="212623391688"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all font-mono"
                      />
                      <p className="text-xs text-gray-400 mt-1">Sans le + — ex: 212623391688</p>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <ImageIcon size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Envoyer les images dans le message</span>
                      </div>
                      <button onClick={() => setWaImagesEnabled(v => !v)} className="cursor-pointer">
                        {waImagesEnabled ? (
                          <ToggleRight size={32} className="text-[#B54A3A]" />
                        ) : (
                          <ToggleLeft size={32} className="text-gray-300" />
                        )}
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1.5">Prefixe du message (optionnel)</label>
                      <input
                        type="text"
                        value={waPrefix}
                        onChange={(e) => setWaPrefix(e.target.value)}
                        placeholder="Bonjour, je souhaite commander..."
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1.5">Suffixe du message (optionnel)</label>
                      <input
                        type="text"
                        value={waSuffix}
                        onChange={(e) => setWaSuffix(e.target.value)}
                        placeholder="Merci !"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1.5">Modele du message WhatsApp</label>
                      <p className="text-[10px] text-gray-400 mb-1.5">Variables disponibles: {'{{ref}}'} {'{{name}}'} {'{{phone}}'} {'{{city}}'} {'{{address}}'} {'{{notes}}'} {'{{items}}'} {'{{coupon}}'} {'{{savings}}'} {'{{subtotal}}'} {'{{delivery}}'} {'{{total}}'} {'{{images}}'} {'{{prefix}}'} {'{{suffix}}'}</p>
                      <textarea
                        value={waTemplate}
                        onChange={(e) => setWaTemplate(e.target.value)}
                        rows={12}
                        placeholder="Laissez vide pour le modele par defaut"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all resize-none"
                      />
                      <button
                        onClick={() => setWaTemplate('')}
                        className="text-[10px] text-gray-400 hover:text-gray-600 font-bold mt-1 cursor-pointer"
                      >
                        Reinitialiser au modele par defaut
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Change Password ── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock size={16} className="text-gray-400"> </Lock> Changer le mot de passe
                  </h4>

                  {pwdStatus === 'success' ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm font-medium text-green-700">
                      <Check size={16} /> Mot de passe modifie. Redirection vers la connexion...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pwdError && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700">
                          <X size={16} /> {pwdError}
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Mot de passe actuel</label>
                        <input
                          type="password"
                          value={pwdCurrent}
                          onChange={(e) => setPwdCurrent(e.target.value)}
                          placeholder="Entrez votre mot de passe actuel"
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Nouveau mot de passe</label>
                        <input
                          type="password"
                          value={pwdNew}
                          onChange={(e) => setPwdNew(e.target.value)}
                          placeholder="Minimum 8 caracteres"
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all"
                        />
                        {pwdNew && (
                          <div className="mt-1.5 flex gap-1">
                            {[1, 2, 3].map(i => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                  pwdNew.length >= i * 4
                                    ? pwdNew.length >= 12 ? 'bg-green-500' : pwdNew.length >= 8 ? 'bg-yellow-500' : 'bg-red-400'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {pwdNew.length === 0 ? 'Minimum 8 caracteres' : pwdNew.length < 8 ? `${8 - pwdNew.length} caracteres restants` : pwdNew.length >= 12 ? 'Excellent' : pwdNew.length >= 10 ? 'Bon' : 'Acceptable'}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Confirmer le nouveau mot de passe</label>
                        <input
                          type="password"
                          value={pwdConfirm}
                          onChange={(e) => setPwdConfirm(e.target.value)}
                          placeholder="Retapez le nouveau mot de passe"
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] outline-none transition-all"
                        />
                        {pwdConfirm && (
                          <p className={`text-xs mt-1 ${pwdNew === pwdConfirm ? 'text-green-600' : 'text-red-500'}`}>
                            {pwdNew === pwdConfirm ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleChangePassword}
                        disabled={pwdStatus === 'loading' || !pwdCurrent || !pwdNew || !pwdConfirm}
                        className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 px-6 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors"
                      >
                        {pwdStatus === 'loading' ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" /> Modification en cours...
                          </>
                        ) : (
                          <>
                            <Lock size={14} /> Modifier le mot de passe
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="bg-[#B54A3A] hover:bg-[#9A3D2F] text-white text-sm font-medium py-2.5 px-6 rounded-lg cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <Check size={16} /> Enregistrer les parametres
                </button>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Confirmer la suppression</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {deleteConfirm.type === 'product' && `Supprimer "${deleteConfirm.name}" ?`}
                  {deleteConfirm.type === 'feedback' && 'Supprimer cet avis ?'}
                  {deleteConfirm.type === 'offer' && 'Supprimer cette offre ?'}
                  {deleteConfirm.type === 'discount' && 'Supprimer ce code promo ?'}
                  {deleteConfirm.type === 'category' && 'Supprimer cette categorie ?'}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors">
                Annuler
              </button>
              <button onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Order Detail Modal ── */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedOrderDetails(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedOrderDetails(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>

            <div className="mb-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Fiche Commande</p>
              <h3 className="text-lg font-bold text-gray-900 font-mono mt-0.5">{selectedOrderDetails.id}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Date : {selectedOrderDetails.created_at}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Client</p>
                <p className="text-sm font-medium text-gray-900">{selectedOrderDetails.customer_name}</p>
                <p className="text-xs text-gray-500">Tel: {selectedOrderDetails.phone}</p>
                <p className="text-xs text-gray-500">WhatsApp: {selectedOrderDetails.whatsapp}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Livraison</p>
                <p className="text-sm text-gray-700">{selectedOrderDetails.address}</p>
                <p className="text-sm font-medium text-gray-900 uppercase">{selectedOrderDetails.city}</p>
              </div>
            </div>

            {(() => {
              let images = selectedOrderDetails.images || '[]';
              if (typeof images === 'string') { try { images = JSON.parse(images); } catch { images = []; } }
              if (!Array.isArray(images)) images = [];
              return images.length > 0 && (
                <div className="py-4 border-b border-gray-100">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Fichiers Televerses</p>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((imgBase64, idx) => (
                      <a key={idx} href={imgBase64} target="_blank" rel="noopener noreferrer"
                        className="border border-gray-200 rounded-lg overflow-hidden aspect-square block hover:opacity-80 transition-opacity">
                        <img src={imgBase64} alt="Upload" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}

            {(() => {
              let items = selectedOrderDetails.products || '[]';
              if (typeof items === 'string') { try { items = JSON.parse(items); } catch { items = []; } }
              if (!Array.isArray(items)) items = [];
              if (items.length === 0) return null;
              return (
                <div className="py-4 border-b border-gray-100 space-y-2">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Articles commandes</p>
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{item.name}</p>
                        <p className="text-xs text-gray-500">x{item.quantity} — {item.size || 'N/A'}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{(item.price || 0) * (item.quantity || 1)} DH</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {selectedOrderDetails.instructions && (
              <div className="py-4 border-b border-gray-100">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Instructions</p>
                <p className="text-sm text-gray-600 italic bg-gray-50 rounded-lg p-3">"{selectedOrderDetails.instructions}"</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 gap-4">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Montant</p>
                <p className="text-xl font-bold text-gray-900">{selectedOrderDetails.total} DH</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Statut :</span>
                <select value={selectedOrderDetails.status}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    setSelectedOrderDetails(prev => ({ ...prev, status: nextVal }));
                    handleStatusChange(selectedOrderDetails.id, nextVal);
                  }}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#B54A3A]/20 focus:border-[#B54A3A] transition-all">
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirme</option>
                  <option value="processing">En Production</option>
                  <option value="shipped">Expedie</option>
                  <option value="delivered">Livre</option>
                  <option value="cancelled">Annule</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-[8px] uppercase tracking-wider ${
    status === 'delivered' ? 'bg-green-100 text-green-700' :
    status === 'shipped' ? 'bg-blue-100 text-blue-700' :
    status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
  }`}>{status}</span>
);

export default AdminDashboard;
