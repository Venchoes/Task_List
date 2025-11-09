// src/contexts/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { post } from '../services/api';

// AuthContext que integra com o backend via src/services/api.js
const AuthContext = createContext();

const TOKEN_TTL_MS = 1000 * 60 * 10; // fallback quando backend não fornecer exp

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload;
    }
    // some backends might return a base64 payload only
    try { return JSON.parse(atob(token)); } catch { return null; }
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [tokenExpiry, setTokenExpiry] = useState(() => {
    const v = localStorage.getItem('token_expiry');
    return v ? Number(v) : null;
  });
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const logoutTimer = useRef(null);

  useEffect(() => {
    if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (tokenExpiry) localStorage.setItem('token_expiry', String(tokenExpiry)); else localStorage.removeItem('token_expiry');
  }, [tokenExpiry]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    // setup auto logout when token expires
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }
    if (token && tokenExpiry) {
      const ms = tokenExpiry - Date.now();
      if (ms <= 0) {
        // already expired
        setToken(null);
        setTokenExpiry(null);
        setUser(null);
      } else {
        logoutTimer.current = setTimeout(() => {
          setToken(null);
          setTokenExpiry(null);
          setUser(null);
          try { window.dispatchEvent(new Event('tokenExpired')) } catch {}
        }, ms);
      }
    }
    return () => { if (logoutTimer.current) clearTimeout(logoutTimer.current); };
  }, [token, tokenExpiry]);

  const isTokenValid = useCallback(() => {
    return !!token && !!tokenExpiry && tokenExpiry > Date.now();
  }, [token, tokenExpiry]);

  // register: chama backend POST /register
  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    try {
      // rota no backend: POST /register
      const res = await post('/register', { name, email, password });
      return res;
    } finally { setLoading(false); }
  }, []);

  // login: chama backend POST /login e guarda token retornado
  const login = useCallback(async ({ email, password, ttlMs } = {}) => {
    setLoading(true);
    try {
      // rota no backend: POST /login
      const res = await post('/login', { email, password });

      // Resiliência: aceitar formatos comuns { token, user } ou { accessToken, user }
      const tokenValue = res?.token || res?.accessToken || res?.access_token || null;
      const userValue = res?.user || res?.userData || null;

      if (!tokenValue) {
        const err = new Error('Token not returned from server');
        err.status = 500;
        throw err;
      }

      // try to get expiry from JWT payload
      let expiryMs = null;
      const payload = decodeJwtPayload(tokenValue);
      if (payload && typeof payload.exp === 'number') {
        // exp may be seconds (typical) or millis; normalize to ms
        expiryMs = payload.exp > 1e12 ? payload.exp : payload.exp * 1000;
      } else if (typeof ttlMs === 'number') {
        expiryMs = Date.now() + ttlMs;
      } else {
        expiryMs = Date.now() + TOKEN_TTL_MS;
      }

      setToken(tokenValue);
      setTokenExpiry(expiryMs);
      if (userValue) setUser(userValue);

      return { token: tokenValue, user: userValue, expiry: expiryMs };
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpiry(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('user');
    // dispatch a distinct event for manual logout so it doesn't show the 'tokenExpired' toast
    try { window.dispatchEvent(new Event('userLogout')) } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ token, tokenExpiry, user, loading, login, logout, register, isTokenValid }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
