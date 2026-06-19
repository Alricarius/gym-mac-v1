# Architecture Decision Records (ADR)

Este documento registra las decisiones arquitectónicas clave del proyecto. Cada ADR incluye el contexto, la decisión y las alternativas consideradas.

---

## ADR-001: Modular Monolith en lugar de Microservicios

**Fecha**: 2026-06-18  
**Estado**: Aceptado

### Contexto

El sistema de gestión de gimnasios tiene múltiples módulos (miembros, suscripciones, pagos, check-in, clases, etc.) que comparten datos y operaciones transaccionales.

### Decisión

Comenzar con un **Modular Monolith** — un solo despliegue de NestJS con módulos bien separados que se comunican a través de eventos internos.

### Alternativas consideradas

1. **Microservicios desde el inicio** — Cada módulo como servicio independiente. Rechazado porque:
   - Complejidad operativa innecesaria para un MVP
   - Dificulta transacciones entre módulos (ej: crear suscripción + pago inicial)
   - Latencia de red en operaciones frecuentes (check-in)
   - Un solo desarrollador manteniendo el sistema al inicio

2. **Monolito clásico** — Sin separación de módulos. Rechazado porque:
   - Dificulta la evolución a microservicios si se necesita
   - Acoplamiento entre funcionalidades
   - Equipo puede crecer y necesitar boundaries claros

### Consecuencias

- Positivas: despliegue simple, transacciones ACID entre módulos, sin latencia de red, facilidad de desarrollo inicial
- Negativas: si el sistema escala a múltiples equipos y mucha carga, habrá que extraer módulos a microservicios. Los eventos existentes facilitarán esta transición.

---

## ADR-002: TypeORM como ORM

**Fecha**: 2026-06-18  
**Estado**: Aceptado

### Contexto

Necesitamos un ORM para interactuar con PostgreSQL. El ecosistema NestJS tiene buena integración tanto con TypeORM como con Prisma.

### Decisión

Usar **TypeORM** con Data Mapper pattern (repositorios).

### Alternativas consideradas

1. **Prisma** — Más moderno, mejor DX, schema-first. Rechazado porque:
   - Mayor curva de migración si se necesita personalización SQL
   - Las transacciones y queries complejas son más verbosas que TypeORM
   - TypeORM tiene `QueryBuilder` que es más flexible para reportes complejos
   - TypeORM está más integrado con NestJS (@nestjs/typeorm)

2. **Knex.js** — Query builder puro. Rechazado porque:
   - Demasiado boilerplate para CRUD estándar
   - Sin decoradores para entidades

### Consecuencias

- Usar `QueryBuilder` para queries complejas (reportes, agregaciones)
- Usar `Repository` pattern para operaciones CRUD estándar
- Migraciones generadas automáticamente desde entidades

---

## ADR-003: Signals como estado principal, NgRx solo para estado global crítico

**Fecha**: 2026-06-18  
**Estado**: Aceptado

### Contexto

Angular 18 introdujo Signals como primitiva reactiva. Necesitamos decidir cómo manejar el estado de la aplicación.

### Decisión

- **Signals** para estado local de componentes y servicios de feature (80% de los casos)
- **NgRx** solo para estado global compartido: autenticación, notificaciones globales, conexión WebSocket

### Alternativas consideradas

1. **NgRx para todo** — Complejidad excesiva para features simples. Mucho boilerplate (actions, reducers, effects, selectors) para algo como un CRUD de miembros.

2. **Signals para todo** — Perfecto hasta que se necesita estado global muy compartido. Las Signals no tienen DevTools ni middleware para side effects complejos.

### Consecuencias

- Los stores de feature usan Signals con servicios `@Injectable({ providedIn: 'root' })` pero expuestos como `computed` de solo lectura
- NgRx se usa solo en `core/store/` (auth, app state)
- Menos boilerplate en general
- Más fácil de testear (el store con Signals es un servicio simple)

---

## ADR-004: PostgreSQL como única base de datos

**Fecha**: 2026-06-18  
**Estado**: Aceptado

### Contexto

Necesitamos almacenar datos relacionales (miembros, suscripciones, pagos) que requieren consistencia transaccional.

### Decisión

**PostgreSQL 16** como única base de datos. Sin bases de datos secundarias (no Redis, no MongoDB).

### Alternativas consideradas

1. **PostgreSQL + Redis** — Redis para caché de sesiones y check-ins activos. Rechazado porque:
   - Complejidad operativa adicional (otro servicio que monitorear)
   - Para el volumen esperado de un gimnasio (cientos, no millones), PostgreSQL es suficiente
   - Se puede agregar Redis después si es necesario sin cambiar la arquitectura

2. **MongoDB** — Documental, schema-less. Rechazado porque:
   - Las relaciones (miembro → suscripción → pago → check-in) son inherentemente relacionales
   - Las transacciones en MongoDB son limitadas
   - Reportes requieren agregaciones que PostgreSQL hace mejor

### Consecuencias

- Si en el futuro se necesita caché para alta concurrencia, se agrega Redis solo para ese propósito
- Las sesiones JWT son stateless (no requieren almacenamiento en el backend)
- Check-ins activos se consultan directamente a PostgreSQL (con índice en `check_ins`)

