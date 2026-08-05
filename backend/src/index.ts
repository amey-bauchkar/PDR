import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { config, validateConfig } from './config/env.js';
import { requestLogger } from './middleware/common.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import healthRoutes from './routes/health.js';
import productRoutes from './routes/products.js';
import rfqRoutes from './routes/rfq.js';
import calculatorRoutes from './routes/calculator.js';
import contactRoutes from './routes/contact.js';

// Validate environment
validateConfig();

const app: Express = express();

// Middleware
app.use(cors({
  origin: [
    config.cors.origin,
    'https://pdrworld.com',
    'https://www.pdrworld.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(requestLogger);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rfq', rfqRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/contact', contactRoutes);

// Proxy Supabase storage through Express with caching
app.use('/cdn/storage', createProxyMiddleware({ 
  target: config.supabase.url.replace(/\/$/, ''),
  changeOrigin: true,
  pathRewrite: {
    '^/cdn/storage': '/storage/v1/object/public',
  },
  on: {
    proxyRes: (proxyRes) => {
      // Cache for 1 year
      proxyRes.headers['cache-control'] = 'public, max-age=31536000, immutable';
    },
  },
}));

// Serve React build as static files
app.use(express.static(path.join(__dirname, '../../dist')));

// API Health check root
app.get('/api', (req, res) => {
  res.json({
    message: 'PDR World API',
    version: '1.0.0',
    status: 'running',
    timestamp: Date.now(),
  });
});

// Catch-all: send all unmatched routes to React
// This makes React Router work correctly
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
const HOST = config.host;

app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 PDR World API Started              ║
║   Server: http://${HOST}:${PORT}        ║
║   Environment: ${config.nodeEnv}              ║
╚════════════════════════════════════════╝
  `);
});

export default app;
