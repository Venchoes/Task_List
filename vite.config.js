import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy apenas em desenvolvimento para evitar problemas de CORS enquanto o backend está sendo ajustado.
    // Encaminha chamadas para as rotas de auth e tasks diretamente ao backend remoto.
    proxy: {
      // redireciona chamadas da aplicação local para o backend Postgres em desenvolvimento
      // usando o host do Codespaces. Ajuste conforme o backend que você realmente usa.
      '/register': {
        target: 'https://uncanny-vampire-pj7qwv6grgxr2rjwp-3000.app.github.dev',
        changeOrigin: true,
        secure: true,
      },
      '/login': {
        target: 'https://uncanny-vampire-pj7qwv6grgxr2rjwp-3000.app.github.dev',
        changeOrigin: true,
        secure: true,
      },
      '/tasks': {
        target: 'https://uncanny-vampire-pj7qwv6grgxr2rjwp-3000.app.github.dev',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // mantém o caminho /tasks
      }
    }
  }
})
