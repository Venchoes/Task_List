import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy apenas em desenvolvimento para evitar problemas de CORS enquanto o backend está sendo ajustado.
    // Encaminha chamadas para as rotas de auth e tasks diretamente ao backend remoto.
    proxy: {
      // redireciona /register -> https://express-mongodb.atv-conference-tickets-felipe.tech/register
      '/register': {
        target: 'https://express-mongodb.atv-conference-tickets-felipe.tech',
        changeOrigin: true,
        secure: true,
      },
      '/login': {
        target: 'https://express-mongodb.atv-conference-tickets-felipe.tech',
        changeOrigin: true,
        secure: true,
      },
      '/tasks': {
        target: 'https://express-mongodb.atv-conference-tickets-felipe.tech',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // mantém o caminho /tasks
      }
    }
  }
})
