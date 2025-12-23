# AGENTS.md - WhatsApp API Project Documentation

> **Purpose**: This document provides comprehensive context for AI agents to understand, maintain, and extend this WhatsApp API project.

---

## 🎯 Project Overview

### Description

A production-grade RESTful API for WhatsApp message management, built with enterprise-level architecture principles. The system handles message sending/receiving, webhook processing, and provides a scalable foundation for WhatsApp integration.

### Core Objectives

1. **Reliability**: Handle WhatsApp webhooks and messages with high availability
2. **Scalability**: Architecture ready to scale horizontally and vertically
3. **Maintainability**: Clean code with separation of concerns
4. **Security**: Input validation, rate limiting, and secure configurations
5. **Observability**: Structured logging and error tracking

---

## 🏗️ Architecture

### Architectural Pattern: Layered Architecture

```
┌─────────────────────────────────────────┐
│         Controllers (HTTP Layer)        │  ← Handle HTTP requests/responses
├─────────────────────────────────────────┤
│         Services (Business Logic)       │  ← Business rules and orchestration
├─────────────────────────────────────────┤
│      Repositories (Data Access)         │  ← Database operations
├─────────────────────────────────────────┤
│        Models (Data Structures)         │  ← TypeScript interfaces/types
├─────────────────────────────────────────┤
│       Database (PostgreSQL)             │  ← Data persistence
└─────────────────────────────────────────┘
```

