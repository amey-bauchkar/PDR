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
import authRoutes from './routes/auth.js';

// Validate environment
validateConfig();

const app: Express = express();

const allowedOrigins = [
  'https://pdrworld.com',
  'https://www.pdrworld.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  config.cors.origin,
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (config.isDevelopment()) {
      if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }
    
    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/([a-zA-Z0-9-]+\.)?pdrworld\.com$/.test(origin)
    ) {
      return callback(null, true);
    }
    
    return callback(new Error(`CORS policy violation: origin ${origin} is not allowed.`));
  },
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
app.use('/api/auth', authRoutes);

// Proxy Supabase storage through Express with caching
if (config.supabase.url) {
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
}

import fs from 'fs';

// Serve React build as static files
const cwdDir = process.cwd();
const rootDir = path.resolve(__dirname, '../..');
const parentDir = path.resolve(__dirname, '..');
const distDir = path.join(__dirname, '../../dist');

// Serve static assets from all possible deployment root directories
app.use(express.static(cwdDir));
app.use(express.static(rootDir));
app.use(express.static(parentDir));
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// API Health check root
app.get('/api', (req, res) => {
  res.json({
    message: 'PDR World API',
    version: '1.0.0',
    status: 'running',
    timestamp: Date.now(),
  });
});

// Catch-all: serve prerendered HTML if available for WhatsApp/OG/SEO, otherwise SPA shell
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/cdn')) {
    return next();
  }

  // Sanitize path against directory traversal
  const normalizedPath = path.normalize(req.path).replace(/^(\.\.[\/\\])+/, '');
  const cleanPath = normalizedPath.replace(/^\/+|\/+$/g, '');
  
  const allowedRoots = [cwdDir, rootDir, parentDir, distDir].map((d) => path.resolve(d));

  const candidates = [
    path.join(cwdDir, cleanPath, 'index.html'),
    path.join(cwdDir, cleanPath + '.html'),
    path.join(rootDir, cleanPath, 'index.html'),
    path.join(rootDir, cleanPath + '.html'),
    path.join(parentDir, cleanPath, 'index.html'),
    path.join(parentDir, cleanPath + '.html'),
    path.join(distDir, cleanPath, 'index.html'),
    path.join(distDir, cleanPath + '.html'),
  ];

  for (const candidate of candidates) {
    const resolvedCandidate = path.resolve(candidate);
    const isWithinAllowed = allowedRoots.some((root) => resolvedCandidate.startsWith(root));
    if (isWithinAllowed && fs.existsSync(resolvedCandidate) && fs.statSync(resolvedCandidate).isFile()) {
      return res.sendFile(resolvedCandidate);
    }
  }

  // If admin route, fallback to SPA root index.html
  if (req.path.startsWith('/admin')) {
    const fallbackCandidates = [
      path.join(cwdDir, 'index.html'),
      path.join(rootDir, 'index.html'),
      path.join(parentDir, 'index.html'),
      path.join(distDir, 'index.html'),
    ];

    for (const fallback of fallbackCandidates) {
      if (fs.existsSync(fallback) && fs.statSync(fallback).isFile()) {
        return res.sendFile(fallback);
      }
    }
  }

  // Non-existent route: serve 404.html with real HTTP 404 status
  const notFoundCandidates = [
    path.join(cwdDir, '404.html'),
    path.join(rootDir, '404.html'),
    path.join(parentDir, '404.html'),
    path.join(distDir, '404.html'),
  ];

  for (const nf of notFoundCandidates) {
    if (fs.existsSync(nf) && fs.statSync(nf).isFile()) {
      return res.status(404).sendFile(nf);
    }
  }

  res.status(404).send('Page Not Found');
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
