// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { add } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login({ email, password });
      add('Login successful', 'success');
      navigate('/');
    } catch (err) {
      console.error('Login error', err);
      let serverMsg = err?.data?.message || err?.data || err?.message;
      if (typeof serverMsg !== 'string') {
        try { serverMsg = JSON.stringify(serverMsg); } catch { serverMsg = String(serverMsg); }
      }
      add(serverMsg || 'Failed to login', 'error');
    } finally { setLoading(false); }
  }

  return (
    <div className="w-screen h-screen bg-blue-200 flex justify-center p-6">
      <div className="w-[420px] space-y-6">
        <h1 className="text-3xl text-black font-bold text-center">Login</h1>
        <form onSubmit={onSubmit} className="space-y-4 p-6 bg-white rounded-md shadow">
          <input type="email" required placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
          <input type="password" required placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-300 text-black px-4 py-2 rounded flex-1" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
            <button type="button" onClick={() => navigate('/register')} className="bg-yellow-200 px-4 py-2 rounded">Sign Up</button>
          </div>
        </form>
      </div>
    </div>
  );
}
