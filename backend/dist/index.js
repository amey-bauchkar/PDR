import express from 'express';
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
const app = express();
app.use(cors({
    origin: true, // Dynamically reflect request origin so Hostinger and any frontend deployment can access API
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
    const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
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
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return res.sendFile(candidate);
        }
    }
    // Fallback to SPA root index.html
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
//# sourceMappingURL=index.js.map