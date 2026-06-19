# Gym Management System

Sistema de gestión integral para gimnasios. Control de membresías, pagos, check-in, clases, inventario y más.

## Stack

| Capa | Tecnología |
|------|-----------|
| **Desktop** | Electron 30+ / Angular 18 |
| **UI** | Angular Material + Tailwind CSS |
| **Backend** | NestJS (TypeScript) |
| **Base de datos** | PostgreSQL |
| **ORM** | TypeORM |
| **Auth** | JWT (access + refresh tokens) |
| **Tiempo real** | Socket.IO (check-in, notificaciones) |
| **Pagos** | Stripe / Mercado Pago |
| **Empaquetado** | electron-builder |

## Estructura del proyecto

```
gym-system/
├── backend/                    # NestJS API
├── desktop/                    # Electron + Angular
└── docs/                       # Documentación
```

## Requisitos

- Node.js 20+
- PostgreSQL 16+
- pnpm

## Inicio rápido

```bash
# Backend
cd backend
pnpm install
pnpm start:dev

# Desktop
cd desktop
pnpm install
pnpm start
```

## Documentación

La documentación completa está en la carpeta [`docs/`](docs/).

- [Arquitectura](docs/ARCHITECTURE.md)
- [Backend](docs/BACKEND.md)
- [Frontend](docs/FRONTEND.md)
- [Base de datos](docs/DATABASE.md)
- [API](docs/API.md)
- [Patrones de diseño](docs/DESIGN_PATTERNS.md)
- [Estándares de código](docs/CODING_STANDARDS.md)
- [Seguridad](docs/SECURITY.md)
- [Pruebas](docs/TESTING.md)
- [Electron](docs/ELECTRON.md)
- [Módulos](docs/MODULES.md)
- [Estado global](docs/STATE_MANAGEMENT.md)
- [Manejo de errores](docs/ERROR_HANDLING.md)
- [Despliegue](docs/DEPLOYMENT.md)
