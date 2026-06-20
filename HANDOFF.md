# Handoff — Gym Management System

> Última actualización: 20/06/2026 — Iteración 7 completa (Clases + Reservas + Reportes mejorados)
> Último commit: `8fbcbd6`

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

## Lo que está hecho (Iteración 1, 2, 3, 4 y 5)

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

### Iteración 4 — Pagos
- Entidad Payment: subscriptionId (FK), memberId (FK denormalizado), amount, method (cash/card/transfer), reference, notes, paidAt
- CRUD de pagos con validación (monto auto-prefill desde plan, método obligatorio)
- Generación de recibo vía endpoint GET /payments/:id/receipt (JSON con datos formateados)
- Al crear un pago, se actualiza `subscription.lastPaymentAt` automáticamente
- Frontend: listado paginado de pagos, formulario con select de suscripción + auto-fill de monto, vista de recibo imprimible (HTML + @media print)
- Rutas: /payments, /payments/new, /payments/:id
- Migración: payments + subscriptions.lastPaymentAt

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
| `backend/src/modules/payments/` | Payment CRUD + recibo |
| `backend/src/modules/check-in/` | Check-in con WebSocket |
| `backend/src/modules/reports/` | Dashboard + Reportes (ingresos, miembros) |
| `backend/src/modules/classes/` | Clases CRUD + horarios (Schedule) |
| `backend/src/modules/bookings/` | Reservas con control de cupo + waitlist |
| `backend/src/database/migrations/` | Migraciones SQL |

### Frontend
| Archivo | Propósito |
|---|---|
| `desktop/src/app/app.routes.ts` | Rutas con lazy loading (incluye /plans, /subscriptions, /payments, /classes, /bookings) |
| `desktop/src/app/layouts/main/main-layout.component.ts` | Sidebar + router-outlet (links: Dashboard, Miembros, Planes, Suscripciones, Pagos, Clases, Reservas, Reportes) |
| `desktop/src/app/features/auth/` | Login, auth service, token service, auth store (signals) |
| `desktop/src/app/features/dashboard/` | Dashboard placeholder |
| `desktop/src/app/features/members/` | Lista + formulario miembros |
| `desktop/src/app/features/plans/` | Lista + formulario planes (nuevo) |
| `desktop/src/app/features/subscriptions/` | Lista con acciones (pausar/reanudar/cancelar) + formulario crear (nuevo) |
| `desktop/src/app/features/payments/` | Lista de pagos, formulario, recibo imprimible (nuevo) |
| `desktop/src/app/features/check-in/` | Check-in con Socket.IO, panel de activos |
| `desktop/src/app/features/dashboard/` | Dashboard con cards métricas + gráfico ingresos |
| `desktop/src/app/features/reports/` | Reporte ingresos con filtro fechas + export CSV + auto-load + spinner |
| `desktop/src/app/features/classes/` | Lista + formulario clases con horarios inline |
| `desktop/src/app/features/bookings/` | Calendario mensual, lista con acciones, formulario crear reserva |
| `desktop/src/app/core/services/socket.service.ts` | Cliente Socket.IO |
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

### Iteración 5 — Check-in ✅ + UI Libraries
- Backend: Módulo check-in con verificación de membresía, entry/exit, WebSocket en tiempo real
  - `POST /api/v1/check-in`, `GET /check-in/verify/:memberId`, `GET /check-in/active`
  - WebSocket Gateway con evento `check-in:updated`
  - Migración: check_ins
- Frontend: Pantalla de check-in con búsqueda de socio, panel de activos en tiempo real, Socket.IO
- UI: Instalados Angular Material 18 + Tailwind CSS 3
  - Sidebar migrado a `mat-toolbar` + `mat-nav-list` con íconos
  - Tablas migradas a diseño Tailwind con `mat-paginator`
  - Botones reemplazados por `mat-raised-button` / `mat-stroked-button`
  - Formularios de búsqueda con `mat-form-field` + `matInput`
  - Cards con `mat-card` en todas las páginas de listado
  - Documentación en `docs/UI_LIBRARIES.md`
  - Migración completa pendiente de formularios, diálogos y selectores para Iteración 10

### Iteración 6 — Dashboard + Reportes
- Backend: Módulo reports con 3 endpoints agregados protegidos por JWT
  - `GET /api/v1/reports/dashboard` — ingresos hoy, miembros activos, check-ins hoy, suscripciones activas, ingresos últimos 7 días
  - `GET /api/v1/reports/income?from=&to=` — ingresos agrupados por día + total
  - `GET /api/v1/reports/members` — miembros nuevos del mes, activos, cancelados
- Frontend: Dashboard con 4 cards métricas + gráfico de barras CSS puro + panel resumen
- Frontend: Página Reports con `mat-datepicker`, tabla de ingresos por día, botón exportar CSV
- Sidebar: nuevo ítem "Reportes" con icono `bar_chart`
- Fix error handling dashboard: loading spinner, error message con status + botón reintentar, `console.error`

### Iteración 7 — Clases + Reservas
- Backend: módulo `classes` con entidades GymClass (name, capacity, color, soft delete) + Schedule (dayOfWeek, startTime, endTime, FK → class)
  - CRUD con horarios anidados (delete-all + recreate en update)
  - Paginación corregida: count query separado sin JOIN para evitar duplicados con `leftJoinAndSelect`
