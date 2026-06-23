import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, ShoppingBag, X, Package, AlertTriangle, CreditCard } from 'lucide-react';
import { api, getSocket, checkBackendAvailable } from '../lib/api';

const NotificationBell = ({ onNewOrder }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const dropdownRef = useRef(null);
  const audioRef = useRef(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRl9vT19teleVBmb3JtYXQgdjIgaW5mbzwvZGl2Pg==');
    audioRef.current.volume = 0.3;
  }, []);

  const addToast = useCallback((notification) => {
    const toastId = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...notification, toastId }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.toastId !== toastId)), 6000);
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        api.notifications.list(30),
        api.notifications.unreadCount(),
      ]);
      setNotifications(notifs.notifications || []);
      setUnreadCount(count.count || 0);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    let socket = null;
    let mounted = true;

    const connectSocket = async () => {
      const available = await checkBackendAvailable();
      if (!available || !mounted) return;
      if (connectedRef.current) return;

      socket = await getSocket();
      if (!mounted) return;
      connectedRef.current = true;

      socket.on('new_order', (data) => {
        if (!mounted) return;
        const { notification, data: orderData } = data;
        if (notification) {
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          addToast(notification);
          try { audioRef.current?.play().catch(() => {}); } catch {}
        }
        if (onNewOrder) onNewOrder(orderData);
      });

      socket.on('notification', (data) => {
        if (!mounted) return;
        const { notification } = data;
        if (notification) {
          setNotifications(prev => {
            if (prev.some(n => n.id === notification.id)) return prev;
            return [notification, ...prev];
          });
          setUnreadCount(prev => prev + 1);
          addToast(notification);
          try { audioRef.current?.play().catch(() => {}); } catch {}
        }
      });

      socket.on('disconnect', () => { connectedRef.current = false; });
      socket.on('connect', () => { connectedRef.current = true; });
    };

    connectSocket();

    return () => {
      mounted = false;
      if (socket) {
        socket.off('new_order');
        socket.off('notification');
      }
    };
  }, [onNewOrder, addToast]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
      setUnreadCount(0);
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await api.notifications.delete(id);
      const notif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notif && !notif.read) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleClick = (notif) => {
    handleMarkRead(notif.id);
    setOpen(false);
    if (notif.order_id) navigate('/admin?tab=orders', { state: { highlightOrder: notif.order_id } });
  };

  const removeToast = (toastId) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'Z');
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return "A l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Bell size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-medium bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-[#B54A3A] hover:text-[#9A3D2F] font-medium cursor-pointer">
                  Tout marquer lu
                </button>
              )}
            </div>

            <div className="max-h-[380px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => handleClick(notif)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      notif.type === 'order' ? 'bg-blue-50' : notif.type === 'payment' ? 'bg-green-50' : notif.type === 'stock' ? 'bg-amber-50' : 'bg-gray-100'
                    }`}>
                      {notif.type === 'order' ? (
                        <ShoppingBag size={14} className="text-blue-600" />
                      ) : notif.type === 'payment' ? (
                        <CreditCard size={14} className="text-green-600" />
                      ) : notif.type === 'stock' ? (
                        <AlertTriangle size={14} className="text-amber-600" />
                      ) : (
                        <Package size={14} className="text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && <span className="w-2 h-2 bg-[#B54A3A] rounded-full shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatTime(notif.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {!notif.read && (
                        <button onClick={() => handleMarkRead(notif.id)} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 cursor-pointer" title="Marquer lu">
                          <Check size={12} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(notif.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer" title="Supprimer">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => { setOpen(false); navigate('/admin?tab=orders'); }}
                  className="w-full text-center text-xs font-medium text-[#B54A3A] hover:text-[#9A3D2F] cursor-pointer"
                >
                  Voir toutes les commandes
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.toastId}
            className="pointer-events-auto bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-[340px] animate-slide-in-right"
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                toast.type === 'order' ? 'bg-blue-50' : toast.type === 'payment' ? 'bg-green-50' : toast.type === 'stock' ? 'bg-amber-50' : 'bg-gray-100'
              }`}>
                {toast.type === 'order' ? (
                  <ShoppingBag size={16} className="text-blue-600" />
                ) : toast.type === 'payment' ? (
                  <CreditCard size={16} className="text-green-600" />
                ) : toast.type === 'stock' ? (
                  <AlertTriangle size={16} className="text-amber-600" />
                ) : (
                  <Package size={16} className="text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{toast.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">A l'instant</p>
              </div>
              <button onClick={() => removeToast(toast.toastId)} className="p-1 rounded hover:bg-gray-100 text-gray-400 cursor-pointer shrink-0">
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationBell;
