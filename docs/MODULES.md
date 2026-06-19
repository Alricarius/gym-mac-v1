# Módulos del Sistema

## 1. Auth

**Responsabilidad**: Autenticación, autorización, gestión de sesiones.

| Entidad | Descripción |
|---------|-------------|
| `users` | Usuarios del sistema (admin, recepción, instructores) |
| `refresh_tokens` | Tokens de refresco (revocables) |

**Eventos que emite**: `user.logged-in`, `user.logged-out`
**Eventos que recibe**: `member.created` (crear usuario si es instructor)

**Endpoints**: Login, refresh, logout, me.

---

## 2. Members

**Responsabilidad**: Gestión del perfil de miembros, historial, documentos.

| Entidad | Descripción |
|---------|-------------|
| `members` | Datos personales del miembro |
| `member_documents` | Documentos subidos (INE, certificado médico) |
| `member_notes` | Notas internas sobre el miembro |

**Eventos que emite**: `member.created`, `member.updated`, `member.deleted`
**Reglas de negocio**:
- Email único por sucursal
- No se puede eliminar si tiene suscripciones activas
- Documentos opcionales pero recomendados

---

## 3. Plans

**Responsabilidad**: Definir los planes de membresía disponibles.

| Entidad | Descripción |
|---------|-------------|
| `subscription_plans` | Planes de membresía configurables |

**Reglas de negocio**:
- Un plan puede ser global (toda sucursal) o por sucursal
- Precio y duración son obligatorios
- `max_visits_per_week` nullable = sin límite
- Soft delete; los planes eliminados no se ofrecen pero sus suscripciones activas continúan

---

## 4. Subscriptions

**Responsabilidad**: Asignar planes a miembros, control de vigencia.

| Entidad | Descripción |
|---------|-------------|
| `subscriptions` | Suscripción activa/histórica de un miembro |

**Eventos que emite**: `subscription.created`, `subscription.expired`, `subscription.paused`, `subscription.resumed`, `subscription.cancelled`
**Reglas de negocio**:
- Un miembro puede tener múltiples suscripciones, pero solo una activa a la vez
- Pausa: máximo 30 días acumulables por suscripción
- Cancelación con reembolso prorrateado (primeros 7 días = 100%, luego proporcional)
- Auto-renovación opcional
- Período de gracia configurable por plan antes de marcar como vencida

**Tarea programada**: Verificar suscripciones por vencer (3 días antes) y vencidas (daily).

---

## 5. Payments

**Responsabilidad**: Registrar pagos, generar recibos, control de morosidad.

| Entidad | Descripción |
|---------|-------------|
| `payments` | Pagos registrados |

**Eventos que emite**: `payment.created`, `payment.confirmed`, `payment.refunded`
**Reglas de negocio**:
- Métodos: cash, card (Stripe), transfer, QR (Mercado Pago)
- Un pago puede estar asociado a una suscripción o ser independiente (clase suelta)
- Recibo PDF generado automáticamente al confirmar
- Mora: recargo configurable después del período de gracia
- Se puede pagar parcialmente (abonos)

---

## 6. Check-in

**Responsabilidad**: Control de entrada/salida de miembros.

| Entidad | Descripción |
|---------|-------------|
| `check_ins` | Registro de entradas y salidas |

**WebSocket**: Emite `check-in:updated` en tiempo real para el panel de control.
**Reglas de negocio**:
- Solo puede hacer check-in si tiene suscripción activa
- Si el plan tiene límite semanal, verificar que no lo haya excedido
- Si el gimnasio tiene aforo máximo, verificar antes de permitir entrada
- Check-out opcional (solo para control de aforo)

---

## 7. Classes & Booking

**Responsabilidad**: Programación de clases, reservas y control de asistencia.

| Entidades | Descripción |
|-----------|-------------|
| `classes` | Definición de clase (nombre, instructor, capacidad) |
| `class_schedules` | Horarios recurrentes de la clase |
| `bookings` | Reserva de un miembro a una clase |

