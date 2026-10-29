# Iteración 11 — UI/UX: Brand Identity & Design System

## Objetivo

Unificar la identidad visual de GymAdmin aplicando la paleta definida en `BRAND_MANUAL.md`, reemplazar todos los colores hardcodeados, arreglar problemas de contraste, y crear un tema Material personalizado que reemplace `indigo-pink.css`.

---

## Archivos de Referencia

- `BRAND_MANUAL.md` — paleta de colores, tokens, tipografía, guías de componentes
- `desktop/src/styles.scss` — estilos globales actuales (importación indigo-pink, clases utilitarias)
- `desktop/src/index.html` — fuente Roboto (cambiar a Inter)
- `desktop/src/app/app.config.ts` — providers actuales
- `desktop/src/app/features/auth/pages/login/login.component.ts` — login con degradado y colores hardcodeados
- `desktop/src/app/layouts/main/main-layout.component.ts` — sidebar con bg-gray-900
- `desktop/src/app/features/dashboard/pages/dashboard/dashboard.component.ts` — chart color `#667eea`
- `desktop/angular.json` — configuración de estilos

---

## Orden de Ejecución

---

### Fase 0 — Preparación y Backend

| Paso | Acción | Comando / Detalle |
|------|--------|-------------------|
| 0.1 | Matar proceso en puerto 3000 | `lsof -ti:3000 \| xargs kill -9 2>/dev/null; echo "done"` |
| 0.2 | Levantar backend | `cd backend && docker compose up -d` (si aplica) |
| 0.3 | Migraciones y seed | `cd backend && pnpm build && pnpm migration:run && pnpm seed` |
| 0.4 | Iniciar backend | `cd backend && node dist/main.js &` |
| 0.5 | Verificar login | `curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@admin.com","password":"Admin123"}' \| head -c 200` |

---

### Fase 1 — Design Tokens (CSS Custom Properties)

Archivo: `desktop/src/styles.scss` (reemplazar contenido)

**Cambios**:
1. Agregar bloque `:root { ... }` con todos los tokens del BRAND_MANUAL.md sección 6
2. Mantener `@tailwind base/components/utilities`
3. Reemplazar `@import '@angular/material/prebuilt-themes/indigo-pink.css'` por `@import './styles/theme.scss'` (se crea en Fase 2)
4. Actualizar body `background: #f5f6fa` → `background: var(--color-bg)`
5. Actualizar clases globales para usar los nuevos tokens:
   - `.page-header h1` → `color: var(--color-text-primary)`
   - `.table-container` → `box-shadow: var(--shadow-sm)`
   - `.search-bar input` → `border-color: var(--color-border)` y `focus:ring-var(--color-primary)`
   - `.empty`, `.loading` → `color: var(--color-text-muted)`
   - `.alert-error` → usar tokens semánticos
   - `.alert-success` → usar tokens semánticos
   - `.alert-warning` → usar tokens semánticos
   - `.badge-active, .badge-activo` → usar tokens semánticos
   - `.badge-inactive, .badge-inactivo` → `bg-slate-100 text-slate-600`
   - `.badge-paused, .badge-pausada` → usar tokens warning
   - `.badge-cancelled, .badge-cancelada` → usar tokens error
   - `.badge-expired, .badge-vencida` → `bg-slate-100 text-slate-400`
   - `.badge-warning` → usar tokens warning

**Verificación**: `pnpm build` sin errores

---

### Fase 2 — Material Theme Personalizado

**Crear archivo**: `desktop/src/styles/theme.scss`

Copiar el contenido de BRAND_MANUAL.md sección 7 (paletas indigo, sky/accent, warn + `define-light-theme`).

**Actualizar**: `desktop/angular.json`
- En `styles: ["src/styles.scss"]` se queda igual (styles.scss ahora importa theme.scss)

