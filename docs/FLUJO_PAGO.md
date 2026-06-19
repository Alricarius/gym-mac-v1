# Flujo de Pago

## Visión General

El sistema soporta dos formas de registrar pagos:

1. **Pago integrado** (recomendado) — al crear una suscripción, se registra el pago automáticamente
2. **Pago independiente** — para pagos recurrentes o fuera del ciclo de creación

---

## 1. Pago Integrado (Al crear suscripción)

### Flujo
1. El usuario selecciona miembro + plan en el formulario de suscripción
2. El monto se prefija automáticamente con el precio del plan (editable)
3. El usuario elige método de pago (efectivo/tarjeta/transferencia) — **obligatorio**
4. Un solo click → se crean suscripción + pago atómicamente
5. `paidAt` se establece con la fecha/hora actual del servidor

### Backend
- `SubscriptionsService.create()` recibe los campos `paymentMethod`, `paymentAmount`, `paymentReference`, `paymentNotes`
- Crea la suscripción, luego crea el `Payment` con `paidAt: new Date()` y actualiza `lastPaymentAt`
- Si `paymentAmount` no se envía, se usa `plan.price`

### Frontend
- `subscription-form.component.ts` — sección "Datos de pago" con método (required), monto (prefijado), referencia y notas (opcionales)

---

## 2. Pago Independiente (Desde la pantalla Pagos)

### Cuándo usarlo
- Pagos recurrentes de suscripciones existentes
- Pagos atrasados
- Casos donde se necesita registrar un pago sin crear nueva suscripción

### Flujo
1. El usuario va a Pagos → Nuevo pago
2. Selecciona la suscripción
3. Completa método, monto, referencia, notas
4. `paidAt` se prefija con la fecha/hora actual (editable)
5. Click → se registra el pago

### Backend
- `PaymentsService.create()` recibe `CreatePaymentDto` con `paidAt` opcional
- Si no se envía `paidAt`, usa `new Date()` (hora actual del servidor)
- Si se envía, usa el valor proporcionado

### Frontend
- `payment-form.component.ts` — campo `paidAt` prefijado con la fecha/hora actual al cargar

---

## Convención: `paidAt` vs `createdAt`

| Campo | Propósito | Se puede editar? |
|---|---|---|
| `paidAt` | Fecha/hora en que se realizó el pago real | Sí (para corregir fechas) |
| `createdAt` | Fecha/hora en que se registró en el sistema | No (autogenerado) |

- El dashboard de ingresos (`/reports/dashboard`) usa **`paidAt`** para calcular los ingresos
- El reporte de ingresos (`/reports/income`) también usa **`paidAt`**
- Esto permite registrar pagos atrasados sin distorsionar las métricas del día actual

---

## Validaciones

- `paymentMethod` es **obligatorio** al crear suscripción
- `amount` debe ser mayor a 0
- Si no se especifica `amount`, se usa el precio del plan
- Las suscripciones sin pago fallan con error de validación
