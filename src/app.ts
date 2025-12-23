import config from './config';
import database from './database';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import routes from './routes';
import logger from './utils/logger';
import compression from 'compression';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS
    this.app.use(
      cors({
        origin: config.cors.origin,
        credentials: config.cors.credentials,
      })
    );

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: 'Too many requests from this IP, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api', limiter);

    // Request logging
    this.app.use((req: Request, _res: Response, next) => {
      logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
      });
      next();
    });
  }

  private initializeRoutes(): void {
    // Welcome endpoint with funny message
    this.app.get('/', (_req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message:
          '🚀 ¡Bienvenido a la API de WhatsApp! Espero que hayas traído tu sentido del humor... ¡y tus credenciales! 😄',
        data: {
          api: 'WhatsApp API',
          version: config.app.apiVersion,
          status: 'running',
          joke: '¿Por qué los programadores prefieren el modo oscuro? ¡Porque la luz atrae bugs! 🐛',
        },
        timestamp: new Date().toISOString(),
      });
    });

    // Health check with funny message
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message:
          '💚 ¡Estoy más saludable que un aguacate orgánico! El servidor está corriendo como Usain Bolt. 🏃‍♂️',
        data: {
          status: 'healthy',
          uptime: process.uptime(),
          environment: config.app.env,
          database: 'connected',
          mood: 'excelente',
          coffee_level: '☕☕☕',
        },
        timestamp: new Date().toISOString(),
      });
    });

    // API routes
    this.app.use(`/api/${config.app.apiVersion}`, routes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Check database connection
      const dbConnected = await database.checkConnection();
      if (!dbConnected) {
        throw new Error('Failed to connect to database');
      }

      // Start server
      this.app.listen(config.app.port, () => {
        logger.info(`Server started successfully`, {
          port: config.app.port,
          environment: config.app.env,
          nodeVersion: process.version,
        });
      });
    } catch (error) {
      logger.error('Failed to start server', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await database.close();
      logger.info('Application stopped gracefully');
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  }
}

export default App;