**Actualizar**: `desktop/src/index.html`
- Reemplazar fuente Roboto por Inter:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  ```
- Quitar la línea de Roboto
- Cambiar `<body class="mat-typography">` → `<body class="mat-typography" style="font-family: var(--font-family)">`

**Verificación**: `pnpm build` sin errores

---

### Fase 3 — Sidebar (main-layout.component.ts)

Archivo: `desktop/src/app/layouts/main/main-layout.component.ts`

| Elemento | Cambio |
|----------|--------|
| Sidebar `<aside>` | `bg-gray-900` → `bg-slate-800` |
| Toolbar `<mat-toolbar>` | `bg-gray-900` → estilo inline coincide con sidebar |
| Branch select text | `class="!text-white !text-sm"` → mantener |
| Nav links default | `text-white/70` → `text-slate-400` |
| Nav links hover | `hover:text-white` → `hover:text-white` (mantener) |
| `.active` style | `background: rgba(255,255,255,0.1)` → `background: rgba(255,255,255,0.08)` |
| Main content area | `bg-gray-50` → `bg-slate-50` (o usar var) |
| Logout button | `!bg-white/10` → `!bg-white/10` (mantener, o `!bg-slate-700`) |
| Select arrow color | `rgba(255,255,255,0.7)` → `var(--color-sidebar-text-muted)` |
| Select value text | `color: white` → mantener |

**Verificación**: Abrir app, sidebar debe verse en slate-800 con texto legible

---

### Fase 4 — Login Page (login.component.ts)

Archivo: `desktop/src/app/features/auth/pages/login/login.component.ts`

| Token actual | Reemplazar por |
|-------------|----------------|
| `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | `background: var(--color-primary)` con patrón decorativo vía pseudo-elemento |
| `color: #667eea` (icono) | `color: var(--color-primary)` |
| `color: #1a1a2e` (h1) | `color: var(--color-text-primary)` |
| `color: #666` (subtitle) | `color: var(--color-text-secondary)` |
| `color: #e74c3c` (error) | `color: var(--color-error)` |
| `box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3)` | `box-shadow: 0 20px 60px rgba(79, 70, 229, 0.2)` |
| `background: white` (card) | `background: var(--color-surface)` |
| `border-radius: 12px` | `border-radius: var(--radius-xl)` |
| `padding: 40px` | `padding: 2.5rem` |

**Opcional**: Agregar patrón decorativo al fondo:
```css
.login-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(255,255,255,0.04) 0%, transparent 50%);
}
```

**Verificación**: Login debe verse limpio, fondo indigo sólido sin degradado, card blanca con sombra suave

---

### Fase 5 — Dashboard (dashboard.component.ts)

Archivo: `desktop/src/app/features/dashboard/pages/dashboard/dashboard.component.ts`

| Token actual | Reemplazar por |
|-------------|----------------|
| Chart `backgroundColor: '#667eea'` | `backgroundColor: 'var(--color-primary)'` |
| Card text `text-gray-600` | `text-slate-600` |
| Card text `text-gray-800` | `text-slate-800` |
| Income value `text-green-600` | `text-emerald-600` |
| Icon colors: `text-green-600`, `text-blue-600`, `text-purple-600`, `text-orange-600` | Mantener (son acentos de cada card) |
| Icon backgrounds: `bg-green-100`, `bg-blue-100`, `bg-purple-100`, `bg-orange-100` | Mantener |

**Verificación**: Dashboard carga, chart usa color indigo-600

---

### Fase 6 — Migrar Colores Hardcodeados en Componentes con Inline Styles

Proceso general para cada componente:
1. Reemplazar `#667eea` → `var(--color-primary)` en CSS, y en inline styles del template usar `[style.color]="'var(--color-primary)'"` o mejor, usar clases Tailwind como `text-indigo-600`
2. Reemplazar `#5a6fd6` → `var(--color-primary-hover)`
3. Reemplazar `#1a1a2e` → `var(--color-text-primary)`
4. Reemplazar `#333` → `var(--color-text-heading)`
5. Reemplazar `#666` → `var(--color-text-secondary)`
6. Reemplazar `#999` → `var(--color-text-muted)`
7. Reemplazar `#ddd` → `var(--color-border-strong)` o `var(--color-border)`
8. Reemplazar `#eee` → `var(--color-border)`
9. Reemplazar `#e74c3c` → `var(--color-error)`
10. Reemplazar `#27ae60` → `var(--color-success)`
11. Reemplazar `#2e7d32` → `var(--color-success-text)`
12. Reemplazar `#f0f0f0` → `var(--color-border)`
13. Reemplazar `#f5f5f5` → `var(--color-surface-hover)`
14. Reemplazar `#fdecea` → `var(--color-error-bg)`
15. Reemplazar `box-shadow: 0 2px 8px rgba(0,0,0,0.06)` → `box-shadow: var(--shadow-sm)`
16. Reemplazar `border-radius: 10px` → `border-radius: var(--radius-lg)`
17. Reemplazar `border-radius: 8px` → `border-radius: var(--radius-md)`

