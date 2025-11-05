// src/contexts/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// AuthContext with a mock in-memory/localStorage backend so frontend works standalone
const AuthContext = createContext();

const TOKEN_TTL_MS = 1000 * 60 * 10; // 10 minutes by default (you can reduce for testing)

function readUsers() {
  try { return JSON.parse(localStorage.getItem('mock_users') || '[]'); } catch { return []; }
}

function writeUsers(users) {
  localStorage.setItem('mock_users', JSON.stringify(users));
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
        }, ms);
      }
    }
    return () => { if (logoutTimer.current) clearTimeout(logoutTimer.current); };
  }, [token, tokenExpiry]);

  const isTokenValid = useCallback(() => {
    return !!token && !!tokenExpiry && tokenExpiry > Date.now();
  }, [token, tokenExpiry]);

  // mock register: store user in localStorage
  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 400)); // simulate network
      const users = readUsers();
      if (users.find(u => u.email === email)) {
        const err = new Error('Email already registered');
        err.status = 400;
        throw err;
      }
      const newUser = { id: String(Date.now()) + Math.floor(Math.random() * 1000), name, email, password };
      users.push(newUser);
      writeUsers(users);
      return { ok: true };
    } finally { setLoading(false); }
  }, []);

  // mock login: validate against local users and create a token with expiry
  const login = useCallback(async ({ email, password, ttlMs } = {}) => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      const users = readUsers();
      const found = users.find(u => u.email === email && u.password === password);
      if (!found) {
        const err = new Error('Invalid credentials');
        err.status = 401;
        throw err;
      }
      const ttl = typeof ttlMs === 'number' ? ttlMs : TOKEN_TTL_MS;
      const expiry = Date.now() + ttl;
      const tokenValue = btoa(JSON.stringify({ sub: found.id, exp: expiry }));
      setToken(tokenValue);
      setTokenExpiry(expiry);
      setUser({ id: found.id, name: found.name, email: found.email });
      return { token: tokenValue, user: { id: found.id, name: found.name, email: found.email }, expiry };
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpiry(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('user');
  }, []);

  return (
    <AuthContext.Provider value={{ token, tokenExpiry, user, loading, login, logout, register, isTokenValid }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