### Design Principles Applied

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Dependency Injection**: Services receive dependencies, not create them
3. **Single Responsibility Principle**: Each class/module does one thing well
4. **DRY (Don't Repeat Yourself)**: Shared logic in utilities and middlewares
5. **Type Safety**: Strict TypeScript configuration enforces type correctness
6. **Error First Design**: Comprehensive error handling at every layer

---

## 📂 Project Structure

```
whatsapp_api/
│
├── src/                          # Source code
│   ├── config/                   # Configuration management
│   │   └── index.ts             # Centralized config with env vars
│   │
│   ├── controllers/              # HTTP request handlers
│   │   ├── message.controller.ts
│   │   └── webhook.controller.ts
│   │
│   ├── services/                 # Business logic layer
│   │   ├── message.service.ts   # Message operations & validation
│   │   └── webhook.service.ts   # Webhook processing & async handling
│   │
│   ├── repositories/             # Data access layer
│   │   ├── message.repository.ts # Message CRUD operations
│   │   └── webhook.repository.ts # Webhook CRUD operations
│   │
│   ├── models/                   # TypeScript types & interfaces
│   │   ├── message.model.ts     # Message entity & DTOs
│   │   └── webhook.model.ts     # Webhook entity & DTOs
│   │
│   ├── middlewares/              # Express middlewares
│   │   ├── validation.middleware.ts  # Joi validation
│   │   └── error.middleware.ts       # Global error handler
│   │
│   ├── routes/                   # API route definitions
│   │   ├── message.routes.ts
│   │   ├── webhook.routes.ts
│   │   └── index.ts
│   │
│   ├── database/                 # Database layer
│   │   ├── index.ts             # Connection pool & query methods
│   │   └── init/                # SQL initialization scripts
│   │       └── 01-init.sql      # Database schema
│   │
│   ├── utils/                    # Utility functions
│   │   └── logger.ts            # Winston logger configuration
│   │
│   ├── app.ts                    # Express app setup
│   └── index.ts                  # Entry point with lifecycle management
│
├── dist/                         # Compiled JavaScript (generated)
├── logs/                         # Application logs (generated)
├── node_modules/                 # Dependencies
│
├── .env.example                  # Environment variables template
├── .nvmrc                        # Node.js version specification
├── tsconfig.json                 # TypeScript configuration (strict mode)
├── package.json                  # Project dependencies and scripts
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Container orchestration
├── .eslintrc.js                  # ESLint configuration
├── .gitignore                    # Git ignore rules
└── README.md                     # User documentation
```

---

## 🔧 Technology Stack

### Core Technologies

| Technology     | Version | Purpose               |
| -------------- | ------- | --------------------- |
| **Node.js**    | 24.12.0 | Runtime environment   |
| **TypeScript** | 5.3.3   | Type-safe development |
| **Express**    | 4.18.2  | Web framework         |
| **PostgreSQL** | 16      | Relational database   |
| **Docker**     | Latest  | Containerization      |

### Key Dependencies

#### Production

- **pg**: PostgreSQL client for Node.js
- **winston**: Professional logging library
- **joi**: Schema validation
- **helmet**: Security headers
- **cors**: Cross-origin resource sharing
- **express-rate-limit**: API rate limiting
- **compression**: Response compression
- **bcrypt**: Password hashing (future auth)
- **jsonwebtoken**: JWT tokens (future auth)

#### Development

- **ts-node**: TypeScript execution
- **nodemon**: Hot reload during development
- **eslint**: Code linting
- **jest**: Testing framework

---

## 🔐 Security Measures

1. **Helmet**: Sets secure HTTP headers
2. **Rate Limiting**: Prevents abuse (100 requests per 15 minutes)
3. **Input Validation**: Joi schemas validate all inputs
4. **SQL Injection Prevention**: Parameterized queries
5. **Environment Variables**: Sensitive data in .env
6. **CORS Configuration**: Controlled cross-origin access
7. **Non-root Docker User**: Production container runs as non-root
8. **Error Handling**: No sensitive data in error responses

---

## 🗄️ Database Schema

### Tables

#### `messages`

Stores WhatsApp messages sent/received through the API.

```sql
id: UUID (PK)
from_number: VARCHAR(20)     -- Sender phone number
to_number: VARCHAR(20)       -- Recipient phone number
message_text: TEXT           -- Message content
message_type: VARCHAR(20)    -- 'text', 'image', 'video', etc.
status: VARCHAR(20)          -- 'pending', 'sent', 'delivered', 'read', 'failed'
whatsapp_message_id: VARCHAR(255)  -- WhatsApp API message ID
metadata: JSONB              -- Additional data (flexible)
created_at: TIMESTAMP
updated_at: TIMESTAMP        -- Auto-updated via trigger
```

**Indexes**:

- `from_number`, `to_number` (for filtering)
- `status` (for querying by status)
- `created_at DESC` (for chronological queries)

#### `webhooks`

Stores incoming webhook events from WhatsApp for processing.

```sql
id: UUID (PK)
event_type: VARCHAR(50)      -- Event type from WhatsApp
payload: JSONB               -- Complete webhook payload
processed: BOOLEAN           -- Processing status
processed_at: TIMESTAMP      -- When processed
error_message: TEXT          -- Error if processing failed
created_at: TIMESTAMP
```

**Indexes**:

- `event_type` (for filtering by event)
- `processed` (for finding unprocessed)
- `created_at DESC` (for chronological processing)

### Database Design Decisions

1. **UUIDs**: Used for primary keys for distributed scalability
2. **JSONB**: Flexible storage for metadata and webhook payloads
3. **Timestamps**: All times use `TIMESTAMP WITH TIME ZONE`
4. **Triggers**: Auto-update `updated_at` on row modification
5. **Indexes**: Strategic indexing for common query patterns

---

## 🔄 Application Flow

### Message Creation Flow

```
1. Client sends POST /api/v1/messages
   ↓
2. Validation middleware (Joi) validates request
   ↓
3. MessageController.createMessage() receives request
   ↓
4. MessageService.createMessage() validates business rules
   ↓
5. MessageRepository.create() inserts into database
   ↓
6. [Future] WhatsApp API call to send message
   ↓
7. Response sent to client
```

### Webhook Processing Flow

```
1. WhatsApp sends POST /api/v1/webhooks
   ↓
2. [Future] Signature verification
   ↓
3. WebhookController.handleWebhook() receives request
   ↓
4. WebhookService.processIncomingWebhook() stores webhook
   ↓
5. Async processing begins (non-blocking)
   ↓
6. Immediate response sent to WhatsApp (200 OK)
   ↓
7. Background: Webhook processed based on event_type
   ↓
8. Webhook marked as processed (success/failure)
```

### Simulated Lifecycle (Message Status Updates)

The SimulationService (`/api/v1/simulation`) orchestrates a realistic event timeline after a message is sent:

1. **T+0ms**: API returns `200 OK` with `wamid`.
2. **T+500ms**: Simulator sends `status: sent` webhook.
3. **T+2500ms**: Simulator sends `status: delivered` webhook.
4. **T+5000ms**: Simulator sends `status: read` webhook.

Each webhook payload is:

- Structured exactly like Meta's "Onion" JSON.
- Signed with `HMAC-SHA256` using `APP_SECRET`.
- Sent to `CLIENT_WEBHOOK_URL` configured in env.

---

## 🐳 Docker Architecture

### Multi-Stage Dockerfile

1. **Base Stage**: Common setup for all stages
2. **Development Stage**: Includes dev dependencies, source code mounted
3. **Builder Stage**: Compiles TypeScript to JavaScript
4. **Production Stage**: Minimal image with compiled code only

### Docker Compose Profiles

- **dev**: Development environment with hot reload

  - Source code mounted as volume
  - `npm run dev` with nodemon
  - Full error stack traces

- **prod**: Production environment
  - Compiled code only
  - Optimized Node.js settings
  - Minimal logging

### Container Communication

```
### Container Communication

```

whatsapp_api/whatsapp_api_prod
↓
postgres_db (postgres:16-alpine)
↓
postgres_data (persistent volume)

````

### Volume Strategy

- **Development**:

  - `./src:/app/src` - Live code updates
  - `node_modules:/app/node_modules` - Isolated dependencies
  - `./logs:/app/logs` - Persistent logs

- **Production**:
  - `./logs:/app/logs` - Only logs persisted

### Standard API Response Pattern

All API endpoints follow a strict response format utilizing `ResponseBuilder`:

```typescript
// Success Response
{
  success: true,
  message: "Operation successful",
  data: { ... }, // Payload
  timestamp: "2025-12-23T02:00:00.000Z"
}

// Error Response
{
  success: false,
  message: "Error description",
  error: {
    code: 400,
    details: "Validation failed"
  },
  timestamp: "2025-12-23T02:00:00.000Z"
}
````

### Async Error Handling

All route handlers are wrapped with `asyncHandler` to ensure Promise rejections are safely caught and passed to the global error middleware, preventing server crashes and satisfying `no-misused-promises` lint rules.

---

## 🌍 Environment Variables

### Critical Variables

```bash
# Application
NODE_ENV=development|production    # Determines behavior
PORT=3000                          # Server port

# Database (must match docker-compose)
DB_HOST=postgres                   # Container name
DB_PORT=5432
DB_NAME=whatsapp_api
DB_USER=postgres
DB_PASSWORD=[secure password]

# Security
JWT_SECRET=[long random string]   # For future authentication
BCRYPT_ROUNDS=10                  # Password hashing cost

# External API
WHATSAPP_API_KEY=[your key]
WHATSAPP_WEBHOOK_SECRET=[your secret]
```

### Configuration Loading

1. `.env` file loaded via `dotenv` package
2. `src/config/index.ts` centralizes all config
3. Type-safe access throughout application
4. Fallback defaults for non-critical values

---

## 📝 Logging Strategy

### Winston Logger Configuration

- **Levels**: error, warn, info, debug
- **Transports**:
  - Console (colorized, all environments)
  - File: `logs/error.log` (errors only)
  - File: `logs/combined.log` (all logs)

### Logging Best Practices

```typescript
// Include context in logs
logger.info('Message created', { messageId: message.id });

// Log errors with stack traces
logger.error('Database error', { error, query });

// Use appropriate levels
logger.debug('Query executed', { duration, rows });
logger.warn('Message not found', { id });
```

---

## 🧪 Testing Strategy (To Be Implemented)

### Recommended Approach

1. **Unit Tests**: Test individual functions/methods

   - Services: Mock repositories
   - Repositories: Mock database
   - Utilities: Pure function testing

2. **Integration Tests**: Test layer interactions

   - Controllers + Services + Repositories
   - Use test database

3. **E2E Tests**: Full API testing
   - Real HTTP requests
   - Docker test environment

### Test Structure

```
src/
  __tests__/
    unit/
      services/
      repositories/
    integration/
      controllers/
    e2e/
      api/
```

---

## 🚀 Deployment Guide

### Local Development

```bash
# 1. Setup Node version
nvm use

# 2. Create .env file
cp .env.example .env

# 3. Start with Docker
docker-compose --profile dev up --build

# API available at http://localhost:3000
```

### Production Deployment

```bash
# 1. Build production image
docker-compose build --profile prod

# 2. Start production containers
docker-compose --profile prod up -d

# 3. Check logs
docker-compose logs -f app_prod

# 4. Monitor health
curl http://localhost:3000/health
```

### Scaling Considerations

1. **Horizontal Scaling**:

   - Multiple app containers behind load balancer
   - Shared PostgreSQL database
   - Stateless application design

2. **Database Scaling**:

   - Connection pooling (already configured)
   - Read replicas for read-heavy workloads
   - Partitioning for large tables

3. **Monitoring**:
   - Add Prometheus metrics
   - Grafana dashboards
   - Error tracking (Sentry)

---

## 🔨 Development Workflow

### Adding a New Endpoint

1. **Define Model** (`src/models/*.model.ts`)

   ```typescript
   export interface NewEntity {
     id: string;
     // ... properties
   }
   ```

2. **Create Repository** (`src/repositories/*.repository.ts`)

   ```typescript
   export class NewRepository {
     async create(data: CreateDTO): Promise<Entity> {}
     async findById(id: string): Promise<Entity | null> {}
   }
   ```

3. **Create Service** (`src/services/*.service.ts`)

   ```typescript
   export class NewService {
     async createEntity(data: CreateDTO): Promise<Entity> {
       // Business logic + validation
       return await repository.create(data);
     }
   }
   ```

4. **Create Controller** (`src/controllers/*.controller.ts`)

   ```typescript
   export class NewController {
     async create(req: Request, res: Response, next: NextFunction) {
       const entity = await service.createEntity(req.body);
       res.status(201).json({ success: true, data: entity });
     }
   }
   ```

5. **Define Routes** (`src/routes/*.routes.ts`)

   ```typescript
   router.post('/', validate(schema), controller.create);
   ```

6. **Add Validation Schema** (`src/middlewares/validation.middleware.ts`)
   ```typescript
   createEntity: {
     body: Joi.object({
       /* ... */
     });
   }
   ```

### Database Migrations

For schema changes:

1. Create new SQL file: `src/database/init/02-migration-name.sql`
2. Rebuild containers: `docker-compose down && docker-compose --profile dev up --build`

---

## 🐛 Common Issues & Solutions

### Issue: TypeScript Path Aliases Not Working

**Solution**: Ensure `tsconfig.json` paths match import statements, build after changes.

### Issue: Database Connection Failed

**Solution**:

- Check `DB_HOST` is set to `postgres` (container name)
- Ensure containers are on same network
- Verify `.env` credentials match `docker-compose.yml`

### Issue: Port Already in Use

**Solution**: Change `PORT` in `.env` or stop conflicting service

### Issue: Hot Reload Not Working

**Solution**:

- Verify volume mount in `docker-compose.yml`
- Check nodemon configuration
- Restart dev container

---

## 📊 Performance Considerations

### Database

- **Connection Pool**: Max 10 concurrent connections
- **Indexes**: Created on frequently queried columns
- **Prepared Statements**: Automatic with parameterized queries

### Application

- **Compression**: Enabled for responses
- **Rate Limiting**: Prevents abuse
- **Asynchronous Processing**: Webhooks processed async

---

## 🔮 Future Enhancements

### Short Term

1. ✅ Core API endpoints (completed)
2. 🔲 WhatsApp API integration
3. 🔲 Authentication & authorization (JWT)
4. 🔲 Unit & integration tests
5. 🔲 API documentation (Swagger/OpenAPI)

### Medium Term

1. Message queue for webhook processing (Bull/BullMQ)
2. Redis caching layer
3. Webhook retry mechanism
4. File upload support (images, videos)
5. Monitoring & alerting

### Long Term

1. GraphQL API
2. Microservices architecture
3. Event sourcing
4. Multi-tenant support
5. Analytics dashboard

---

## 📚 Key Patterns & Conventions

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `message.service.ts`)
- **Classes**: `PascalCase` (e.g., `MessageService`)
- **Functions**: `camelCase` (e.g., `createMessage`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- **Interfaces**: `PascalCase` (e.g., `Message`)
- **DTOs**: `PascalCase` with DTO suffix (e.g., `CreateMessageDTO`)

### Code Organization

- One class per file
- Export default for main entity
- Group related imports
- Order: external → internal → types

### Error Handling

- Always use `try-catch` in async functions
- Log errors with context
- Throw `AppError` for operational errors
- Let middleware handle error responses

---

## 🤝 Contributing Guidelines (For Agents & Humans)

### When Modifying Code

1. **Understand Context**: Read related code before changing
2. **Type Safety**: Never use `any`, prefer strict types
3. **Error Handling**: Always handle errors appropriately
4. **Logging**: Add logs for important operations
5. **Validation**: Validate inputs at controller level
6. **Testing**: Add tests for new features
7. **Documentation**: Update this file for architectural changes

### Code Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] Proper error handling
- [ ] Input validation
- [ ] Logging added
- [ ] No security vulnerabilities
- [ ] Performance considered
- [ ] Documentation updated

---

## 📞 Troubleshooting Guide

### Debug Mode

Enable detailed logging:

```bash
LOG_LEVEL=debug docker-compose --profile dev up
```

### Database Inspection

Access PostgreSQL:

```bash
docker exec -it postgres_db psql -U postgres -d whatsapp_api
```

Useful queries:

```sql
-- Check messages
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;

-- Check webhooks
SELECT * FROM webhooks WHERE processed = false;

-- Check indexes
\di
```

### Container Inspection

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f whatsapp_api

# Access container shell
docker exec -it whatsapp_api sh

# Restart specific service
docker-compose restart whatsapp_api
```

---

## 🎓 Learning Resources

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### Express

- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

### PostgreSQL

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

### Docker

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 📝 Version History

### v1.0.0 - Initial Release

- Core architecture implemented
- Message and webhook endpoints
- Docker containerization
- PostgreSQL integration
- TypeScript strict mode
- Comprehensive documentation

---

## 🏁 Quick Reference

### Start Development

```bash
docker-compose --profile dev up
```

### Run Tests

```bash
npm test
```

### Build Production

```bash
docker-compose --profile prod up --build
```

### View Logs

```bash
docker-compose logs -f
```

### API Base URL

- Development: `http://localhost:3000/api/v1`
- Health Check: `http://localhost:3000/health`

---

**Last Updated**: 2025-12-23
**Maintained By**: Development Team
**For**: AI Agents & Human Developers
