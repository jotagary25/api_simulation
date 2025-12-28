# WhatsApp API

API profesional para mensajería de WhatsApp construida con TypeScript, Express, PostgreSQL y Docker.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Endpoints de la API](#endpoints-de-la-api)
- [Desarrollo](#desarrollo)
- [Estructura del Proyecto](#estructura-del-proyecto)

## ✨ Características

- **TypeScript Estricto** - Type safety completo sin `any`
- **Docker Ready** - Desarrollo y producción containerizados
- **PostgreSQL** - Base de datos relacional con schema optimizado
- **Hot Reload** - Desarrollo ágil con recarga automática
- **Arquitectura en Capas** - Controllers → Services → Repositories → Database
- **Validación** - Joi schemas para todos los inputs
- **Seguridad** - Helmet, CORS, Rate limiting
- **Logging** - Winston con múltiples transports

## 📦 Requisitos

- Node.js 24.12.0 (usar nvm)
- Docker y Docker Compose
- PostgreSQL 16 (via Docker)

## 🚀 Instalación

### 1. Clonar el repositorio e instalar dependencias

```bash
# Usar la versión correcta de Node.js
source ~/.nvm/nvm.sh && nvm use

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env
```

### 2. Configurar variables de entorno

Edita `.env` con tus configuraciones:

```bash
# Aplicación
NODE_ENV=development
PORT=4000

# Base de Datos
DB_HOST=postgres
DB_PORT=5432
DB_PORT_HOST=4444
DB_NAME=whatsapp_api
DB_USER=postgres
DB_PASSWORD=tu_password_seguro

# WhatsApp
WHATSAPP_API_KEY=tu_api_key
WHATSAPP_WEBHOOK_SECRET=tu_webhook_secret
```

## 🎯 Uso

### Modo Desarrollo (con hot reload)

```bash
docker compose --profile dev up --build
```

La API estará disponible en `http://localhost:4000`

### Modo Producción

```bash
docker compose --profile prod up --build -d
```

### Detener contenedores

```bash
docker compose down
```

Nota: si levantaste con perfiles, usa el mismo perfil al bajar. Ejemplo: `docker compose --profile dev down` (si no, solo bajan servicios sin perfil, como `postgres`).

### Actualizar variables de entorno sin bajar todo

Los cambios en `.env` se leen al crear el contenedor. Para aplicar cambios solo en la API sin tocar Postgres:

```bash
docker compose --profile dev up -d --no-deps --force-recreate whatsapp_api
```

En produccion:

```bash
docker compose --profile prod up -d --no-deps --force-recreate whatsapp_api_prod
```

Nota: `docker compose restart` no recarga variables de entorno.

### Instalar/actualizar dependencias sin rebuild completo

```bash
docker compose --profile dev exec whatsapp_api npm install
```

Si prefieres reproducibilidad estricta:

```bash
docker compose --profile dev exec whatsapp_api npm ci
```

### Ver logs

```bash
# Logs de la aplicación
docker compose logs -f whatsapp_api

# Logs de la base de datos
docker compose logs -f postgres
```

### Otros comandos útiles

```bash
# Reiniciar solo la aplicación
docker compose restart whatsapp_api

# Acceder a la base de datos
docker exec -it postgres_db psql -U postgres -d whatsapp_api

# Limpiar todo (incluye base de datos)
docker compose down -v
```

## 📡 Endpoints

Esta API expone dos superficies distintas:

- **API interna de gestión**: `GET/POST /api/v1/...` (mensajes, webhooks, consultas)
- **Simulador WhatsApp Cloud API**: `POST /v{VERSION}/{PHONE_NUMBER_ID}/messages`

### Bienvenida

```bash
GET /
```

Retorna un mensaje de bienvenida y estado general.

### Health Check

```bash
GET /health
```

Verifica que el servidor esté funcionando.

**Ejemplo:**

```bash
curl http://localhost:4000/health
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-23T01:00:00.000Z",
  "environment": "development"
}
```

---

### Mensajes (API interna)

#### Crear un mensaje

```bash
POST /api/v1/messages
```

**Body:**

```json
{
  "from_number": "+1234567890",
  "to_number": "+0987654321",
  "message_text": "Hola, este es un mensaje de prueba",
  "message_type": "text",
  "metadata": {
    "campaign": "test"
  }
}
```

**Ejemplo:**

```bash
curl -X POST http://localhost:4000/api/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "from_number": "+1234567890",
    "to_number": "+0987654321",
    "message_text": "Hola Mundo"
  }'
```

#### Listar mensajes

```bash
GET /api/v1/messages?limit=10&offset=0
```

**Ejemplo:**

```bash
curl http://localhost:4000/api/v1/messages
```

#### Obtener mensaje por ID

```bash
GET /api/v1/messages/:id
```

**Ejemplo:**

```bash
curl http://localhost:4000/api/v1/messages/uuid-del-mensaje
```

#### Actualizar mensaje

```bash
PATCH /api/v1/messages/:id
```

**Body:**

```json
{
  "status": "sent",
  "whatsapp_message_id": "wamid.ABC123"
}
```

Estados válidos: `pending`, `sent`, `delivered`, `read`, `failed`

**Ejemplo:**

```bash
curl -X PATCH http://localhost:4000/api/v1/messages/uuid-del-mensaje \
  -H "Content-Type: application/json" \
  -d '{"status": "sent"}'
```

#### Eliminar mensaje

```bash
DELETE /api/v1/messages/:id
```

**Ejemplo:**

```bash
curl -X DELETE http://localhost:4000/api/v1/messages/uuid-del-mensaje
```

#### Obtener mensajes por número de teléfono

```bash
GET /api/v1/messages/phone/:phoneNumber?limit=50
```

**Ejemplo:**

```bash
curl http://localhost:4000/api/v1/messages/phone/+1234567890
```

---

### Webhooks (API interna)

#### Recibir webhook de WhatsApp

```bash
POST /api/v1/webhooks
```

**Body:**

```json
{
  "event_type": "message.received",
  "payload": {
    "message_id": "wamid.ABC123",
    "from": "+1234567890",
    "text": "Hola"
  }
}
```

**Ejemplo:**

```bash
curl -X POST http://localhost:4000/api/v1/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "message.received",
    "payload": {"from": "+1234567890", "text": "Hola"}
  }'
```

#### Obtener webhook por ID

```bash
GET /api/v1/webhooks/:id
```

#### Obtener webhooks no procesados

```bash
GET /api/v1/webhooks/status/unprocessed?limit=100
```

## 🎭 Simulador de WhatsApp API

Esta API incluye un módulo de simulación de alta fidelidad que replica el comportamiento de la API oficial de Meta.

### Configuración del Simulador

Para recibir los eventos de estado (`sent`, `delivered`, `read`, `failed`), debes configurar en tu `.env`:

```bash
# URL donde tu aplicación espera recibir los webhooks
CLIENT_WEBHOOK_URL=http://localhost:4000/api/v1/webhooks
# Secreto para validar la firma X-Hub-Signature-256
APP_SECRET=simulator_secret
```

### Endpoint simulado (equivalente al de WhatsApp Cloud API)

El endpoint real de WhatsApp Cloud API es:

```
POST https://graph.facebook.com/v{VERSION}/{PHONE_NUMBER_ID}/messages
```

En este simulador se expone el **mismo path** (sin el dominio de Meta):

```
POST /v{VERSION}/:phoneNumberId/messages
```

### Ciclo de Vida Automático

Al enviar un mensaje al endpoint de simulación, el sistema automáticamente:

1. Retorna `200 OK` con un `wamid` generado.
2. Espera ~500ms y envía un webhook `sent`.
3. Espera ~2s y envía un webhook `delivered`.
4. Espera ~5s y envía un webhook `read`.

### Formato del webhook de estados (Onion)

El simulador envía un **POST** a `CLIENT_WEBHOOK_URL` con este formato "Onion" (Meta) y firma `X-Hub-Signature-256` (`sha256=HMAC(APP_SECRET, body)`).

- `status` es un string con **uno** de estos valores: `sent`, `delivered`, `read`, `failed` (no se combinan).
- `errors` solo aparece cuando `status` es `failed` y allí viene la descripcion del problema.
- `pricing` solo aparece cuando `status` es `sent` o `delivered`.

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "100000000000000",
      "changes": [
        {
          "field": "messages",
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "1555000000",
              "phone_number_id": "100020003000"
            },
            "statuses": [
              {
                "id": "wamid.HBgL7A4DF32C981B2...",
                "status": "failed",
                "timestamp": "1710000000",
                "recipient_id": "59170000000",
                "conversation": {
                  "id": "CON_7A4DF32C98",
                  "origin": { "type": "marketing" }
                },
                "errors": [
                  {
                    "code": 131051,
                    "title": "Message failed to send",
                    "message": "Message failed to send due to simulated failure",
                    "error_data": {
                      "details": "Simulated failure scenario triggered"
                    }
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  ]
}
```

Referencias oficiales:
- https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
- https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples

### Enviar Mensaje de Plantilla (Simulado)

Replica el endpoint `POST /v{VERSION}/{PhoneNumberID}/messages` de Meta.

```bash
POST /v{VERSION}/:phoneNumberId/messages
```

**Body Completo (Soporte Header, Body, Buttons):**

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "59170000000",
  "type": "template",
  "template": {
    "name": "envio_factura_compleja",
    "language": {
      "code": "es_MX"
    },
    "components": [
      {
        "type": "header",
        "parameters": [
          {
            "type": "image",
            "image": {
              "link": "https://mi-empresa.com/factura.png"
            }
          }
        ]
      },
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "Juan Perez"
          },
          {
            "type": "currency",
            "currency": {
              "fallback_value": "$100.50",
              "code": "USD",
              "amount_1000": 100500
            }
          }
        ]
      },
      {
        "type": "button",
        "sub_type": "url",
        "index": "0",
        "parameters": [
          {
            "type": "text",
            "text": "factura_12345"
          }
        ]
      }
    ]
  }
}
```

**Respuesta Simulada (Idéntica a Meta):**

```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "59170000000",
      "wa_id": "59170000000"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgL7A4DF32C981B2..."
    }
  ]
}
```

**Ejemplo cURL:**

```bash
curl -X POST http://localhost:4000/v21.0/100020003000/messages \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "5215555555555",
    "type": "template",
    "template": {
      "name": "hello_world",
      "language": { "code": "en_US" },
      "components": []
    }
  }'
```

## 💻 Desarrollo

### Desarrollo local sin Docker

Si prefieres desarrollar sin Docker, necesitas PostgreSQL corriendo localmente:

```bash
# 1. Actualizar .env
DB_HOST=localhost

# 2. Iniciar servidor de desarrollo
source ~/.nvm/nvm.sh && nvm use
npm run dev
```

### Scripts disponibles

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm start            # Iniciar producción
npm run lint         # Ejecutar linter
npm run lint:fix     # Auto-fix linting
npm test             # Ejecutar tests
```

### Linting

```bash
npm run lint        # Verificar código
npm run lint:fix    # Auto-corregir
```

## 📁 Estructura del Proyecto

```
whatsapp_api/
├── src/
│   ├── index.ts                    # Entry point
│   ├── app.ts                      # Express app setup
│   ├── config/
│   │   └── index.ts               # Configuración centralizada
│   ├── controllers/
│   │   ├── message.controller.ts  # Controlador de mensajes
│   │   └── webhook.controller.ts  # Controlador de webhooks
│   ├── services/
│   │   ├── message.service.ts     # Lógica de negocio
│   │   └── webhook.service.ts
│   ├── repositories/
│   │   ├── message.repository.ts  # Acceso a datos
│   │   └── webhook.repository.ts
│   ├── models/
│   │   ├── message.model.ts       # Tipos TypeScript
│   │   └── webhook.model.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── message.routes.ts      # Rutas de mensajes
│   │   └── webhook.routes.ts      # Rutas de webhooks
│   ├── middlewares/
│   │   ├── validation.middleware.ts  # Validación Joi
│   │   └── error.middleware.ts       # Manejo de errores
│   ├── database/
│   │   ├── index.ts               # Connection pool
│   │   └── init/
│   │       └── 01-init.sql        # Schema de base de datos
│   └── utils/
│       └── logger.ts              # Winston logger
├── logs/                           # Logs de aplicación
├── .env                            # Variables de entorno
├── .env.example                    # Template de variables
├── docker-compose.yml              # Orquestación Docker
├── Dockerfile                      # Imagen Docker multi-stage
├── tsconfig.json                   # Config TypeScript
├── package.json                    # Dependencias
├── .nvmrc                          # Versión Node.js
├── .eslintrc.js                    # Config ESLint
├── README.md                       # Este archivo
└── AGENTS.md                       # Documentación técnica completa
```

### Arquitectura en capas

```
Controllers  ← Maneja HTTP requests/responses
    ↓
Services     ← Lógica de negocio y validaciones
    ↓
Repositories ← Acceso a base de datos
    ↓
Database     ← PostgreSQL
```

## 🗄️ Base de Datos

### Tablas

#### `messages`

Almacena mensajes de WhatsApp.

| Campo               | Tipo         | Descripción                            |
| ------------------- | ------------ | -------------------------------------- |
| id                  | UUID         | Primary key                            |
| from_number         | VARCHAR(20)  | Número remitente                       |
| to_number           | VARCHAR(20)  | Número destinatario                    |
| message_text        | TEXT         | Contenido del mensaje                  |
| message_type        | VARCHAR(20)  | Tipo: text, image, video, etc.         |
| status              | VARCHAR(20)  | pending, sent, delivered, read, failed |
| whatsapp_message_id | VARCHAR(255) | ID de WhatsApp API                     |
| metadata            | JSONB        | Datos adicionales                      |
| created_at          | TIMESTAMP    | Fecha de creación                      |
| updated_at          | TIMESTAMP    | Fecha de actualización                 |

#### `webhooks`

Almacena eventos de webhooks.

| Campo         | Tipo        | Descripción             |
| ------------- | ----------- | ----------------------- |
| id            | UUID        | Primary key             |
| event_type    | VARCHAR(50) | Tipo de evento          |
| payload       | JSONB       | Datos del webhook       |
| processed     | BOOLEAN     | Estado de procesamiento |
| processed_at  | TIMESTAMP   | Fecha de procesamiento  |
| error_message | TEXT        | Error si falló          |
| created_at    | TIMESTAMP   | Fecha de creación       |

### Acceder a la base de datos

```bash
docker exec -it whatsapp_api_postgres psql -U postgres -d whatsapp_api
```

Consultas útiles:

```sql
-- Ver mensajes recientes
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;

-- Ver webhooks pendientes
SELECT * FROM webhooks WHERE processed = false;

-- Contar mensajes por estado
SELECT status, COUNT(*) FROM messages GROUP BY status;
```

## 🔐 Seguridad

El proyecto incluye:

- **Helmet** - Headers HTTP seguros
- **CORS** - Control de acceso cross-origin
- **Rate Limiting** - 100 requests por 15 minutos
- **Validación de inputs** - Joi schemas
- **Queries parametrizadas** - Prevención de SQL injection
- **Error sanitization** - No expone detalles sensibles en producción

## 🐛 Troubleshooting

### Port 4000 ya está en uso

```bash
# Cambiar puerto en .env
PORT=4001
```

### Error de conexión a base de datos

```bash
# Verificar que DB_HOST sea 'postgres' (nombre del contenedor)
# Reiniciar contenedores
docker compose restart postgres
```

### Hot reload no funciona

```bash
# Reiniciar contenedor de desarrollo
docker compose restart whatsapp_api
```

### Limpiar todo y empezar de nuevo

```bash
docker compose down -v
docker compose --profile dev up --build
```

## 📚 Documentación Adicional

- **AGENTS.md** - Documentación técnica completa para desarrolladores y agentes AI, incluye:
  - Arquitectura detallada del sistema
  - Patrones de diseño aplicados
  - Guía de desarrollo y mejores prácticas
  - Flujos de la aplicación
  - Troubleshooting avanzado

## 📝 Variables de Entorno

Ver `.env.example` para todas las variables disponibles:

| Variable                | Descripción                | Ejemplo                 |
| ----------------------- | -------------------------- | ----------------------- |
| NODE_ENV                | Entorno                    | development, production |
| PORT                    | Puerto del servidor        | 4000                    |
| DB_HOST                 | Host de PostgreSQL         | postgres                |
| DB_PORT                 | Puerto de PostgreSQL (contenedor) | 5432            |
| DB_PORT_HOST            | Puerto de PostgreSQL (host) | 4444                   |
| DB_NAME                 | Nombre de la base de datos | whatsapp_api            |
| DB_USER                 | Usuario de PostgreSQL      | postgres                |
| DB_PASSWORD             | Contraseña de PostgreSQL   | password                |
| WHATSAPP_API_KEY        | API key de WhatsApp        | tu_key                  |
| WHATSAPP_WEBHOOK_SECRET | Secret de webhook          | tu_secret               |
| LOG_LEVEL               | Nivel de logging           | info, debug, error      |

## 🚀 Próximos Pasos

1. **Integrar WhatsApp Business API**

   - Configurar credenciales en `.env`
   - Implementar envío real de mensajes

2. **Agregar Autenticación**

   - JWT tokens
   - Proteger endpoints

3. **Testing**

   - Unit tests
   - Integration tests
   - E2E tests

4. **Documentación API**
   - Swagger/OpenAPI
   - Postman collection

## 📄 Licencia

MIT
