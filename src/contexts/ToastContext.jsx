// src/contexts/ToastContext.jsx
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'info', timeout = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((s) => [...s, { id, message, type }]);
    if (timeout) setTimeout(() => setToasts((s) => s.filter(t => t.id !== id)), timeout);
  }, []);

  const remove = useCallback((id) => setToasts((s) => s.filter(t => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toasts, add, remove }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }
