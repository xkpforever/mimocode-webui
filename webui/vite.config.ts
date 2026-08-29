import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3333,
    proxy: {
      // Proxy MIMO API/SSE paths to the running MIMO Code server
      '/global': { target: 'http://localhost:4096', changeOrigin: true },
      '/session': { target: 'http://localhost:4096', changeOrigin: true },
      '/project': { target: 'http://localhost:4096', changeOrigin: true },
      '/config':  { target: 'http://localhost:4096', changeOrigin: true },
      '/provider': { target: 'http://localhost:4096', changeOrigin: true },
      '/pty':     { target: 'http://localhost:4096', changeOrigin: true },
      '/git':     { target: 'http://localhost:4096', changeOrigin: true },
      '/file':    { target: 'http://localhost:4096', changeOrigin: true },
      '/vcs':     { target: 'http://localhost:4096', changeOrigin: true },
    },
  },
})