**Eventos que emite**: `booking.created`, `booking.cancelled`, `booking.attended`
**Reglas de negocio**:
- Un miembro puede reservar con hasta 7 días de anticipación
- Cancelación sin penalización hasta 2 horas antes
- No-show registrado si no asiste y no cancela
- Límite de reservas activas por miembro (configurable)
- Lista de espera cuando se alcanza el cupo máximo

---

## 8. Instructors

**Responsabilidad**: Gestión de instructores, horarios y comisiones.

| Entidad | Descripción |
|---------|-------------|
| Extiende `users` con role `instructor` | |

**Reglas de negocio**:
- Un instructor puede impartir múltiples clases
- No puede estar en dos clases al mismo tiempo (validar horarios)
- Comisión por clase o por hora (configurable por instructor)

---

## 9. Inventory

**Responsabilidad**: Control de equipos y préstamos.

| Entidades | Descripción |
|-----------|-------------|
| `inventory_items` | Equipos del gimnasio |
| `inventory_loans` | Préstamos a miembros |

**Reglas de negocio**:
- Préstamo por tiempo limitado (ej. 2 horas, definido por sucursal)
- Si no se devuelve a tiempo, se marca como overdue
- No prestar si el miembro tiene préstamos overdue previos
- Mantenimiento programado (notificación cuando se acerca la fecha)

---

## 10. Notifications

**Responsabilidad**: Envío de notificaciones por múltiples canales.

| Entidad | Descripción |
|---------|-------------|
| `notifications` | Historial de notificaciones enviadas |

**Canales**: Email (Nodemailer), SMS (Twilio), Push (Electron nativo)
**Tipos**:
- `expiration` — membresía próxima a vencer
- `payment` — pago recibido o pendiente
- `class_reminder` — recordatorio de clase reservada (30 min antes)
- `promotion` — ofertas y promociones

**Estrategia**: Cola de notificaciones (Bull/Redis) para no bloquear la respuesta HTTP.

---

## 11. Reports

**Responsabilidad**: Generación de reportes y analytics.

**No tiene entidad propia**. Consultas agregadas sobre las tablas existentes.

**Reportes**:
| Reporte | Descripción | Frecuencia |
|---------|-------------|------------|
| Income | Ingresos por día/semana/mes/año | Tiempo real |
| Members | Miembros nuevos, activos, cancelados | Diario |
| Retention | Tasa de retención por cohorte (mensual) | Mensual |
| Classes | Asistencia a clases, popularidad | Semanal |
| Arrears | Morosidad, pagos pendientes | Diario |
| Inventory | Estado de equipos, préstamos activos | Semanal |

**Exportación**: PDF (ReportLab / Puppeteer), Excel (ExcelJS), CSV.

---

## 12. Branches

**Responsabilidad**: Gestión de múltiples sucursales.

| Entidad | Descripción |
|---------|-------------|
| `branches` | Sucursales del gimnasio |

**Reglas de negocio**:
- Los miembros pertenecen a una sucursal principal pero pueden tener acceso a múltiples (según plan)
- Los planes pueden ser por sucursal o globales
- Los usuarios tienen una sucursal asignada (excepto superadmin)
- Reportes pueden ser por sucursal o consolidados

---

## 13. Config

**Responsabilidad**: Configuración general del sistema.

| Entidad | Descripción |
|---------|-------------|
| `gym_settings` | Configuración por sucursal (horarios, impuestos, etc.) |

**Campos típicos**:
- `gym_name`, `gym_logo`, `gym_address`, `gym_phone`
- `opening_time`, `closing_time`
- `max_capacity` (aforo)
- `tax_percentage` (IVA)
- `late_cancel_minutes` (minutos antes de clase para cancelar sin penalización)
- `max_pause_days` (máximo días de pausa por suscripción)
- `grace_period_days`
