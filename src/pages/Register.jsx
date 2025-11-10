// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { API_BASE } from '../services/api';

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
      console.error('Register error', err);

      // Formatação enriquecida do erro para o toast
      const status = err?.status;
      const code = err?.code;
      const isNetwork = code === 'NETWORK_ERROR';
      const isCorsLikely = err?.isCorsLikely;
      const rawServerMessage = err?.data?.message || err?.data || err?.message;
      let detail = typeof rawServerMessage === 'string' ? rawServerMessage : undefined;
      if (!detail && rawServerMessage) {
        try { detail = JSON.stringify(rawServerMessage); } catch {}
      }

      let hint = '';
      if (isNetwork) {
        if (isCorsLikely) {
          hint = 'Possível bloqueio de CORS. Verifique se está usando URL relativa ou habilite CORS no backend.';
        } else {
          hint = 'Falha de rede. Verifique se o backend está acessível.';
        }
      } else if (status === 422) {
        hint = 'Dados inválidos. Confirme nome, email e senha.';
      } else if (status === 401) {
        hint = 'Não autorizado. Faça login novamente.';
      } else if (status === 409) {
        hint = 'Usuário já existe.';
      } else if (status >= 500) {
        hint = 'Erro interno do servidor. Tente novamente em instantes.';
      }

      const parts = [
        'Erro ao cadastrar',
        status ? `(status ${status})` : (isNetwork ? '(rede)' : ''),
        detail ? `: ${detail}` : '',
        hint ? `\n${hint}` : '',
        API_BASE ? `\nBase API: ${API_BASE || '(relativa)'}` : ''
      ].filter(Boolean);
      add(parts.join(' '), 'error', 8000); // timeout maior para ler detalhes
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