---

## ADR-005: UUID v7 en lugar de auto-increment o UUID v4

**Fecha**: 2026-06-18  
**Estado**: Aceptado

### Contexto

Necesitamos identificadores únicos para todas las entidades. Consideraciones: seguridad (no secuenciales), rendimiento de índices, compatibilidad con sistemas distribuidos (multisucursal).

### Decisión

Usar **UUID v7** (ordenable cronológicamente) como identificador primario.

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

### Alternativas consideradas

1. **Auto-increment (SERIAL)** — Problemas de seguridad (exponer IDs secuenciales), difícil de mergear entre sucursales. Rechazado.

2. **UUID v4** — Aleatorio, bueno para seguridad. Problema: fragmentación de índices BTREE porque no son ordenables. Rechazado por rendimiento.

3. **ULID** — Ordenable, legible. Rechazado porque no tiene soporte nativo en PostgreSQL.

4. **Snowflake / NanoID** — Requieren lógica de generación en la aplicación. Rechazado por simplicidad.

### Consecuencias

- Los índices BTREE se mantienen eficientes (UUID v7 es monótonamente creciente)
- Cada sucursal puede generar IDs sin riesgo de colisión
- Se puede ordenar por `id` para obtener orden cronológico
- TypeORM soporta UUID nativamente

---

## ADR-006: Comunicación módulos vía eventos (EventEmitter2)

**Fecha**: 2026-06-18  
**Estado**: Aceptado

### Contexto

Los módulos del sistema necesitan reaccionar a acciones de otros módulos sin acoplamiento directo. Ejemplo: cuando se crea un pago, la suscripción debe actualizarse y debe enviarse una notificación.

### Decisión

Usar **EventEmitter2** (de NestJS) como bus de eventos interno del módulo. Los módulos emiten eventos (`member.created`, `payment.confirmed`) y otros módulos los escuchan con `@OnEvent()`.

### Alternativas consideradas

1. **Llamadas directas entre servicios** — `paymentService.create()` llama a `subscriptionService.update()` y `notificationService.send()`. Rechazado porque:
   - Acoplamiento fuerte entre módulos
   - Difícil agregar nuevos listeners sin modificar el emisor
   - Dificulta extraer módulos a microservicios

2. **Cola de mensajes externa (RabbitMQ)** — Excelente para escalar pero sobreingeniería para un monolith. Rechazado por ahora; se puede agregar después cuando se extraigan microservicios.

3. **RxJS Subjects** — Funcional pero sin las facilidades de NestJS (inyección, naming consistente).

### Consecuencias

- Los eventos usan naming consistente: `{entidad}.{acción}` (ej: `member.created`, `subscription.expired`)
- Cada evento tiene su propia clase con tipado estricto
- Los handlers de eventos son servicios con `@OnEvent()` y pueden inyectar dependencias
- Migrar a RabbitMQ en el futuro solo requiere cambiar el event bus, no los emisores ni receptores

---

## ADR-007: CQRS para reportes

**Fecha**: 2026-06-18  
**Estado**: Aceptado

### Contexto

Los reportes y el dashboard requieren consultas agregadas complejas (SUM, GROUP BY, JOIN de múltiples tablas) que son diferentes a las operaciones CRUD normales.

### Decisión

Separar las consultas de reportes en servicios dedicados que usan SQL directo (`DataSource.query()`) en lugar de pasar por los repositorios estándar.

### Alternativas consideradas

1. **Usar los mismos repositorios con QueryBuilder** — Funciona pero mezcla responsabilidades. Los reportes tienen requisitos de performance diferentes.

2. **Vistas materializadas en PostgreSQL** — Ideal para reportes pesados pero agrega complejidad de refresco. Se puede agregar después si es necesario.

### Consecuencias

- Los reportes usan SQL directo optimizado para agregaciones
- No pasan por el mapper de dominio (la respuesta no son entidades)
- Las consultas de reportes están aisladas en `src/modules/reports/`
- Si el rendimiento es insuficiente, se pueden crear vistas materializadas sin cambiar la API

---

## ADR-008: Refresh token rotation con detección de robo

**Fecha**: 2026-06-18  
**Estado**: Aceptado

### Contexto

Los refresh tokens permiten mantener sesiones largas sin pedir credenciales. Si un token es robado, queremos minimizar el daño.

### Decisión

Implementar **refresh token rotation**: cada vez que se usa un refresh token, se invalida el anterior y se genera uno nuevo. Si un token ya invalidado es reutilizado, se revocan **todos** los tokens del usuario (posible robo).

### Alternativas consideradas

1. **Refresh token fijo** — Simple pero inseguro: si roban el token, tienen acceso indefinido.

2. **Refresh token con expiration larga + blacklist** — Similar pero requiere mantener una blacklist en BD.

3. **Solo access tokens cortos** — Mala UX: el usuario tiene que loguearse cada 15 minutos.

### Consecuencias

- Los refresh tokens se almacenan hasheados en `refresh_tokens` table
- Detección de robo: si se reusa un token ya rotado, se revoca la sesión completa
- El cliente debe almacenar el refresh token de forma segura (electron-store encriptado)
