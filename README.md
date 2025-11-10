# React + Vite



This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Este é o frontend da aplicação Task List (React + Vite). O projeto foi desenvolvido para se integrar a um backend Express que persiste dados (usuários e tarefas) em um banco (MongoDB ou PostgreSQL, dependendo do backend que você estiver usando).

O README abaixo traz instruções rápidas de instalação, variáveis de ambiente importantes, execução em desenvolvimento e dicas de debugging (CORS, tokens JWT, etc.).

## Pré-requisitos

- Node.js (>=18 recomendado) e npm ou yarn
- Backend rodando e acessível via HTTP(S) (endpoints esperados descritos mais abaixo)

## Instalação

1. Instale dependências:

```bash
npm install
# ou
# yarn
```

2. Configure variáveis de ambiente (opcional para dev):

- Crie um arquivo `.env` na raiz com a variável (exemplo):

```env
# URL base do backend (não coloque string de conexão do banco aqui)
VITE_API_BASE=https://seu-backend.example.com
```

Obs.: não colocar a string de conexão do banco (ex: mongodb+srv://...) no frontend — essa informação pertence ao backend.

## Executando em desenvolvimento

```bash
npm run dev
```

O Vite dev server vai rodar em `http://localhost:5173` (ou outra porta se ocupada). Em `vite.config.js` há um proxy de desenvolvimento que encaminha `/register`, `/login` e `/tasks` para o backend remoto (útil para evitar CORS localmente). Em produção o proxy NÃO é usado — o frontend deve apontar `VITE_API_BASE` para o endpoint real do backend.

### Evitando CORS no ambiente local

Para evitar problemas de CORS durante o desenvolvimento:

1. Defina `VITE_API_BASE=` (vazio) no `.env.local`. Quando a base fica vazia, o código em `src/services/api.js` gera URLs relativas (`/register`, `/login`, etc.) que serão atendidas pelo dev server do Vite e enviadas ao backend via proxy sem cross-origin.
2. Reinicie o dev server (`Ctrl+C` e depois `npm run dev`).
3. Abra o app e verifique no DevTools (Network) que a requisição de cadastro é feita para `https://SEU_HOST_DEV/register` (origem igual ao frontend) e não para a URL absoluta antiga.

Se você ainda ver requisições indo para um domínio remoto: limpe caches e verifique no console do navegador:
```js
import.meta.env.VITE_API_BASE
```
O valor deve ser `""` (string vazia). Caso contrário, confirme se o arquivo `.env.local` está na raiz e se a variável possui o prefixo `VITE_`.

### Checklist rápido quando aparecer erro de CORS

- [ ] A URL usada pelo fetch é relativa (começa com `/`)? Se sim, não deveria haver CORS.
- [ ] `VITE_API_BASE` está vazia em desenvolvimento? (string vazia)
- [ ] Dev server foi reiniciado depois de alterar `.env.local`?
- [ ] O backend realmente está acessível (teste com `curl` ou Insomnia/Postman)?

Se quiser usar uma URL completa mesmo em dev, então PRECISA habilitar CORS no backend (ver seção mais abaixo).

## Scripts úteis

- `npm run dev` — roda o servidor de desenvolvimento
- `npm run build` — gera build de produção
- `npm run preview` — executa uma versão estática local do build (se configurado)

## Endpoints esperados no backend

O frontend espera que o backend exponha (convencionalmente):

- `POST /register` — criar usuário (body: { name, email, password })
- `POST /login` — autenticar e retornar token JWT (ex: { token, user })
- `GET /tasks` — listar tarefas do usuário autenticado
- `POST /tasks` — criar tarefa (body: { title, description })
- `PUT /tasks/:id` — atualizar tarefa
- `DELETE /tasks/:id` — remover tarefa

O backend deve proteger `/tasks` com JWT (Authorization: Bearer <token>). O frontend armazena o token em `localStorage` na chave `token` e o `api.js` injeta automáticamente o header `Authorization` nas requisições.

## Variáveis de ambiente importantes

- `VITE_API_BASE` — URL base do backend (ex: `https://api.sua-app.com`).

No backend (servidor), configure (exemplos):
- `MONGODB_URI` ou `DATABASE_URL` — string de conexão com o banco (somente no backend)
- `ALLOWED_ORIGINS` — (opcional) origem(s) permitidas para CORS (ex: `https://frontend.example.com`)

## Debugging e verificação

- Verifique requests em DevTools → Network. Confirme que as chamadas saem para `VITE_API_BASE` e que o header `Authorization: Bearer <token>` está presente quando necessário.
- Eventos úteis emitidos pelo frontend:
	- `apiRequestStart` e `apiRequestEnd` (CustomEvent) — para saber quando as requisições iniciam/terminam.
	- `tokenExpired` — disparado quando o token JWT expira (o app remove o token automaticamente).
	- `userLogout` — disparado quando o usuário faz logout manualmente.

- Problemas comuns:
	- CORS: se o navegador bloquear a requisição com erro do tipo "No 'Access-Control-Allow-Origin' header", habilite CORS no backend (veja abaixo).
	- Token: garanta que o backend retorne um JWT válido (com `exp`) e que o frontend salve o token retornado.

## Resolver problemas de CORS (no backend)

No Express use o pacote `cors` e/ou responda ao preflight OPTIONS. Exemplo mínimo:

```js
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }));
app.use(express.json());
// ... rotas
```

Se estiver em ambiente serverless (Vercel), trate `OPTIONS` e defina `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods` e `Access-Control-Allow-Headers` no handler.

#### Exemplo manual (sem pacote `cors`):
```js
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') return res.sendStatus(204); // responde preflight
	next();
});
```

## Mensagens e toasts

- O app exibe toasts para eventos comuns:
	- Sucesso no logout: "Logout realizado".
	- Sessão expirada: "Sessão expirada. Faça login novamente." (disparado quando o token vence automaticamente).

Observação: o toast de logout sobrescreve o toast de sessão expirada quando o usuário clica em logout.

## Deploy

- Configure `VITE_API_BASE` no ambiente do seu provedor de hospedagem (ex: Vercel) apontando para a URL do backend.
- No backend, defina `MONGODB_URI`/`DATABASE_URL` e `ALLOWED_ORIGINS` adequados.

## Troubleshooting rápido

- Network error / Failed to fetch no browser: verifique CORS e preflight OPTIONS.
- 422 Unprocessable Content ao registrar: verifique o JSON enviado e a resposta do backend (detalhes de validação).
- 500 / FUNCTION_INVOCATION_FAILED: veja os logs do provedor (Vercel) para o stacktrace.

## Contribuindo

Sinta-se à vontade para abrir PRs com melhorias. Se for adicionar endpoints diferentes no backend, atualize `src/services/api.js` e o README com as novas rotas.

---

Se quiser, eu posso adicionar instruções específicas do backend (ex.: comandos para rodar o servidor Express localmente, variáveis exatas esperadas) se você colar aqui o `package.json` e os arquivos do backend ou informar o provedor usado.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