#### 6.1 — payment-receipt.component.ts

Archivo: `desktop/src/app/features/payments/pages/payment-receipt/payment-receipt.component.ts`

Tiene 30+ líneas de CSS inline. Reemplazar todos los colores según la tabla de mapeo arriba.

#### 6.2 — booking-form.component.ts

Archivo: `desktop/src/app/features/bookings/pages/booking-form/booking-form.component.ts`

Tiene 16 reglas CSS. Mismo mapeo.

#### 6.3 — booking-calendar.component.ts

Archivo: `desktop/src/app/features/bookings/pages/booking-calendar/booking-calendar.component.ts`

Casos especiales:
- `cls.color || '#667eea'` → `cls.color || 'var(--color-primary)'`
- `.calendar-cell:hover { background: #f0f4ff; }` → `background: var(--color-primary-50)`
- `.calendar-cell.other-month { opacity: 0.35; }` → cambiar a `opacity: 0.4` (mejor contraste)
- `.calendar-cell.today { background: #eef2ff; }` → `background: var(--color-primary-50)`

#### 6.4 — settings.component.ts

Archivo: `desktop/src/app/features/settings/pages/settings/settings.component.ts`

18 reglas CSS. Mismo mapeo.
- `border-bottom: 1px solid #eee` → `border-bottom: 1px solid var(--color-border)`
- `.success-msg` → `color: var(--color-success)`

#### 6.5 — user-form.component.ts

Archivo: `desktop/src/app/features/users/pages/user-form/user-form.component.ts`

16 reglas CSS. Mismo mapeo.

#### 6.6 — payment-form.component.ts

Archivo: `desktop/src/app/features/payments/pages/payment-form/payment-form.component.ts`

7 reglas CSS. Mismo mapeo.

#### 6.7 — member-form.component.ts

Archivo: `desktop/src/app/features/members/pages/member-form/member-form.component.ts`

5 reglas CSS. Mismo mapeo.

#### 6.8 — subscription-form.component.ts

Archivo: `desktop/src/app/features/subscriptions/pages/subscription-form/subscription-form.component.ts`

8 reglas CSS. Mismo mapeo.

#### 6.9 — inventory-form.component.ts

Archivo: `desktop/src/app/features/inventory/pages/inventory-form/inventory-form.component.ts`

6 reglas CSS. Mismo mapeo.

#### 6.10 — inventory-loan-form.component.ts

Archivo: `desktop/src/app/features/inventory/pages/inventory-loan-form/inventory-loan-form.component.ts`

6 reglas CSS. Mismo mapeo.

#### 6.11 — plan-form.component.ts

Archivo: `desktop/src/app/features/plans/pages/plan-form/plan-form.component.ts`

4 reglas CSS. Mismo mapeo.

#### 6.12 — branch-form.component.ts

Archivo: `desktop/src/app/features/branches/pages/branch-form/branch-form.component.ts`

3 reglas CSS. Mismo mapeo.

#### 6.13 — check-in.component.ts

Archivo: `desktop/src/app/features/check-in/pages/check-in/check-in.component.ts`

2 reglas CSS. Mismo mapeo.

#### 6.14 — class-form.component.ts

Archivo: `desktop/src/app/features/classes/pages/class-form/class-form.component.ts`

Tiene `styles: []` (vacío). No requiere cambios.

---

### Fase 7 — Migrar Colores Hardcodeados en Templates

Además de los estilos inline, los templates HTML pueden tener colores hardcodeados en atributos `class` o `style`.

#### 7.1 — Buscar patrones en templates

