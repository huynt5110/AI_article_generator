# AI Article Generator — Backend Foundation Implementation Plan

## Goal

Build the production-grade NestJS backend foundation for an AI-powered travel article generation platform. This phase focuses **exclusively** on:

- NestJS app scaffolding (modular monolith)
- PostgreSQL + Prisma ORM setup
- JWT Authentication (access + refresh token rotation)
- User management module
- Global validation, error handling, config, and Swagger

**AI processing, uploads, article drafts, etc. are explicitly OUT of scope.**

---

## BFRI Assessment (Backend Feasibility & Risk Index)

Per the **backend-dev-guidelines** skill:

| Dimension                 | Score | Rationale                                                    |
|--------------------------|-------|--------------------------------------------------------------|
| Architectural Fit        | 5     | Clean modular monolith, follows NestJS layered architecture  |
| Testability              | 5     | All services are DI-injectable, easily mocked                |
| Business Logic Complexity| 2     | Standard auth + CRUD, no complex domain logic                |
| Data Risk                | 2     | User credentials & tokens require security but well-understood|
| Operational Risk         | 1     | Local dev, no external infra beyond Postgres                 |

**BFRI = (5 + 5) − (2 + 2 + 1) = 5** → **Moderate** → Proceed with tests + monitoring

---

## Skill Alignment

### Applied Skills

| Skill | How It's Applied |
|-------|-----------------|
| **backend-dev-guidelines** | BFRI assessment, layered architecture (Controllers → Services → Repositories), DI, no direct Prisma in controllers, typed config, no `process.env` |
| **error-handling-patterns** | Custom `ApplicationError` hierarchy, global exception filter, structured error responses, fail-fast validation |
| **microservices-patterns** | NOT applied (requirement explicitly says modular monolith, not microservices) |
| **kafka_design_patterns** | NOT applied (no event streaming in Phase 1) |
| **kafka_anti_patterns** | NOT applied (no Kafka in Phase 1) |

### Skill Adaptation Notes

