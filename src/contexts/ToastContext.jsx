// src/contexts/ToastContext.jsx
import { createContext, useCallback, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'info', timeout = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((s) => [...s, { id, message, type }]);
    if (timeout) setTimeout(() => setToasts((s) => s.filter(t => t.id !== id)), timeout);
  }, []);

  const remove = useCallback((id) => setToasts((s) => s.filter(t => t.id !== id)), []);
  const removeByMessage = useCallback((message) => setToasts((s) => s.filter(t => t.message !== message)), []);

  // show toast when token expires (dispatched by AuthContext)
  // The event name 'tokenExpired' is emitted on window by AuthProvider.
  useEffect(() => {
    function onTokenExpired() {
      add('Sessão expirada. Faça login novamente.', 'error');
    }
    try {
      window.addEventListener('tokenExpired', onTokenExpired);
    } catch (e) {
      // ignore environments without window
    }
    return () => {
      try { window.removeEventListener('tokenExpired', onTokenExpired); } catch {}
    };
  }, [add]);

  // when user logs out manually, remove any session-expired toast so it doesn't reappear
  useEffect(() => {
    function onUserLogout() {
      try { removeByMessage('Sessão expirada. Faça login novamente.'); } catch {}
    }
    try {
      window.addEventListener('userLogout', onUserLogout);
    } catch (e) {}
    return () => { try { window.removeEventListener('userLogout', onUserLogout); } catch {} };
  }, [removeByMessage]);

  return (
    <ToastContext.Provider value={{ toasts, add, remove, removeByMessage }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }
