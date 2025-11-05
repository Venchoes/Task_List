// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = options.headers || {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

  if (!res.ok) {
    const error = new Error(data?.message || res.statusText || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function post(path, body) { return request(path, { method: 'POST', body }); }
export async function get(path) { return request(path, { method: 'GET' }); }
export async function put(path, body) { return request(path, { method: 'PUT', body }); }
export async function del(path) { return request(path, { method: 'DELETE' }); }

export default { request, post, get, put, del };
