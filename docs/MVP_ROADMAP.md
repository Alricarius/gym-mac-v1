# MVP Roadmap — Implementación Iterativa

Cada iteración entrega un sistema **funcional y testeable**. Podés probar cada paso antes de continuar al siguiente.

---

## Iteración 1: Scaffold + Auth

**Duración**: 2-3 días  
**Objetivo**: Tener el proyecto completo corriendo con autenticación funcional.

### Backend

| Archivos a crear | Propósito |
|---|---|
| `backend/` | Proyecto NestJS con TypeORM + PostgreSQL |
| `src/modules/auth/` | Login, refresh token, logout, me |
| `src/modules/users/` | CRUD de usuarios del sistema |
| `src/common/guards/` | JwtAuthGuard, RolesGuard |
| `src/common/decorators/` | @CurrentUser, @Roles |

Endpoints:
```
POST /api/v1/auth/login    → { accessToken, refreshToken, user }
POST /api/v1/auth/refresh  → { accessToken, refreshToken }
POST /api/v1/auth/logout
GET  /api/v1/auth/me       → User
```

### Frontend

| Archivos a crear | Propósito |
|---|---|
| `desktop/` | Proyecto Angular 18 + Electron |
| `src/app/features/auth/` | Login page, auth service, token storage |
| `src/app/core/guards/` | Auth guard (redirect si no token) |
| `src/app/core/interceptors/` | Auth interceptor (adjunta JWT) |
| `src/app/layouts/` | Main layout + auth layout |
| `electron/` | Main process, preload, IPC básico |

### Criterio de aceptación

```
1. Ejecutás pnpm start en backend → servidor en :3000
2. Ejecutás pnpm start en desktop → ventana Electron con login
3. Te logueás con admin@admin.com / Admin123
4. Ves el dashboard vacío con tu nombre de usuario
5. Probás refresh token cerrando y abriendo la app
```

---

## Iteración 2: Miembros (CRUD)

**Duración**: 2 días  
**Objetivo**: Sistema de gestión de miembros funcional.

### Backend

| Archivos | Propósito |
|---|---|
| `src/modules/members/` | CRUD completo, soft delete, búsqueda |
| `database/migrations/` | Migración de tabla members |

Endpoints:
```
POST   /api/v1/members
GET    /api/v1/members?page=1&limit=20&search=juan
GET    /api/v1/members/:id
PATCH  /api/v1/members/:id
DELETE /api/v1/members/:id
```

### Frontend

| Archivos | Propósito |
|---|---|
| `src/app/features/members/` | Lista, formulario, detalle |
| `src/app/shared/components/data-table/` | Tabla reutilizable con paginación |
| `src/app/shared/components/search-bar/` | Búsqueda |

### Criterio de aceptación

```
1. Creás un miembro con nombre, email, teléfono
2. Lo ves en la lista paginada
3. Lo editás (cambiás teléfono)
4. Buscás por nombre parcial
5. Lo eliminás → ya no aparece (soft delete)
```

---

## Iteración 3: Planes + Suscripciones

**Duración**: 2-3 días  
**Objetivo**: Definir planes de membresía y asignarlos a miembros.

### Backend

| Archivos | Propósito |
|---|---|
| `src/modules/plans/` | CRUD de planes |
| `src/modules/subscriptions/` | Asignación, pausa, reanudación, cancelación |

Endpoints:
```
POST   /api/v1/plans
GET    /api/v1/plans
PATCH  /api/v1/plans/:id
DELETE /api/v1/plans/:id

POST   /api/v1/subscriptions                     (asignar plan a miembro)
GET    /api/v1/subscriptions
GET    /api/v1/subscriptions/:id
POST   /api/v1/subscriptions/:id/pause
POST   /api/v1/subscriptions/:id/resume
POST   /api/v1/subscriptions/:id/cancel
GET    /api/v1/members/:id/subscriptions
```

### Frontend

| Archivos | Propósito |
|---|---|
| `src/app/features/plans/` | Lista de planes + formulario |
| `src/app/features/subscriptions/` | Asignar plan, vista de suscripción activa |

### Criterio de aceptación

