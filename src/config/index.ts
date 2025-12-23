import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  app: {
    env: string;
    port: number;
    apiVersion: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    poolMin: number;
    poolMax: number;
  };
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  logging: {
    level: string;
    filePath: string;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
  whatsapp: {
    apiKey: string;
    webhookSecret: string;
  };
  simulation: {
    clientWebhookUrl: string;
    appSecret: string;
  };
}

const config: Config = {
  app: {
    env: process.env['NODE_ENV'] || 'development',
    port: parseInt(process.env['PORT'] || '3000', 10),
    apiVersion: process.env['API_VERSION'] || 'v1',
  },
  database: {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432', 10),
    name: process.env['DB_NAME'] || 'whatsapp_api',
    user: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || 'postgres',
    poolMin: parseInt(process.env['DB_POOL_MIN'] || '2', 10),
    poolMax: parseInt(process.env['DB_POOL_MAX'] || '10', 10),
  },
  security: {
    jwtSecret: process.env['JWT_SECRET'] || 'changeme',
    jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
    bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] || '10', 10),
  },
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10),
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  },
  logging: {
    level: process.env['LOG_LEVEL'] || 'info',
    filePath: process.env['LOG_FILE_PATH'] || './logs',
  },
  cors: {
    origin: process.env['CORS_ORIGIN'] || '*',
    credentials: process.env['CORS_CREDENTIALS'] === 'true',
  },
  whatsapp: {
    apiKey: process.env['WHATSAPP_API_KEY'] || '',
    webhookSecret: process.env['WHATSAPP_WEBHOOK_SECRET'] || '',
  },
  simulation: {
    clientWebhookUrl: process.env['CLIENT_WEBHOOK_URL'] || 'http://localhost:3000/api/v1/webhooks',
    appSecret: process.env['APP_SECRET'] || 'simulator_secret',
  },
};

export default config;
