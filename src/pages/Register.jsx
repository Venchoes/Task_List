// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { add } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ name, email, password });
      add('Cadastro realizado com sucesso. Faça login.', 'success');
      navigate('/login');
    } catch (err) {
      // Mostrar erro detalhado retornado pelo servidor quando disponível
      console.error('Register error', err);
      let serverMsg = err?.data?.message || err?.data || err?.message;
      if (typeof serverMsg !== 'string') {
        try { serverMsg = JSON.stringify(serverMsg); } catch { serverMsg = String(serverMsg); }
      }
      add(serverMsg || 'Falha no cadastro', 'error');
    } finally { setLoading(false); }
  }

  return (
    <div className="w-screen h-screen bg-blue-200 flex justify-center p-6">
      <div className="w-[420px] space-y-6">
        <h1 className="text-3xl text-black font-bold text-center">Register</h1>
        <form onSubmit={onSubmit} className="space-y-4 p-6 bg-white rounded-md shadow">
          <input required placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
          <input type="email" required placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
          <input type="password" required placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-black px-4 py-2 rounded flex-1" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
            <button type="button" onClick={() => navigate('/login')} className="bg-red-300 px-4 py-2 rounded">Back</button>
          </div>
        </form>
      </div>
    </div>
  );
}