```
1. Creás 3 planes: mensual ($30), trimestral ($80), anual ($300)
2. Asignás plan mensual a un miembro
3. Ves la suscripción activa con fecha de fin
4. Pausás la suscripción → estado "paused"
5. Cancelás la suscripción → estado "cancelled"
```

---

## Iteración 4: Pagos

**Duración**: 2 días  
**Objetivo**: Registrar pagos y generar comprobantes.

### Backend

| Archivos | Propósito |
|---|---|
| `src/modules/payments/` | Registro de pagos, recibo PDF |

Endpoints:
```
POST   /api/v1/payments
GET    /api/v1/payments
GET    /api/v1/payments/:id
GET    /api/v1/payments/:id/receipt
GET    /api/v1/members/:id/payments
```

### Frontend

| Archivos | Propósito |
|---|---|
| `src/app/features/payments/` | Registrar pago, historial, recibo |

### Criterio de aceptación

```
1. Registrás un pago en efectivo para una suscripción
2. Ves el pago en el historial del miembro
3. Generás el recibo en pantalla
4. Probás registrar pago con tarjeta
5. La suscripción se marca como pagada
```

---

## Iteración 5: Check-in

**Duración**: 2 días  
**Objetivo**: Control de entrada/salida con WebSocket en tiempo real.

### Backend

| Archivos | Propósito |
|---|---|
| `src/modules/check-in/` | Verificación, registro, WebSocket |

Endpoints:
```
POST /api/v1/check-in                → { memberId, type: 'entry'|'exit' }
GET  /api/v1/check-in/verify/:memberId → { canEnter, reason? }
GET  /api/v1/check-in/active         → Lista de miembros adentro
```

WebSocket event: `check-in:updated`

### Frontend

| Archivos | Propósito |
|---|---|
| `src/app/features/check-in/` | Pantalla de check-in, panel de activos |
| `src/app/core/services/socket.service.ts` | Cliente Socket.IO |

### Criterio de aceptación

```
1. Buscás un miembro por nombre
2. El sistema verifica que tenga membresía activa
3. Registrás entrada → aparece en "Miembros en el gym"
4. El panel de activos se actualiza en tiempo real
5. Registrás salida → desaparece del panel
6. Probás con un miembro sin membresía → rechaza entrada
```

---

## Iteración 6: Dashboard + Reportes básicos

**Duración**: 2 días  
**Objetivo**: Visualizar métricas clave del negocio.

### Backend

| Archivos | Propósito |
|---|---|
| `src/modules/reports/` | Consultas agregadas para dashboard |

Endpoints:
```
GET /api/v1/reports/dashboard          → { todayIncome, activeMembers, todayCheckIns, etc }
GET /api/v1/reports/income?from=&to=   → Ingresos por período
GET /api/v1/reports/members            → Miembros nuevos/activos/cancelados
```

### Frontend

| Archivos | Propósito |
|---|---|
| `src/app/features/dashboard/` | Dashboard con cards + gráficos |
| `src/app/features/reports/` | Reporte de ingresos, exportación |

### Criterio de aceptación

```
1. Abrís el dashboard → ves cards con: ingresos hoy, miembros activos, check-ins hoy
2. Ves un gráfico de ingresos de los últimos 7 días
3. Generás reporte de ingresos por rango de fechas
4. Exportás reporte a CSV
```

---

## Iteración 7: Clases + Reservas

**Duración**: 3 días  
**Objetivo**: Programar clases y permitir reservas de miembros.

### Backend

| Archivos | Propósito |
|---|---|
| `src/modules/classes/` | CRUD de clases + horarios |
| `src/modules/bookings/` | Reservas con control de cupo |

Endpoints:
```
POST   /api/v1/classes
GET    /api/v1/classes
PATCH  /api/v1/classes/:id
DELETE /api/v1/classes/:id
POST   /api/v1/classes/:id/schedules
DELETE /api/v1/classes/:id/schedules/:schId

POST   /api/v1/bookings
GET    /api/v1/bookings
PATCH  /api/v1/bookings/:id
DELETE /api/v1/bookings/:id
```

### Frontend

| Archivos | Propósito |
|---|---|
| `src/app/features/classes/` | Gestión de clases + horarios |
| `src/app/features/bookings/` | Reserva de clases, calendario |

