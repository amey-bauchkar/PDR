import express, { Express } from 'express';
import cors from 'cors';
import { config, validateConfig } from './config/env.js';
import { requestLogger, validateBody } from './middleware/common.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

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
  origin: config.cors.origin,
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

// Health check root
app.get('/', (req, res) => {
  res.json({
    message: 'PDR World API',
    version: '1.0.0',
    status: 'running',
    timestamp: Date.now(),
  });
});

// 404 handler
app.use(notFoundHandler);

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
