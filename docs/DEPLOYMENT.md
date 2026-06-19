# Despliegue

## Entornos

| Entorno | Propósito | Backend | Desktop |
|---------|-----------|---------|---------|
| `development` | Desarrollo local | localhost:3000 | ng serve + electron |
| `staging` | Pruebas previas a producción | VPS / Railway | electron-builder + GitHub Releases |
| `production` | Producción | VPS / Railway | electron-builder + GitHub Releases |

---

## Backend

### Requisitos de servidor

- Node.js 20+ (LTS)
- PostgreSQL 16+
- 2 GB RAM mínimo
- 20 GB SSD

### Despliegue con Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000

CMD ["node", "dist/main"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: gym_management
      DB_USER: gym
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      CORS_ORIGIN: file://
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: gym_management
      POSTGRES_USER: gym
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gym -d gym_management"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
```

### Variables de entorno

```bash
# .env.example
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_management
DB_USER=gym
DB_PASSWORD=changeme

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret

# CORS
CORS_ORIGIN=file://

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
MERCADO_PAGO_ACCESS_TOKEN=...

# Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@gym.com
SMTP_PASS=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Logging
LOG_LEVEL=info
```

### Migraciones en producción

```bash
# Como paso separado en CI/CD
NODE_ENV=production npx typeorm migration:run -d src/config/typeorm.config.ts
```

---

## Desktop (Electron)

### Build

```bash
# Build para todas las plataformas
pnpm run build        # Compila Angular + TypeScript
pnpm run package:mac  # .dmg / .zip
pnpm run package:win  # .exe (NSIS)
pnpm run package:linux # .AppImage / .deb
```

### Auto-update

Configurado con `electron-updater` y GitHub Releases.

```yaml
# electron-builder.yml (extracto)
publish:
  provider: github
  owner: tu-organizacion
  repo: gym-management
  private: false
```

Flujo:
1. Se sube un release a GitHub con los instaladores
2. El cliente recibe `update-available` al abrir la app
3. Descarga en background
4. Notifica al usuario que hay una actualización disponible
5. Usuario reinicia la app → se actualiza

```typescript
// En el componente Angular
@Component({ ... })
export class AppComponent {
  constructor(
    private readonly electron: ElectronService,
    private readonly notification: NotificationService,
  ) {
    electron.onUpdateAvailable((info) => {
      notification.showInfo(
        `Nueva versión disponible: ${info.version}`,
        'Descargando...'
      );
    });

    electron.onUpdateDownloaded(() => {
      notification.showInfo(
        'Actualización descargada',
        'Reinicia la aplicación para aplicar los cambios',
        [
          { text: 'Reiniciar ahora', action: () => electron.installUpdate() },
          { text: 'Más tarde', action: () => {} },
        ]
      );
    });
  }
}
```

---

## CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-lint-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: gym_test
          POSTGRES_USER: gym
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run test:cov
      - run: npm run test:e2e
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: gym_test
          DB_USER: gym
          DB_PASSWORD: test

  desktop-build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run ng test -- --watch=false --browsers=ChromeHeadless
      - run: npm run build
      - run: npm run package
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  release:
    if: github.ref == 'refs/heads/main'
    needs: [backend-lint-test, desktop-build]
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npm run package:all
        env:
          GH_TOKEN: ${{ secrets.GH_PAT }}

      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            release/*.dmg
            release/*.zip
            release/*.exe
            release/*.AppImage
            release/*.deb
          generate_release_notes: true
```

---

## Monitoreo

### Backend

- **Health check**: `GET /api/v1/health` → `{ status: 'ok', uptime, db: 'connected' }`
- **Logs**: Pino + transporte a archivo (rotación diaria)
- **Métricas**: Prometheus + Grafana (opcional, para producción)
- **Alertas**: UptimeRobot / Better Stack (monitoreo externo)

### Desktop

- **Error tracking**: Sentry (captura de errores no controlados)
- **Analytics**: PostHog o similar (eventos anónimos de uso)
- **Logs locales**: archivo en `app.getPath('userData')/logs/`

```typescript
// main.ts (Electron)
import * as Sentry from '@sentry/electron';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

process.on('uncaughtException', (error) => {
  Sentry.captureException(error);
});
```
