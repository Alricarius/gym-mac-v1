# Handoff — Gym Management System

> Última actualización: 18/06/2026

## Stack

| Capa | Tecnología |
|---|---|
| Desktop | Electron + Angular 18 (standalone, signals) |
| Backend | NestJS 10 + TypeORM |
| BD | PostgreSQL 16 (Docker) |
| Auth | JWT + refresh token rotation |
| ORM | TypeORM con migraciones |

## Proyecto en disco

```
/Users/jp8/Documents/projects/test/
├── backend/          # NestJS + TypeORM
├── desktop/          # Angular 18 + Electron
├── docs/             # Documentación (17 archivos)
├── docker-compose.yml
├── .env
├── HANDOFF.md
└── README.md
```

## Cómo levantar

### 1. PostgreSQL (Docker)
```bash
docker compose up -d
```

### 2. Backend (puerto 3000)
```bash
cd backend && pnpm start:dev
# seed (primera vez o si se resetea la BD):
pnpm seed
```

### 3. Frontend (Angular + Electron)
```bash
cd desktop && pnpm start
# Debe cargar http://localhost:4200 automáticamente
```

### Credenciales
- admin@admin.com / Admin123

## Lo que está hecho (Iteración 1, 2 y 3)

### Iteración 1 — Scaffold + Auth
- Backend NestJS con módulos: Auth, Users, Common
- Login con JWT, refresh token rotation, logout, /me
- CRUD de usuarios con soft delete, roles (admin/receptionist/trainer)
- Guards: JwtAuthGuard, RolesGuard, decorators: @CurrentUser, @Roles
- Migración: users + refresh_tokens
- Seed: admin@admin.com
- Frontend Angular 18 standalone + Electron
- Login page con formulario, interceptor JWT, guards de ruta
- Layouts: auth (login) + main (sidebar con logout)
- Dashboard placeholder
- CORS configurado (localhost:4200 + file://)

### Iteración 2 — Miembros CRUD
- Entidad Member: fullName, email, phone, birthDate, gender, address, notes, status, soft delete
- CRUD completo con búsqueda paginada (ILike por nombre)
- Frontend: lista con tabla, búsqueda en vivo, paginación, formulario crear/editar
- 5 miembros de seed
- Migración: members

### Iteración 3 — Planes + Suscripciones
- Entidad Plan (`subscription_plans`): name, duration, price, classCount, description, isActive, soft delete
- Entidad Subscription (`subscriptions`): memberId, planId, startDate, endDate, status (active/paused/cancelled/expired), pausedAt, pausedDays
- CRUD de planes con búsqueda paginada
- Suscripciones: crear, pausar, reanudar, cancelar (con reglas de negocio)
- Un miembro puede tener solo una suscripción activa a la vez
- endDate se calcula automáticamente según duración del plan
- Al reanudar, se extiende endDate por los días pausados
- Frontend: listado y formulario de planes, listado de suscripciones con acciones contextuales, formulario de asignación
- 3 planes de seed: Mensual ($30), Trimestral ($80), Anual ($300)
- Migración: subscription_plans + subscriptions

## Archivos clave

### Backend
| Archivo | Propósito |
|---|---|
| `backend/src/main.ts` | Bootstrap, CORS, ValidationPipe |
| `backend/src/app.module.ts` | Módulo raíz |
| `backend/src/config.ts` | Config desde env |
| `backend/src/ormconfig.ts` | DataSource TypeORM |
| `backend/src/seed.ts` | Seed de datos |
| `backend/src/common/guards/` | JwtAuthGuard, RolesGuard |
| `backend/src/common/decorators/` | @CurrentUser, @Roles |
| `backend/src/modules/auth/` | Auth: login, refresh, logout, me |
| `backend/src/modules/users/` | Users CRUD |
| `backend/src/modules/members/` | Members CRUD con búsqueda |
| `backend/src/database/migrations/` | Migraciones SQL |

### Frontend
| Archivo | Propósito |
|---|---|
| `desktop/src/app/app.routes.ts` | Rutas con lazy loading (incluye /plans, /subscriptions) |
| `desktop/src/app/layouts/main/main-layout.component.ts` | Sidebar + router-outlet (links: Dashboard, Miembros, Planes, Suscripciones) |
| `desktop/src/app/features/auth/` | Login, auth service, token service, auth store (signals) |
| `desktop/src/app/features/dashboard/` | Dashboard placeholder |
| `desktop/src/app/features/members/` | Lista + formulario miembros |
| `desktop/src/app/features/plans/` | Lista + formulario planes (nuevo) |
| `desktop/src/app/features/subscriptions/` | Lista con acciones (pausar/reanudar/cancelar) + formulario crear (nuevo) |
| `desktop/src/app/core/interceptors/auth.interceptor.ts` | JWT interceptor con refresh |
| `desktop/src/app/core/guards/auth.guard.ts` | authGuard, loginGuard |
| `desktop/electron/main.ts` | Main process con retry para ng serve |
| `desktop/electron/preload.ts` | Context bridge IPC |

## Issues conocidos resueltos

1. **CORS**: El backend solo permitía `file://`, se agregó `http://localhost:4200` (dev)
2. **Migración**: Fallaba con ts-node, se cambió a `build && dist/ormconfig.js`
3. **Race condition Electron**: Arrancaba antes que ng serve, se agregó retry loop en main.ts
4. **RouterLink faltante**: MainLayoutComponent no importaba RouterLink/RouterLinkActive, los links del sidebar no funcionaban
5. **Seed duplicado**: Fallaba si ya existía el admin, se agregó try/catch

## Siguiente paso (Iteración 4)

La próxima iteración sugerida según `docs/MVP_ROADMAP.md` es:

### Pagos
- Backend: entidad `Payment` (suscripción, monto, método, fecha, comprobante)
- Backend: CRUD de pagos, generación de recibo
- Frontend: registrar pago, historial de pagos por miembro, recibo en pantalla

### Cómo empezar Iteración 4
1. Leer `docs/MVP_ROADMAP.md` para endpoints exactos
2. Seguir patrones de módulos existentes (`plans`, `subscriptions`)
3. Backend: crear módulo payments con entity, migration, service, controller
4. Frontend: crear feature con pages/services, agregar rutas lazy-loaded

### Errores comunes al retomar
- El backend puede crashear si PostgreSQL no está corriendo → revisar `docker ps`
- Si cambia la entidad, crear nueva migración y ejecutar `pnpm migration:run`
- `ng serve` puede no detectar cambios de archivos nuevos → reiniciar `pnpm start`
- Si Electron no carga, esperar 10-15s (retry loop, hasta 30 intentos)

## Variables de entorno (`.env`)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_development
DB_USER=gym_user
DB_PASSWORD=gym_pass
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

## Comandos útiles

```bash
# Backend
pnpm start:dev          # Desarrollo con watch mode
pnpm build              # Compilar a JS
pnpm seed               # Poblar datos de prueba
pnpm migration:run      # Ejecutar migraciones pendientes
pnpm migration:revert   # Revertir última migración

# Frontend
pnpm start              # ng serve + Electron concurrente
pnpm build              # Build producción
```
