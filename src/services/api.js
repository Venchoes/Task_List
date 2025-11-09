// src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'

/**
 * Retorna headers de autorização quando existir token salvo no localStorage.
 * Sempre retorna um Record<string,string> para ser compatível com fetch.
 */
export function getAuthHeaders(){
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function joinUrl(base, path){
  const a = String(base).replace(/\/+$/,'')
  const b = String(path).replace(/^\/+/,'')
  return `${a}/${b}`
}

/**
 * Realiza uma requisição fetch para a API configurada em VITE_API_BASE.
 * Normaliza headers, trata JSON e lança erro com informações úteis.
 * @param {string} path caminho a partir da base da API (ex: '/login')
 * @param {RequestInit} opts
 */
export async function request(path, opts = {}){
  const url = joinUrl(API_BASE, path)
  const method = (opts.method || 'GET').toUpperCase()
  try { window.dispatchEvent(new CustomEvent('apiRequestStart', { detail: { url, method } })) } catch {}

  // Normalize headers into a Headers instance
  const headers = new Headers()
  if (opts.headers) {
    const h = opts.headers
    if (h instanceof Headers) {
      h.forEach((value, key) => headers.set(key, value))
    } else if (Array.isArray(h)) {
      h.forEach(([key, value]) => headers.set(key, value))
    } else if (typeof h === 'object') {
      Object.entries(h).forEach(([key, value]) => { if (value != null) headers.set(key, value) })
    }
  }

  // add auth header if not present
  if (!headers.has('Authorization')) {
    const auth = getAuthHeaders()
    if (auth.Authorization) headers.set('Authorization', auth.Authorization)
  }

  // decide default content-type only when body is present and not FormData
  const body = opts.body
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  if (body != null && !isForm && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // prepare final options: stringify body when appropriate
  const finalOpts = { ...opts, headers }
  if (body != null && !isForm && typeof body !== 'string' && !(body instanceof Blob)) {
    try { finalOpts.body = JSON.stringify(body) } catch(e) { /* leave as-is if cannot stringify */ }
  }

  let res
  try {
    if (import.meta.env.DEV) {
      try { console.debug('[api] fetch', { url, opts: finalOpts, API_BASE }) } catch {}
    }

    // client-side token expiry check (best-effort)
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const parts = token.split('.')
        let payload = null
        if (parts.length === 3) {
          try { payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/'))) } catch(e){}
        } else {
          try { payload = JSON.parse(atob(token)) } catch(e){}
        }
        if (payload && typeof payload.exp === 'number'){
          const now = Math.floor(Date.now()/1000)
          if (payload.exp < now) {
            try { localStorage.removeItem('token') } catch {}
            try { window.dispatchEvent(new Event('tokenExpired')) } catch {}
            const err = new Error('Token expirado')
            err.code = 'TOKEN_EXPIRED'
            throw err
          }
        }
      }
    } catch(e) { /* non-blocking */ }

    try {
      res = await fetch(url, finalOpts)
    } catch (e) {
      const message = `Network error when fetching ${url}: ${e?.message || String(e)}`
      const err = new Error(message)
      err.cause = e
      throw err
    }

    const text = await res.text()
    let data = null
    try { data = text ? JSON.parse(text) : null } catch(e){ data = text }

    if (!res.ok) {
      if (res.status === 401) {
        try { localStorage.removeItem('token') } catch {}
        try { window.dispatchEvent(new Event('tokenExpired')) } catch {}
      }
      const message = (data && typeof data === 'object' && 'message' in data) ? data.message : res.statusText || 'Erro na requisição'
      const err = new Error(String(message))
      err.status = res.status
      err.data = data
      throw err
    }
    return data
  } finally {
    try { window.dispatchEvent(new CustomEvent('apiRequestEnd', { detail: { url, method } })) } catch {}
  }
}

export async function get(path, opts = {}) { return request(path, { ...opts, method: 'GET' }) }
export async function post(path, body, opts = {}) { return request(path, { ...opts, method: 'POST', body }) }
export async function put(path, body, opts = {}) { return request(path, { ...opts, method: 'PUT', body }) }
export async function del(path, opts = {}) { return request(path, { ...opts, method: 'DELETE' }) }

export default { request, get, post, put, del, getAuthHeaders }
