import path from "path"
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),  tailwindcss()],
  server: {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  },
  preview: {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@Assets": path.resolve(import.meta.dirname, "./src/assets"),
    },
  },
})