- Backend: módulo `bookings` con entidad Booking (status: confirmed/cancelled/waitlisted/attended/no_show, FK → schedule + member)
  - Creación con verificación de capacidad (≤ class.capacity), promoción automática desde waitlist
  - Validación de suscripción activa: status = active + endDate >= now
  - Cancelación que promueve al siguiente waitlisted
  - Marcado como attended
  - Migración 1718000000005: tables classes, schedules, bookings con FKs + indexes
- Frontend: `class-list` con tabla (nombre, capacidad, schedule pills, status badge, editar/eliminar)
- Frontend: `class-form` con editor de horarios inline (agregar/eliminar filas día + hora)
  - Bugfix: schedule index-based tracking fallaba al agregar/eliminar → se cambió a deleteAll + recreateAll
- Frontend: `booking-calendar` — grilla CSS mensual con indicadores de clase por día, navegación prev/next, click para crear
- Frontend: `booking-list` — tabla filtrable por clase y fecha, acciones cancelar/marcar asistencia
- Frontend: `booking-form` — select miembro → clase → horario → fecha, feedback de waitlist
- Fix NG8107: `s.startTime?.slice`, `s.endTime?.slice` → sin optional chaining (class-form + booking-form)
- Seed: 3 clases (Spinning Lu/Mi/Vi 18-19, Yoga Ma/Ju 07-08, Funcional Lu/Mi/Vi 07-08) + 4 reservas demo (Carlos: 3 spinning, Juan: 1 spinning)

### Iteración 7.1 — Reportes mejorados
- **Auto-load**: `ngOnInit` con fechas default (1ro del mes → hoy) + carga automática al entrar
- **Loading indicator**: `mat-spinner` + texto "Cargando..." durante el request
- **Error handler**: mensaje en banner rojo + `console.error` en vez de `error: () => {}`
- **DatePipe provider**: agregado `providers: [DatePipe]` para evitar `NullInjectorError`
- **Backend validation**: `BadRequestException` si faltan o son inválidos los parámetros `from` / `to`

### Iteración 6.1 — Pago integrado al crear suscripción
- Al crear una suscripción, el pago se registra automáticamente (obligatorio)
- Formulario de suscripción: nueva sección "Datos de pago" con método (required), monto (prefijado con precio del plan), referencia y notas (opcional)
- Backend: `SubscriptionsService.create()` crea Payment con `paidAt: new Date()` después de la suscripción
- Payment form: campo `paidAt` prefijado con fecha/hora actual
- Nueva documentación: `docs/FLUJO_PAGO.md`

### Seed actualizado (19/06)
- Ahora genera datos completos: admin, 5 miembros, 3 planes, **4 suscripciones + pagos integrados**, **26 check-ins** últimos 7 días
- Pedro Sánchez queda sin suscripción (para probar flujo de alta)
- Los check-ins se distribuyen aleatoriamente con entradas/salidas y timestamps variados

### Bugfix: incomeLast7Days
- `DATE(p.paidAt)` de PostgreSQL retorna un objeto `Date`, no `string`. El Map comparaba Date vs string → nunca coincidían. Se normalizó el tipo al insertar en el Map.

## Temas pendientes

1. **Budget del bundle**: Angular Material aumentó el tamaño inicial a ~670 kB. Ajustar `maximumBudget` en `angular.json` o habilitar lazy loading de módulos Material. (Iteración 10)
2. **confirm() nativos**: Varios componentes aún usan `confirm()` de JavaScript. Migrar a `mat-dialog`. (Iteración 10)
3. **Formularios sin Material**: MemberForm, PlanForm, SubscriptionForm con pago, PaymentForm aún usan CSS custom. (Iteración 10)
4. **Charts**: El gráfico de ingresos es CSS puro (barras). Si se necesita más sofisticación, instalar chart.js. (Iteración 10)

## Siguiente paso (Iteración 8)

La próxima iteración según `docs/MVP_ROADMAP.md` es:

### Notificaciones + Recordatorios
- Backend: módulo `notifications` con canales email/SMS/push
- Jobs cron para: expiración de suscripciones, pago vencido, recordatorio de reserva
- Frontend: preferencias de notificación por miembro, historial de notificaciones enviadas

### Tip: el seed ya genera datos completos
Si necesitás resetear la BD, solo hace falta:
```bash
docker compose down -v && docker compose up -d
cd backend && pnpm build && pnpm migration:run && pnpm seed
```

### Errores comunes al retomar
- El backend puede crashear si PostgreSQL no está corriendo → revisar `docker ps`
- Si cambia la entidad, crear nueva migración y ejecutar `pnpm migration:run`
- `ng serve` puede no detectar cambios de archivos nuevos → reiniciar `pnpm start`
- Si Electron no carga, esperar 10-15s (retry loop, hasta 30 intentos)
- El puerto 3000 puede quedar ocupado → `lsof -ti:3000 | xargs kill -9`
- Tras seed, verificar que las clases y horarios se crearon en la BD antes de crear reservas

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
