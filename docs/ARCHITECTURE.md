# Arquitectura del Sistema

## Principios

- **Modular Monolith** — el sistema comienza como un monolito modular bien estructurado. Si en el futuro se requiere escalar, los módulos están diseñados para poder extraerse a microservicios sin reescritura.
- **Clean Architecture** — cada módulo sigue la separación en capas: dominio, aplicación e infraestructura.
- **Event-driven** — los módulos se comunican mediante eventos para minimizar el acoplamiento.
- **DTOs estrictos** — nunca se exponen entidades de base de datos directamente en la API.

## Diagrama de capas

```
┌─────────────────────────────────────────────────────┐
│                   Electron Desktop                   │
│  ┌────────────────────────────────────────────────┐ │
│  │              Angular App (Renderer)             │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐   │ │
│  │  │ Features │ │ Services │ │ State (Signals│   │ │
│  │  │          │ │ (HTTP)   │ │  / NgRx)     │   │ │
│  │  └──────────┘ └──────────┘ └──────────────┘   │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │          Electron Main Process                 │ │
│  │  (IPC, notificaciones, auto-update, menú)      │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / WebSocket
                       ▼
┌─────────────────────────────────────────────────────┐
│                   NestJS Backend                     │
│  ┌────────────────────────────────────────────────┐ │
│  │              API Layer (Controllers)            │ │
│  ├────────────────────────────────────────────────┤ │
│  │          Application Layer (Services)           │ │
│  ├────────────────────────────────────────────────┤ │
│  │              Domain Layer (Entities)             │ │
│  ├────────────────────────────────────────────────┤ │
│  │        Infrastructure Layer (TypeORM, etc.)     │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
               ┌──────────────┐
               │  PostgreSQL  │
               └──────────────┘
```

## Flujo de datos

```
Usuario → Electron (Renderer) → IPC → Electron (Main)
                                              │
                                    HTTP/WS → NestJS → TypeORM → PostgreSQL
                                              │
                                    Stripe/MercadoPago (pagos)
                                              │
                                    Twilio/Nodemailer (notificaciones)
```

## Comunicación Electron ↔ Backend

El proceso Renderer de Electron **no se comunica directamente** con el backend. Todo pasa a través del proceso Main vía IPC. Esto permite:

- Centralizar la lógica de red en el proceso Main
- Manejar tokens de forma segura
- Controlar ventanas y notificaciones nativas
- Facilitar el testing del frontend

```
Angular Service → IPC invoke → Main Process → HTTP → Backend
                                              ← HTTP
Angular Service ← IPC response ← Main Process ←
```

## Módulos del backend

Cada módulo en NestJS sigue esta estructura:

```
members/
├── domain/
│   ├── entities/
│   │   └── member.entity.ts
│   └── interfaces/
│       └── member.repository.interface.ts
├── application/
│   ├── dtos/
│   │   ├── create-member.dto.ts
│   │   ├── update-member.dto.ts
│   │   └── member-response.dto.ts
│   ├── services/
│   │   └── member.service.ts
│   └── mappers/
│       └── member.mapper.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── member.repository.ts
│   │   └── member.entity.ts (TypeORM)
│   ├── controllers/
│   │   └── member.controller.ts
│   └── events/
│       └── member-created.event.ts
├── member.module.ts
└── index.ts
```

## Estrategia de escalabilidad

1. **Monolito modular primero** — despliegue único, simplicidad operativa
2. **Comunicación por eventos** — cuando un módulo necesita escalar, se extrae como microservicio y los eventos existentes se convierten en mensajes de cola (RabbitMQ / Redis)
3. **CQRS para reportes** — las consultas pesadas de reportes usan un esquema separado de lectura (read model) para no afectar las operaciones transaccionales
4. **Caché** — Redis para datos de alta lectura (catálogos, sesiones, check-ins activos)