Usar `rg` para encontrar ocurrencias:
```bash
rg -n "bg-gray-\d+" --include="*.ts" --include="*.html" desktop/src/app/
rg -n "text-gray-\d+" --include="*.ts" --include="*.html" desktop/src/app/
rg -n "#667eea|#764ba2|#1a1a2e|#333|#666|#999|#ddd|#e74c3c|#27ae60" --include="*.ts" desktop/src/app/
```

#### 7.2 — Reemplazos en templates (por componente)

| Componente (archivo) | Clase actual | Reemplazar por |
|----------------------|-------------|----------------|
| **booking-calendar** `h2` | `text-gray-800` | `text-slate-800` |
| **booking-calendar** header bg | `bg-gray-200` | `bg-slate-200` |
| **booking-calendar** day names | `bg-gray-50 text-gray-500` | `bg-slate-50 text-slate-500` |
| **booking-calendar** class tags | `color: white` | mantener (es sin bg) |
| **check-in** | `bg-green-50 text-green-700` | `bg-emerald-50 text-emerald-700` |
| **check-in** | `bg-red-50 text-red-700` | `bg-red-50 text-red-700` (mantener) |
| **check-in** | `bg-indigo-100 text-indigo-700` | `bg-indigo-100 text-indigo-700` (mantener) |
| **check-in** | `text-green-500` | `text-emerald-500` |
| **dashboard** cards | `text-gray-600`, `text-gray-500`, `text-gray-800` | `text-slate-600`, `text-slate-500`, `text-slate-800` |
| **dashboard** income | `text-green-600` | `text-emerald-600` |
| **notification-center** | `bg-green-100` (channel badge) | `bg-emerald-100` |
| **notification-center** | `bg-purple-100` | `bg-purple-100` (mantener) |
| **notification-center** | `bg-blue-50 text-blue-500` | `bg-sky-50 text-sky-500` |
| **All list components** | `text-gray-500` (headers) | `text-slate-500` |
| **All list components** | `text-gray-800` (primary col) | `text-slate-800` |
| **All list components** | `text-gray-500` (data) | `text-slate-500` |
| **All list components** | `hover:bg-gray-50` | `hover:bg-slate-50` |
| **All list components** | `border-b border-gray-200` | `border-b border-slate-200` |
| **All list components** | `border-b border-gray-100` | `border-b border-slate-100` |
| **All list components** | `text-gray-400` (empty) | `text-slate-400` |
| **Settings** table headers | `text-gray-500` | `text-slate-500` |
| **Settings** table rows | `border-gray-200`, `border-gray-100` | `border-slate-200`, `border-slate-100` |
| **Settings** table data | `text-gray-700` | `text-slate-700` |

---

### Fase 8 — Chart Color en Dashboard

Archivo: `desktop/src/app/features/dashboard/pages/dashboard/dashboard.component.ts`

```typescript
// Buscar:
backgroundColor: '#667eea',
// Reemplazar con:
backgroundColor: '#4F46E5',  // indigo-600
```

O mejor, usando variable CSS:
```typescript
backgroundColor: 'var(--color-primary)',
```

**Nota**: Chart.js no soporta variables CSS directamente en todos los casos. Podría necesitarse obtener el valor computado:
```typescript
const style = getComputedStyle(document.documentElement);
const primary = style.getPropertyValue('--color-primary').trim();
// usar primary en la config de chart
```

---

### Fase 9 — Arreglos de Contraste Específicos

