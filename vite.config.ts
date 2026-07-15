import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        // Inject commit SHA from Vercel environment variable
        // Falls back to 'local-dev' for local development
        const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || 'local-dev'
        return html.replace('{{COMMIT_SHA}}', commitSha)
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://pdrworld.com',
        changeOrigin: true,
      },
    },
  },
})
