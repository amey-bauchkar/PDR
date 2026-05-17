import app from './app';
import config from './config';
import logger from './utils/logger';

const server = app.listen(config.port, () => {
  logger.info(`
    ╔════════════════════════════════════════╗
    ║   PDR World Backend API Server         ║
    ║   Version: 1.0.0                       ║
    ╠════════════════════════════════════════╣
    ║   Environment: ${config.nodeEnv.padEnd(27)}║
    ║   Port: ${config.port.toString().padEnd(33)}║
    ║   Status: Running                      ║
    ╚════════════════════════════════════════╝
  `);
  logger.info(`API available at: http://localhost:${config.port}`);
  logger.info(`Health check: http://localhost:${config.port}/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;