| Ubicación | Problema | Solución |
|-----------|----------|----------|
| `.empty` en listas | `text-gray-400` (~2.8:1) sobre blanco | Cambiar a `text-slate-400` (~3.9:1) o agregar opacidad sobre icono |
| `.loading` | `color: #999` (~1.9:1) sobre blanco | Cambiar a `color: var(--color-text-muted)` (#94A3B8, ~4.1:1 para texto grande) o `var(--color-text-secondary)` (#64748B, ~6.3:1) |
| `.calendar-cell.other-month` | `opacity: 0.35` | Subir a `opacity: 0.45` |
| `.receipt-subtitle` | `color: #999` | Cambiar a `var(--color-text-secondary)` |
| `.receipt-footer` | `color: #999` | Cambiar a `var(--color-text-secondary)` |

---

### Fase 10 — Verificación Final

| Paso | Acción |
|------|--------|
| 10.1 | `cd desktop && pnpm build` — debe pasar sin errores ni warnings de budget |
| 10.2 | Abrir app, navegar por todas las rutas: login, dashboard, members, members/new, plans, plans/new, subscriptions, subscriptions/new, classes, classes/new, bookings, check-in, payments, inventory, branches, reports, users, settings, notifications |
| 10.3 | Verificar contraste visual en cada pantalla |
| 10.4 | Verificar que el sidebar se vea bien con la nueva paleta |
| 10.5 | Verificar que login no tenga degradado, solo color sólido |
| 10.6 | Verificar que el chart del dashboard se vea con color indigo-600 |
| 10.7 | Verificar que todos los botones primarios usen indigo-600 |
| 10.8 | Verificar que los badges (activo, inactivo, cancelado, etc.) tengan colores correctos |

---

## Resumen de Archivos a Modificar

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `desktop/src/styles.scss` | Agregar tokens, cambiar fondo, importar theme |
| 2 | `desktop/src/styles/theme.scss` | **NUEVO** — Material theme personalizado |
| 3 | `desktop/src/index.html` | Fuente Inter, quitar Roboto |
| 4 | `desktop/src/app/layouts/main/main-layout.component.ts` | Sidebar slate-800, colores sidebar |
| 5 | `desktop/src/app/features/auth/pages/login/login.component.ts` | Fondo sólido, tokens |
| 6 | `desktop/src/app/features/dashboard/pages/dashboard/dashboard.component.ts` | Chart color, clases slate |
| 7 | `desktop/src/app/features/payments/pages/payment-receipt/payment-receipt.component.ts` | Inline styles tokens |
| 8 | `desktop/src/app/features/bookings/pages/booking-form/booking-form.component.ts` | Inline styles tokens |
| 9 | `desktop/src/app/features/bookings/pages/booking-calendar/booking-calendar.component.ts` | Inline styles + calendar colors |
| 10 | `desktop/src/app/features/settings/pages/settings/settings.component.ts` | Inline styles tokens |
| 11 | `desktop/src/app/features/users/pages/user-form/user-form.component.ts` | Inline styles tokens |
| 12 | `desktop/src/app/features/payments/pages/payment-form/payment-form.component.ts` | Inline styles tokens |
| 13 | `desktop/src/app/features/members/pages/member-form/member-form.component.ts` | Inline styles tokens |
| 14 | `desktop/src/app/features/subscriptions/pages/subscription-form/subscription-form.component.ts` | Inline styles tokens |
| 15 | `desktop/src/app/features/inventory/pages/inventory-form/inventory-form.component.ts` | Inline styles tokens |
| 16 | `desktop/src/app/features/inventory/pages/inventory-loan-form/inventory-loan-form.component.ts` | Inline styles tokens |
| 17 | `desktop/src/app/features/plans/pages/plan-form/plan-form.component.ts` | Inline styles tokens |
| 18 | `desktop/src/app/features/branches/pages/branch-form/branch-form.component.ts` | Inline styles tokens |
| 19 | `desktop/src/app/features/check-in/pages/check-in/check-in.component.ts` | Inline styles tokens |
| 20 | `desktop/src/app/features/notifications/pages/notification-center/notification-center.component.ts` | Template clases |
| 21 | `desktop/src/app/features/check-in/pages/check-in/check-in.component.ts` | Template clases |
| 22+ | Todos los componentes list | Template clases gray → slate |

**Total aprox: 22-25 archivos**

---

## Commit

```bash
git add -A && git commit -m "feat: brand identity & design system - Iteración 11

- Design tokens (CSS custom properties) en styles.scss
- Material theme personalizado (indigo + sky) reemplaza indigo-pink.css
- Fuente Inter reemplaza Roboto
- Sidebar migrado a slate-800 con nueva paleta
- Login con fondo indigo sólido
- Dashboard chart color actualizado a indigo-600
- 13 componentes con inline styles migrados a tokens
- Contraste mejorado en estados vacíos, loading, subtítulos
- Todas las clases gray-* → slate-* en templates"
```

---

## Post-Iteración

Actualizar `HANDOFF.md`:
- Nueva sección Iteración 11 con resumen
- Theme: indigo-600 + slate + Inter
- Actualizar "temas pendientes" si aplica
