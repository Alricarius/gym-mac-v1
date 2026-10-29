# UI Libraries — Angular Material + Tailwind CSS

## Stack visual

| Librería | Versión | Propósito |
|----------|---------|-----------|
| `@angular/material` | 18.x | Componentes de UI (cards, botones, inputs, paginator, chips) |
| `@angular/cdk` | 18.x | Utilidades de CDK |
| `tailwindcss` | 3.x | Clases utilitarias para layout y espaciado |

## Setup (ya hecho)

```bash
pnpm add @angular/material@18 @angular/cdk@18
pnpm add -D tailwindcss@3 postcss autoprefixer
```

### Configuración existente

- `tailwind.config.js` — content apunta a `src/**/*.{html,ts}`
- `src/styles.scss` — importa Tailwind (`@tailwind base/components/utilities`) + Material prebuilt theme (`indigo-pink`)
- `src/app/app.config.ts` — incluye `provideAnimations()`
- `src/index.html` — incluye Google Fonts (Roboto) + Material Icons

## Convenciones de componentes

### Botones

| Uso | Componente |
|-----|-----------|
| Acción principal (crear, guardar) | `<button mat-raised-button color="primary">` |
| Acción secundaria (editar, ver) | `<button mat-stroked-button>` |
| Acción destructiva (eliminar, cancelar) | `<button mat-stroked-button color="warn">` |
| Acción en sidebar/footer | `<button mat-flat-button>` |
| Con ícono | `<button mat-raised-button><mat-icon>add</mat-icon> Texto</button>` |

### Formularios

```html
<mat-form-field appearance="outline" class="w-full">
  <mat-label>Campo</mat-label>
  <input matInput [(ngModel)]="prop" placeholder="..." />
  <mat-icon matSuffix>search</mat-icon>
  @if (error) { <mat-error>Mensaje</mat-error> }
</mat-form-field>
```

### Cards (contenedores de página)

```html
<mat-card class="!rounded-xl !shadow-sm">
  <mat-card-header>
    <mat-card-title>Título</mat-card-title>
  </mat-card-header>
  <mat-card-content class="!p-6">
    <!-- contenido -->
  </mat-card-content>
</mat-card>
```

### Tablas

Usar `<table>` HTML nativo con clases Tailwind en vez de `mat-table` (más simple y legible):

```html
<div class="overflow-x-auto">
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b border-gray-200">
        <th class="text-left font-semibold text-gray-500 uppercase text-xs tracking-wider py-3 px-4">Columna</th>
      </tr>
    </thead>
    <tbody>
      @for (item of items(); track item.id) {
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <td class="py-3 px-4">{{ item.prop }}</td>
        </tr>
      }
    </tbody>
  </table>
</div>
```

### Paginación

```html
<mat-paginator [length]="total()" [pageSize]="20" [pageIndex]="page() - 1"
  [pageSizeOptions]="[10, 20, 50]" (page)="onPageChange($event)" showFirstLastButtons>
</mat-paginator>
```

### Badges / chips

Usar clases `badge` globales definidas en `styles.scss`:

```html
<span class="badge badge-active">Activo</span>
<span class="badge badge-paused">Pausado</span>
<span class="badge badge-cancelled">Cancelado</span>
<span class="badge badge-expired">Vencido</span>
<span class="badge badge-inactive">Inactivo</span>
```

## Sidebar (MainLayout)

Usa `mat-toolbar` + `mat-nav-list` + `mat-list-item` con íconos `mat-icon`.

Los links activos se marcan con la clase `.active` que aplica `background: rgba(255,255,255,0.1)`.

```html
<aside class="w-60 bg-gray-900 text-white flex flex-col">
  <mat-toolbar class="bg-gray-900 text-white">GymAdmin</mat-toolbar>
  <mat-nav-list>
    <a mat-list-item routerLink="/ruta" routerLinkActive="active">
      <mat-icon>icon_name</mat-icon> Texto
    </a>
  </mat-nav-list>
</aside>
```

## Componentes ya migrados (Parte A)

- [x] Sidebar (MainLayoutComponent) — `mat-toolbar`, `mat-nav-list`, `mat-list-item`, `mat-icon`, `mat-flat-button`
- [x] MemberList — `mat-card`, `mat-form-field`, `mat-button`, `mat-paginator`
- [x] PlanList — `mat-card`, `mat-form-field`, `mat-button`, `mat-paginator`
- [x] SubscriptionList — `mat-card`, `mat-button`, `mat-paginator`
- [x] PaymentList — `mat-card`, `mat-button`, `mat-paginator`
- [x] CheckInComponent — `mat-card`, `mat-form-field`, `mat-button`, `mat-chip`

## Checklist pendiente para Iteración 10 (Parte B)

- [ ] `mat-dialog` para confirmaciones de eliminar/pausar/cancelar
- [ ] `mat-select` en selects (gender, status, payment method)
- [ ] `mat-datepicker` en fechas (member birthDate, subscription startDate)
- [ ] `mat-snack-bar` para notificaciones de éxito/error toast
- [ ] `mat-progress-spinner` en loadings
- [ ] `mat-error` + validación visual en formularios (MemberForm, PlanForm, etc.)
- [x] Tema Material personalizado con colores del gimnasio (indigo + sky) reemplaza `indigo-pink.css`
- [ ] Responsive layout con Tailwind breakpoints
- [ ] Ajustar budget en `angular.json` si el bundle inicial excede 512 kB
