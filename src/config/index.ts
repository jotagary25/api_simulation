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
    console: boolean;
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

/**
 * Retrieves environment variable or throws an error if missing.
 * Ensures NO default values are used in code.
 */
const getEnvOrThrow = (key: string): string => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Environment variable ${key} is required but was not set.`);
  }
  return value;
};

// Functions to parse types safely
const getInt = (key: string): number => {
  const val = getEnvOrThrow(key);
  const parsed = parseInt(val, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number.`);
  }
  return parsed;
};

const getBool = (key: string): boolean => {
  const val = getEnvOrThrow(key).toLowerCase();
  return val === 'true';
};

const config: Config = {
  app: {
    env: getEnvOrThrow('NODE_ENV'),
    port: getInt('PORT'),
    apiVersion: getEnvOrThrow('API_VERSION'),
  },
  database: {
    host: getEnvOrThrow('DB_HOST'),
    port: getInt('DB_PORT'),
    name: getEnvOrThrow('DB_NAME'),
    user: getEnvOrThrow('DB_USER'),
    password: getEnvOrThrow('DB_PASSWORD'),
    poolMin: getInt('DB_POOL_MIN'),
    poolMax: getInt('DB_POOL_MAX'),
  },
  security: {
    jwtSecret: getEnvOrThrow('JWT_SECRET'),
    jwtExpiresIn: getEnvOrThrow('JWT_EXPIRES_IN'),
    bcryptRounds: getInt('BCRYPT_ROUNDS'),
  },
  rateLimit: {
    windowMs: getInt('RATE_LIMIT_WINDOW_MS'),
    maxRequests: getInt('RATE_LIMIT_MAX_REQUESTS'),
  },
  logging: {
    level: getEnvOrThrow('LOG_LEVEL'),
    filePath: getEnvOrThrow('LOG_FILE_PATH'),
    console: process.env['NODE_ENV'] !== 'test',
  },
  cors: {
    origin: getEnvOrThrow('CORS_ORIGIN'),
    credentials: getBool('CORS_CREDENTIALS'),
  },
  whatsapp: {
    apiKey: getEnvOrThrow('WHATSAPP_API_KEY'),
    webhookSecret: getEnvOrThrow('WHATSAPP_WEBHOOK_SECRET'),
  },
  simulation: {
    clientWebhookUrl: getEnvOrThrow('CLIENT_WEBHOOK_URL'),
    appSecret: getEnvOrThrow('APP_SECRET'),
  },
};

export default config;
