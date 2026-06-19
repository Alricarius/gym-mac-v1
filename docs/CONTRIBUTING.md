# Contributing

## Setup local

### Prerrequisitos

- Node.js 20+
- PostgreSQL 16+
- pnpm (`npm install -g pnpm`)

### Clonar e instalar

```bash
git clone <repo-url>
cd gym-system

# Backend
cd backend
pnpm install
cp .env.example .env   # Editar con tus credenciales

# Desktop
cd ../desktop
pnpm install
```

### Base de datos

```bash
# Crear base de datos
createdb gym_development

# Ejecutar migraciones
cd backend
pnpm typeorm migration:run

# (opcional) Sembrar datos de prueba
pnpm seed
```

### Variables de entorno

```bash
# backend/.env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_development
DB_USER=postgres
DB_PASSWORD=postgres

JWT_ACCESS_SECRET=dev-access-secret
JWT_REFRESH_SECRET=dev-refresh-secret

CORS_ORIGIN=file://

# Opcional — solo si trabajás en el módulo
STRIPE_SECRET_KEY=sk_test_...
SMTP_HOST=...
```

### Ejecutar

```bash
# Terminal 1 — Backend
cd backend
pnpm start:dev

# Terminal 2 — Desktop
cd desktop
pnpm start
```

El backend corre en `http://localhost:3000` y el desktop en Electron apuntando a `http://localhost:4200` con el backend en `localhost:3000`.

---

## Convenciones

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add member check-in endpoint
fix: prevent duplicate email registration
refactor: extract payment processor factory
test: add subscription renewal unit tests
docs: update API documentation
chore: bump dependencies
```

### Ramas

```
main           → Producción (protegida)
develop        → Integración
feat/{nombre}  → Nuevas funcionalidades
fix/{nombre}   → Correcciones
refactor/{nombre} → Refactors
docs/{nombre}  → Documentación
```

```bash
git checkout -b feat/member-check-in
# trabajar...
git commit -m "feat: add member check-in endpoint"
git push origin feat/member-check-in
# crear PR a develop
```

### Flujo de PR

1. Crear rama desde `develop`
2. Implementar cambios
3. Todos los tests pasan (`pnpm test`)
4. Linter sin errores (`pnpm lint`)
5. Crear PR a `develop`
6. Code review (si hay otro contribuidor)
7. Merge a `develop`
8. Periódicamente se mergea `develop` → `main` para release

---

## Estructura de archivos

### Backend

Cada módulo vive en `src/modules/{nombre}/`:

```
src/modules/members/
├── domain/
│   ├── entities/member.entity.ts       # Entidad de dominio
│   └── interfaces/
│       └── member.repository.interface.ts
├── application/
│   ├── dtos/
│   │   ├── create-member.dto.ts
│   │   ├── update-member.dto.ts
│   │   └── member-response.dto.ts
│   ├── services/member.service.ts
│   └── mappers/member.mapper.ts
├── infrastructure/
│   ├── persistence/
│   │   └── member.repository.ts
│   └── controllers/member.controller.ts
├── member.module.ts
├── index.ts
└── member.service.spec.ts              # Test junto al archivo que prueba
```

### Frontend

```
src/app/features/members/
├── components/
│   ├── member-list/
│   ├── member-form/
│   └── member-detail/
├── services/
│   ├── member.service.ts               # HTTP calls
│   └── member.store.ts                 # Signals state
├── member.routes.ts
└── member.providers.ts
```

---

## Pruebas

```bash
# Backend
cd backend
pnpm test                    # Unit tests
pnpm test:watch              # Watch mode
pnpm test:cov                # Coverage
pnpm test:e2e                # E2E tests

# Frontend
cd desktop
pnpm ng test                 # Unit tests
pnpm ng test --watch         # Watch mode

# Todos los tests (desde raíz)
pnpm test
```

### Escribir tests

```typescript
// ✅ Nombre descriptivo
describe('MemberService.create', () => {
  it('should throw ConflictException when email already exists', async () => { ... });
  it('should create member and return MemberResponseDto', async () => { ... });
  it('should send welcome email after creation', async () => { ... });
});

// ❌ Evitar
describe('create', () => {
  it('should work', () => { ... });
  it('should fail', () => { ... });
});
```

Usar factories para datos de prueba:

```typescript
import { memberFactory } from '../../../test/factories/member.factory';

const member = memberFactory({ email: 'test@example.com' });
```

---

## Migraciones

```bash
# Generar migración a partir de cambios en entidades
cd backend
pnpm typeorm migration:generate src/migrations/AddMemberPhoneIndex

# Revisar SQL generado antes de ejecutar
cat src/migrations/123456789-AddMemberPhoneIndex.ts

# Ejecutar
pnpm typeorm migration:run

# Revertir última
pnpm typeorm migration:revert
```

Nunca editar migraciones ya ejecutadas en `develop`. Si necesitás cambiar algo, crear una nueva migración.

---

## Linter y formato

```bash
# Verificar
pnpm lint

# Auto-fix
pnpm lint:fix

# Formatear código
pnpm format
```

El proyecto usa ESLint + Prettier. Configura tu editor para formatear al guardar.

---

## Debugging

### Backend

```bash
# Con inspector de Node.js
pnpm start:debug
# Luego conectar Chrome DevTools en chrome://inspect
```

### Frontend (Electron)

```bash
# Abrir DevTools automáticamente
ELECTRON_DEVTOOLS=true pnpm start
```

O manual: `View → Toggle Developer Tools` en el menú de la app.

---

## Release

```bash
# 1. Asegurar que develop esté estable
git checkout develop
pnpm test

# 2. Merge a main
git checkout main
git merge develop

# 3. Tag semver
git tag v1.0.0
git push origin main --tags

# 4. CI/CD construye y publica release en GitHub
```
