import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || 'localhost',

  // Supabase
  supabase: {
    url: process.env.VITE_SUPABASE_URL || '',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiry: process.env.JWT_EXPIRY || '24h',
  },

  // External Services
  crm: {
    webhookUrl: process.env.CRM_WEBHOOK_URL || '',
    apiKey: process.env.CRM_API_KEY || '',
  },

  googleSheets: {
    sheetsId: process.env.GOOGLE_SHEETS_ID || '',
    apiKey: process.env.GOOGLE_SHEETS_API_KEY || '',
  },

  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || '',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Validation
  isDevelopment: () => config.nodeEnv === 'development',
  isProduction: () => config.nodeEnv === 'production',
};

// Validate required environment variables
export function validateConfig() {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    if (!config.isDevelopment()) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  return true;
}
