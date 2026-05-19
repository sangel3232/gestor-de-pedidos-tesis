import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth':      { target: 'http://localhost:8080', changeOrigin: true },
      '/clientes':  { target: 'http://localhost:8080', changeOrigin: true },
      '/pedidos':   { target: 'http://localhost:8080', changeOrigin: true },
      '/productos': { target: 'http://localhost:8080', changeOrigin: true },
      '/carrito':   { target: 'http://localhost:8080', changeOrigin: true },
      '/pagos':     { target: 'http://localhost:8080', changeOrigin: true },
      '/reportes':  { target: 'http://localhost:8080', changeOrigin: true },
      '/facturas':      { target: 'http://localhost:8080', changeOrigin: true },
      '/categorias':    { target: 'http://localhost:8080', changeOrigin: true },
      '/notificaciones':{ target: 'http://localhost:8080', changeOrigin: true },
    }
  }
})