> [!IMPORTANT]
> The **backend-dev-guidelines** skill is written for Express.js with Zod/Sentry. We are building with **NestJS** which has its own DI, validation (class-validator), guards, filters, and interceptors. The following adaptations apply:
> 
> - **Zod → class-validator/class-transformer** (as required by Requirement.md)
> - **Express routes → NestJS Controllers + Decorators**
> - **BaseController pattern → NestJS global exception filter** (NestJS handles this natively)
> - **Sentry → NestJS Logger** (can add Sentry integration later via interceptor)
> - **`unifiedConfig` → `@nestjs/config` with typed ConfigService** (as required by Requirement.md)
> - **Repository pattern** → Services wrap Prisma (no separate repository layer needed given Prisma's type-safe query builder acts as the repository)

---

## Open Questions

> [!IMPORTANT]
> **Docker Setup** — Should I include a `docker-compose.yml` for PostgreSQL, or do you already have a PostgreSQL instance running locally?

> [!NOTE]
> **Testing Framework** — NestJS ships with Jest by default. I'll use Jest for unit and integration tests. Let me know if you prefer Vitest or another framework.

---

## Proposed Changes

### 1. Project Scaffolding

#### [NEW] NestJS project initialization

Scaffold the NestJS project into the current workspace using `nest new`:
```bash
npx -y @nestjs/cli@latest new AI_article_generator --directory ./ --strict --skip-git --package-manager npm
```

Install additional dependencies:
```bash
# Core
npm install @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/swagger
npm install passport passport-jwt bcrypt class-validator class-transformer
npm install @prisma/client

# Dev
npm install -D prisma @types/bcrypt @types/passport-jwt
```

---

### 2. Configuration Module

#### [NEW] [src/config/env.validation.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/config/env.validation.ts)

Environment variable validation using `class-validator` + `class-transformer`. Validates all required env vars at startup (fail-fast). Typed config object.

```typescript
class EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;  // e.g., "15m"
  JWT_REFRESH_EXPIRES_IN: string; // e.g., "30d"
}
```

#### [NEW] [src/config/app.config.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/config/app.config.ts)

Typed config namespace using `registerAs()` for app settings.

#### [NEW] [src/config/jwt.config.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/config/jwt.config.ts)

Typed config namespace for JWT settings.

#### [NEW] [src/config/database.config.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/config/database.config.ts)

Typed config namespace for database settings.

#### [NEW] [.env](file:///c:/Users/ADMIN/Documents/AI_article_generator/.env)

Development environment file with all required variables.

#### [NEW] [.env.example](file:///c:/Users/ADMIN/Documents/AI_article_generator/.env.example)

Template for environment variables (no secrets).

---

### 3. Infrastructure — Prisma

#### [NEW] [prisma/schema.prisma](file:///c:/Users/ADMIN/Documents/AI_article_generator/prisma/schema.prisma)

Prisma schema with `User` and `RefreshToken` models as specified in requirements:

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  passwordHash  String
  firstName     String?
  lastName      String?
  refreshTokens RefreshToken[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@map("users")
}

model RefreshToken {
  id        String    @id @default(cuid())
  tokenHash String
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
  @@index([tokenHash])
  @@map("refresh_tokens")
}
```

#### [NEW] [src/infrastructure/prisma/prisma.service.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/infrastructure/prisma/prisma.service.ts)

Singleton `PrismaService` extending `PrismaClient`. Implements `OnModuleInit` and `OnModuleDestroy` for lifecycle management (connect on startup, disconnect on shutdown).

#### [NEW] [src/infrastructure/prisma/prisma.module.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/infrastructure/prisma/prisma.module.ts)

Global module exporting `PrismaService`.

---

### 4. Common — Error Handling & Shared Infrastructure

Per the **error-handling-patterns** skill, implement a custom exception hierarchy.

#### [NEW] [src/common/exceptions/application.exception.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/common/exceptions/application.exception.ts)

Custom exception hierarchy:
```
ApplicationException (base)
├── ValidationException (400)
├── UnauthorizedException (401)
├── ForbiddenException (403)
├── NotFoundException (404)
└── ConflictException (409)
```

Each carries: `message`, `errorCode` (string enum), `statusCode`, and optional `details`.

#### [NEW] [src/common/filters/global-exception.filter.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/common/filters/global-exception.filter.ts)

Global exception filter that catches all exceptions and returns standardized error responses:

```json
{
  "statusCode": 400,
  "message": "Invalid credentials",
  "error": "BAD_REQUEST",
  "timestamp": "2026-05-23T...",
  "path": "/auth/login"
}
```

Logs all errors using NestJS Logger (structured). Handles both `HttpException` and custom `ApplicationException`.

#### [NEW] [src/common/interceptors/response-transform.interceptor.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/common/interceptors/response-transform.interceptor.ts)

Wraps all success responses in the standardized format:
```json
{
  "data": { ... },
  "meta": {},
  "error": null
}
```

#### [NEW] [src/common/decorators/current-user.decorator.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/common/decorators/current-user.decorator.ts)

Custom `@CurrentUser()` param decorator to extract authenticated user from request.

#### [NEW] [src/common/decorators/public.decorator.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/common/decorators/public.decorator.ts)

`@Public()` decorator to mark routes that bypass JWT authentication.

#### [NEW] [src/common/guards/jwt-auth.guard.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/common/guards/jwt-auth.guard.ts)

Global JWT auth guard that checks for `@Public()` decorator.

#### [NEW] [src/common/types/jwt-payload.type.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/common/types/jwt-payload.type.ts)

Type definitions for JWT payload (`sub`, `email`).

#### [NEW] [src/common/constants/error-codes.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/common/constants/error-codes.ts)

Centralized error code constants.

---

### 5. Auth Module

#### [NEW] [src/modules/auth/auth.module.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/auth/auth.module.ts)

Auth module registering JWT strategy, passport, and auth service. Imports `UsersModule` for user lookups.

#### [NEW] [src/modules/auth/auth.controller.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/auth/auth.controller.ts)

Endpoints (all `@Public()` except `/auth/me` and `/auth/logout`):

| Method | Endpoint        | Auth Required | Description               |
|--------|----------------|---------------|---------------------------|
| POST   | `/auth/register`| No            | Register new user         |
| POST   | `/auth/login`   | No            | Login with email/password |
| POST   | `/auth/refresh` | No            | Refresh tokens            |
| POST   | `/auth/logout`  | Yes           | Revoke refresh token      |
| GET    | `/auth/me`      | Yes           | Get current user profile  |

Controller only validates requests and calls `AuthService` — **zero business logic** (per backend-dev-guidelines).

#### [NEW] [src/modules/auth/auth.service.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/auth/auth.service.ts)

Business logic for:
- `register()` — validate uniqueness, hash password (bcrypt, 10 rounds), create user, generate tokens
- `login()` — verify credentials, generate tokens, persist hashed refresh token
- `refresh()` — validate refresh token against hash, rotate (revoke old, issue new), return new pair
- `logout()` — revoke refresh token
- `getProfile()` — return user data (excluding `passwordHash`)

**Security**: Refresh tokens are hashed with bcrypt before DB storage (as required).

#### [NEW] [src/modules/auth/strategies/jwt.strategy.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/auth/strategies/jwt.strategy.ts)

Passport JWT strategy. Extracts token from `Authorization: Bearer` header. Validates payload and attaches user to request.

#### [NEW] [src/modules/auth/dto/register.dto.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/auth/dto/register.dto.ts)

```typescript
class RegisterDto {
  @IsEmail()
  email: string;

  @IsString() @MinLength(8)
  password: string;

  @IsString() @IsOptional()
  firstName?: string;

  @IsString() @IsOptional()
  lastName?: string;
}
```

#### [NEW] [src/modules/auth/dto/login.dto.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/auth/dto/login.dto.ts)

#### [NEW] [src/modules/auth/dto/refresh-token.dto.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/auth/dto/refresh-token.dto.ts)

#### [NEW] [src/modules/auth/dto/auth-response.dto.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/auth/dto/auth-response.dto.ts)

Response DTO for token pairs — never exposes `passwordHash` or `tokenHash`.

---

### 6. Users Module

#### [NEW] [src/modules/users/users.module.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/users/users.module.ts)

Users module. Exports `UsersService` for use by `AuthModule`.

#### [NEW] [src/modules/users/users.controller.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/users/users.controller.ts)

Endpoints (all require auth):

| Method | Endpoint     | Description              |
|--------|-------------|--------------------------|
| GET    | `/users/me`  | Get own profile          |
| PATCH  | `/users/me`  | Update own profile       |

#### [NEW] [src/modules/users/users.service.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/users/users.service.ts)

User business logic. Wraps all Prisma calls — **no direct Prisma access from controllers**.

Methods:
- `findByEmail(email)` — lookup for auth
- `findById(id)` — lookup for profile
- `create(data)` — create user record
- `update(id, data)` — update profile fields
- `sanitize(user)` — strip `passwordHash` from response

#### [NEW] [src/modules/users/dto/update-user.dto.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/users/dto/update-user.dto.ts)

#### [NEW] [src/modules/users/dto/user-response.dto.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/users/dto/user-response.dto.ts)

---

### 7. Health Module

#### [NEW] [src/modules/health/health.module.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/health/health.module.ts)
#### [NEW] [src/modules/health/health.controller.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/modules/health/health.controller.ts)

Simple `GET /health` endpoint marked `@Public()`. Returns `{ status: 'ok' }`.

---

### 8. App Module & Bootstrap

#### [MODIFY] [app.module.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/app.module.ts)

Root module importing:
- `ConfigModule.forRoot()` (global, with validation)
- `PrismaModule`
- `AuthModule`
- `UsersModule`
- `HealthModule`

Registers global guard (`JwtAuthGuard`) via `APP_GUARD`.

#### [MODIFY] [main.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/main.ts)

Bootstrap configuration:
- Global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`)
- Global exception filter
- Global response transform interceptor
- Swagger setup (`SwaggerModule`)
- CORS configuration
- Port from config

