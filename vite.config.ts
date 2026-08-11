import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        // Inject version tag for production builds
        // Creates a timestamp-based version like prod-20230811-120000
        const date = new Date();
        const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
        const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || `prod-${timestamp}`;
        return html.replace('{{COMMIT_SHA}}', commitSha);
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/cdn/storage': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