### Criterio de aceptación

```
1. Creás una clase "Spinning" con capacidad 15, Lu/Mi/Vi 18:00
2. Agregás horario adicional Ma/Ju 07:00
3. Reservás un miembro a la clase del lunes
4. Verificás que el cupo disponible se actualice
5. Cancelás la reserva
6. Intentás reservar con cupo lleno → te pone en lista de espera
```

---

## Iteración 8: Notificaciones + Recordatorios

**Duración**: 2 días  
**Objetivo**: El sistema envía alertas automáticas.

### Backend

| Archivos | Propósito |
|---|---|
| `src/modules/notifications/` | Canales email/SMS/push, cola de notificaciones |
| `src/modules/tasks/` | Tareas programadas (cron) |

Eventos:
- `subscription.expiring` (3 días antes) → recordatorio
- `payment.overdue` → aviso de deuda
- `booking.reminder` (30 min antes de clase)

### Frontend

| Archivos | Propósito |
|---|---|
| `src/app/features/notifications/` | Centro de notificaciones, preferencias |

### Criterio de aceptación

```
1. Configurás email SMTP en settings
2. Una suscripción está por vencer → llega email al miembro
3. Un miembro tiene una clase en 30 min → llega notificación push
4. Ves el historial de notificaciones enviadas
```

---

## Iteración 9: Multisucursal + Inventario

**Duración**: 3 días  
**Objetivo**: Soporte para múltiples sucursales y control de inventario.

### Backend

| Archivos | Propósito |
|---|---|
| `src/modules/branches/` | CRUD de sucursales |
| `src/modules/inventory/` | Equipos + préstamos |

Endpoints:
```
POST   /api/v1/branches
GET    /api/v1/branches
PATCH  /api/v1/branches/:id

POST   /api/v1/inventory
GET    /api/v1/inventory
PATCH  /api/v1/inventory/:id
DELETE /api/v1/inventory/:id
POST   /api/v1/inventory/:id/loan
POST   /api/v1/inventory/:id/return
```

### Frontend

| Archivos | Propósito |
|---|---|
| `src/app/features/branches/` | Gestión de sucursales |
| `src/app/features/inventory/` | Inventario + préstamos |
| Branch selector en header | Cambiar entre sucursales |

### Criterio de aceptación

```
1. Creás 2 sucursales: "Sucursal Norte" y "Sucursal Sur"
2. Cambiás entre sucursales desde un selector
3. Agregás equipos al inventario de cada sucursal
4. Prestás una pesa a un miembro
5. Registrás la devolución
```

---

## Iteración 10: Configuración + Admin + Polish

**Duración**: 3 días  
**Objetivo**: Sistema completo listo para producción.

### Backend

| Archivos | Propósito |
|---|---|
| `src/modules/config/` | Configuración del gimnasio |
| `src/modules/users/` | Admin panel de usuarios |

### Frontend

| Archivos | Propósito |
|---|---|
| `src/app/features/settings/` | Configuración general |
| `src/app/features/users/` | Administración de usuarios |

### Criterio de aceptación

```
1. Creás un usuario con rol "recepcionista"
2. El recepcionista solo ve members + check-in
3. Cambiás horario del gimnasio en settings
4. Configurás impuestos (IVA)
5. Empaquetás la app con electron-builder
6. Probás el auto-update con un release de GitHub
```

---

## Resumen de iteraciones

| It | Módulos | Archivos nuevos (aprox) | Días |
|----|---------|------------------------|------|
| 1 | Scaffold + Auth | 30+ | 2-3 |
| 2 | Members CRUD | 15 | 2 |
| 3 | Plans + Subscriptions | 20 | 2-3 |
| 4 | Payments | 15 | 2 |
| 5 | Check-in | 15 | 2 |
| 6 | Dashboard + Reports | 15 | 2 |
| 7 | Classes + Booking | 20 | 3 |
| 8 | Notifications | 15 | 2 |
| 9 | Branches + Inventory | 20 | 3 |
| 10 | Settings + Admin + Polish | 15 | 3 |
| **Total** | | **~180** | **~23-26** |