---

### 9. Swagger / OpenAPI

#### Configured in [main.ts](file:///c:/Users/ADMIN/Documents/AI_article_generator/src/main.ts)

```typescript
const config = new DocumentBuilder()
  .setTitle('AI Article Generator API')
  .setDescription('Backend API for AI-powered travel article generation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
```

Available at `GET /api/docs`.

---

### 10. Docker Compose (Development)

#### [NEW] [docker-compose.yml](file:///c:/Users/ADMIN/Documents/AI_article_generator/docker-compose.yml)

PostgreSQL 16 service for local development:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: travel_ai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

---

## File Summary

| Category | Files | Purpose |
|----------|-------|---------|
| Config | 5 files | Env validation, typed config namespaces, `.env` |
| Infrastructure | 3 files | Prisma schema, service, module |
| Common | 8 files | Exception hierarchy, global filter, interceptor, guards, decorators, types, constants |
| Auth Module | 7 files | Controller, service, JWT strategy, DTOs |
| Users Module | 5 files | Controller, service, DTOs |
| Health Module | 2 files | Controller, module |
| App Bootstrap | 2 files | `app.module.ts`, `main.ts` |
| DevOps | 3 files | `docker-compose.yml`, `.env`, `.env.example` |
| **Total** | **~35 files** | |

---

## Verification Plan

### Automated Tests

```bash
# 1. Build check — ensures TypeScript compiles
npm run build

# 2. Unit tests — service layer logic
npm run test

# 3. E2E tests — full auth flow
npm run test:e2e
```

### Manual Verification

1. **Start PostgreSQL**: `docker-compose up -d`
2. **Run migrations**: `npx prisma migrate dev`
3. **Start server**: `npm run start:dev`
4. **Test via Swagger**: Open `http://localhost:3000/api/docs`
5. **Auth flow walkthrough**:
   - Register → Login → Access protected endpoint → Refresh → Logout
   - Verify refresh token rotation (old token invalidated)
   - Verify expired access token returns 401
   - Verify invalid refresh token returns 401

### Security Verification

- [ ] Passwords are bcrypt-hashed (10 rounds)
- [ ] Refresh tokens are hashed before DB storage
- [ ] `passwordHash` never appears in API responses
- [ ] `tokenHash` never appears in API responses
- [ ] Invalid credentials return generic "Invalid credentials" (no info leak)
- [ ] Refresh token rotation works (old token revoked after use)
