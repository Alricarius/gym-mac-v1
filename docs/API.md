# API REST

## Diseño general

- **Formato**: JSON
- **Versionado**: vía header `Accept: application/vnd.gym.v1+json`
- **Base URL**: `/api/v1`
- **Autenticación**: `Authorization: Bearer <token>`
- **Paginación**: basada en page/limit con metadata
- **Errores**: objeto estandarizado con código, mensaje y timestamp

## Estandar de respuestas

### Éxito

```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

Para respuestas de lista:

```json
{
  "data": [ ... ],
  "meta": { ... }
}
```

Para respuestas individuales:

```json
{
  "data": { ... }
}
```

### Error

```json
{
  "statusCode": 409,
  "error": "SUBSCRIPTION_EXPIRED",
  "message": "La membresía del miembro 123 está vencida",
  "timestamp": "2026-06-18T12:00:00.000Z",
  "path": "/api/v1/check-in/verify"
}
```

## Endpoints

### Auth

```
POST   /api/v1/auth/login              → { accessToken, refreshToken, user }
POST   /api/v1/auth/refresh            → { accessToken, refreshToken }
POST   /api/v1/auth/logout
GET    /api/v1/auth/me                 → User (token actual)
```

### Members

```
POST   /api/v1/members                  → Create member
GET    /api/v1/members                  → List members (paginated)
GET    /api/v1/members/:id              → Get member by ID
PATCH  /api/v1/members/:id              → Update member
DELETE /api/v1/members/:id              → Soft delete member
GET    /api/v1/members/:id/subscriptions → Member's subscriptions
GET    /api/v1/members/:id/check-ins    → Member's check-in history
GET    /api/v1/members/:id/payments     → Member's payment history
```

### Plans

```
POST   /api/v1/plans                    → Create plan
GET    /api/v1/plans                    → List plans
GET    /api/v1/plans/:id                → Get plan
PATCH  /api/v1/plans/:id                → Update plan
DELETE /api/v1/plans/:id                → Soft delete plan
```

### Subscriptions

```
POST   /api/v1/subscriptions               → Assign plan to member
GET    /api/v1/subscriptions               → List subscriptions (paginated)
GET    /api/v1/subscriptions/:id           → Get subscription
PATCH  /api/v1/subscriptions/:id           → Update subscription
POST   /api/v1/subscriptions/:id/pause     → Pause subscription
POST   /api/v1/subscriptions/:id/resume    → Resume subscription
POST   /api/v1/subscriptions/:id/cancel    → Cancel subscription
POST   /api/v1/subscriptions/:id/renew     → Renew subscription
```

### Payments

```
POST   /api/v1/payments                    → Register payment
GET    /api/v1/payments                    → List payments (paginated)
GET    /api/v1/payments/:id                → Get payment
PATCH  /api/v1/payments/:id                → Update payment
POST   /api/v1/payments/:id/refund         → Refund payment
GET    /api/v1/payments/:id/receipt        → Get receipt PDF
```

### Check-in

```
POST   /api/v1/check-in                    → Record entry/exit
GET    /api/v1/check-in/verify/:memberId   → Verify if member can enter
GET    /api/v1/check-in/active             → Currently checked-in members
```

### Classes

```
POST   /api/v1/classes                     → Create class
GET    /api/v1/classes                     → List classes
GET    /api/v1/classes/:id                 → Get class with schedules
PATCH  /api/v1/classes/:id                 → Update class
DELETE /api/v1/classes/:id                 → Soft delete class
POST   /api/v1/classes/:id/schedules       → Add schedule
DELETE /api/v1/classes/:id/schedules/:schId → Remove schedule
```

### Bookings

```
POST   /api/v1/bookings                    → Book a class
GET    /api/v1/bookings                    → List bookings (paginated)
PATCH  /api/v1/bookings/:id                → Update booking status
DELETE /api/v1/bookings/:id                → Cancel booking
```

### Reports

```
GET    /api/v1/reports/income              → Income report (by date range)
GET    /api/v1/reports/members             → Members report (new, active, churn)
GET    /api/v1/reports/classes             → Class attendance report
GET    /api/v1/reports/arrears             → Overdue payments report
```

### Inventory

```
POST   /api/v1/inventory                   → Create item
GET    /api/v1/inventory                   → List inventory
GET    /api/v1/inventory/:id               → Get item
PATCH  /api/v1/inventory/:id               → Update item
DELETE /api/v1/inventory/:id               → Soft delete item
POST   /api/v1/inventory/:id/loan          → Loan item to member
POST   /api/v1/inventory/:id/return        → Return loaned item
```

### Notifications

```
GET    /api/v1/notifications               → List notifications
PATCH  /api/v1/notifications/:id/read      → Mark as read
POST   /api/v1/notifications/send          → Send notification
```

### Branches

```
POST   /api/v1/branches                    → Create branch
GET    /api/v1/branches                    → List branches
GET    /api/v1/branches/:id                → Get branch
PATCH  /api/v1/branches/:id                → Update branch
DELETE /api/v1/branches/:id                → Soft delete branch
```

### Users (Admin)

```
POST   /api/v1/users                       → Create user
GET    /api/v1/users                       → List users
GET    /api/v1/users/:id                   → Get user
PATCH  /api/v1/users/:id                   → Update user
DELETE /api/v1/users/:id                   → Soft delete user
```

## Query params comunes

```
?page=1&limit=20                            # Paginación
?search=john                                # Búsqueda general
?status=active                              # Filtro por estado
?from=2026-01-01&to=2026-06-18             # Rango de fechas
?sort=name:asc,created_at:desc             # Ordenamiento
?branch_id=uuid                             # Filtro por sucursal
```

## WebSockets (Socket.IO)

```
Eventos que emite el servidor:
  check-in:updated       → { memberId, type, timestamp }
  member:status          → { memberId, status }
  notification:new       → { notification }
  class:booking-updated  → { classId, availableSpots }

Eventos que recibe el servidor:
  check-in:scan          → { memberCode }
  booking:join-waitlist  → { classId, date }
```
