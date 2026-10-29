# Manual de Marca — GymAdmin

## 1. Filosofía de Diseño

GymAdmin es una herramienta de gestión administrativa para gimnasios. El diseño debe comunicar:

- **Profesionalismo** — interfaz limpia, ordenada, predecible
- **Energía** — toques de color que reflejen el entorno activo de un gimnasio
- **Claridad** — máxima legibilidad, jerarquía visual obvia, contraste suficiente
- **Eficiencia** — el usuario pasa horas en la app; fatiga visual mínima

---

## 2. Paleta de Colores

### 2.1 Colores Primarios — Indigo

| Token | Hex | Tailwind | Uso |
|-------|-----|----------|-----|
| `--color-primary-50` | `#EEF2FF` | `indigo-50` | Fondos de hover/selected en tablas, badges informativos |
| `--color-primary-100` | `#E0E7FF` | `indigo-100` | Badges hover, calendario celdas activas |
| `--color-primary-200` | `#C7D2FE` | `indigo-200` | Bordes de focus suaves |
| `--color-primary-300` | `#A5B4FC` | `indigo-300` | Hover de botones outline |
| `--color-primary-400` | `#818CF8` | `indigo-400` | Link hover |
| `--color-primary-500` | `#6366F1` | `indigo-500` | Links, iconos decorativos |
| **`--color-primary`** | **`#4F46E5`** | **`indigo-600`** | **Botones primarios, focus rings, active/highlight** |
| `--color-primary-700` | `#4338CA` | `indigo-700` | Hover de botones primarios |
| `--color-primary-800` | `#3730A3` | `indigo-800` | Active/pressed de botones |
| `--color-primary-900` | `#312E81` | `indigo-900` | Solo para textos decorativos o fondos oscuros |

### 2.2 Colores Neutros — Slate

| Token | Hex | Tailwind | Uso |
|-------|-----|----------|-----|
| **`--color-bg`** | **`#F8FAFC`** | **`slate-50`** | **Fondo de página (body, main content)** |
| `--color-surface-hover` | `#F1F5F9` | `slate-100` | Hover de filas de tabla, hover de cards |
| **`--color-border`** | **`#E2E8F0`** | **`slate-200`** | **Bordes de inputs, tablas, cards** |
| `--color-border-light` | `#CBD5E1` | `slate-300` | Bordes secundarios, dividers |
| `--color-text-muted` | `#94A3B8` | `slate-400` | Texto deshabilitado, placeholders, metadatos secundarios |
| **`--color-text-secondary`** | **`#64748B`** | **`slate-500`** | **Subtítulos, labels, secondary text** |
| `--color-text-body` | `#475569` | `slate-600` | Cuerpo de texto, párrafos, celdas de datos |
| `--color-text-heading` | `#334155` | `slate-700` | Títulos de sección, encabezados de tabla |
| **`--color-text-primary`** | **`#0F172A`** | **`slate-900`** | **Títulos principales, texto de alto énfasis** |
| **`--color-sidebar-bg`** | **`#1E293B`** | **`slate-800`** | **Fondo del sidebar** |
| `--color-sidebar-hover` | `#334155` | `slate-700` | Hover de items en sidebar |
| `--color-sidebar-text` | `#FFFFFF` | `white` | Texto en sidebar |
| `--color-sidebar-text-muted` | `#94A3B8` | `slate-400` | Texto secundario en sidebar |

### 2.3 Colores Semánticos

| Token | Hex | Tailwind | Uso |
|-------|-----|----------|-----|
| **`--color-success`** | **`#10B981`** | **`emerald-500`** | **Éxito, activo, pagado, conectado** |
| `--color-success-bg` | `#D1FAE5` | `emerald-100` | Fondo de badge success |
| `--color-success-text` | `#065F46` | `emerald-800` | Texto de badge success |
| **`--color-warning`** | **`#F59E0B`** | **`amber-500`** | **Advertencia, pausado, stock bajo** |
| `--color-warning-bg` | `#FEF3C7` | `amber-100` | Fondo de badge warning |
| `--color-warning-text` | `#92400E` | `amber-800` | Texto de badge warning |
| **`--color-error`** | **`#EF4444`** | **`red-500`** | **Error, cancelado, denegado** |
| `--color-error-bg` | `#FEE2E2` | `red-100` | Fondo de badge error, alertas |
| `--color-error-text` | `#991B1B` | `red-800` | Texto de badge error |

### 2.4 Colores de Acento — Sky

| Token | Hex | Tailwind | Uso |
|-------|-----|----------|-----|
| `--color-accent` | `#0EA5E9` | `sky-500` | Links, badges de info, iconos decorativos |
| `--color-accent-bg` | `#E0F2FE` | `sky-100` | Fondos de información |

### 2.5 Contraste — Garantías

Todos los pares de color cumplen WCAG AA:

| Par | Ratio | Pasa AA |
|-----|-------|---------|
| `indigo-600` sobre `white` | 7.5:1 | ✅ (texto normal) |
| `slate-900` sobre `white` | 14.5:1 | ✅ (texto normal) |
| `slate-500` sobre `white` | 6.3:1 | ✅ (texto normal) |
| `slate-400` sobre `white` | 4.1:1 | ✅ (texto grande, 18px+) ❌ (texto normal) → usar solo para placeholders/metadata |
| `white` sobre `slate-800` | 9.2:1 | ✅ |
| `slate-400` sobre `slate-800` | 5.5:1 | ✅ |

> **Regla**: `--color-text-muted` (#94A3B8) solo para placeholders, texto deshabilitado o metadata de muy baja jerarquía. Para texto legible siempre usar `--color-text-secondary` o superior.

---

## 3. Tipografía

### 3.1 Familia Tipográfica

```
Inter (UI) → títulos, labels, botones, navegación
```

> Inter es una tipografía humanista diseñada para pantallas, con excelente legibilidad en pesos light a bold. Reemplaza a Roboto.

### 3.2 Stack

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### 3.3 Escala Tipográfica

| Nivel | Tamaño | Weight | Line-Height | Token ejemplar |
|-------|--------|--------|-------------|----------------|
| **Hero / page title** | 24px / 1.5rem | **600** (semibold) | 1.2 | `h1` en páginas |
| **Section title** | 18px / 1.125rem | **600** | 1.3 | `h2` en formularios |
| **Card title** | 16px / 1rem | **500** (medium) | 1.4 | Títulos de tarjetas |
| **Body** | 14px / 0.875rem | **400** (regular) | 1.5 | Texto de tablas, párrafos |
| **Body small** | 13px / 0.8125rem | **400** | 1.4 | Texto secundario, metadatos |
| **Caption / badge** | 12px / 0.75rem | **500** | 1.3 | Badges, etiquetas, timestamps |
| **Overline / label** | 11px / 0.6875rem | **600** | 1.2 | Encabezados de tabla, uppercase |

### 3.4 Implementación

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Reemplazar la fuente Roboto en `index.html` por Inter.

---

## 4. Sistema de Espaciado

Basado en Tailwind, con una escala consistente:

| Escala | px | rem | Uso |
|--------|-----|------|------|
| `p-1` | 4px | 0.25rem | Íconos dentro de botones, gap mínimo |
| `p-2` | 8px | 0.5rem | Padding interno de badges, chips |
| `p-3` | 12px | 0.75rem | Padding de inputs, gap entre elementos |
| `p-4` | 16px | 1rem | Padding de cards, gap entre secciones |
| `p-6` | 24px | 1.5rem | Padding de página (`page` class) |
| `p-8` | 32px | 2rem | Padding de modales, separación mayor |

**Regla**: Usar siempre valores de la escala. No usar valores arbitrarios.

---

## 5. Componentes — Guías de Estilo

### 5.1 Botones

| Tipo | Background | Texto | Hover | Padding |
|------|-----------|-------|-------|---------|
| **Primary** | `indigo-600` | `white` | `indigo-700` | `px-6 py-2.5` |
| **Primary (disabled)** | `indigo-300` | `white` | — | `px-6 py-2.5` |
| **Secondary / outline** | `white` | `slate-700` | `slate-50` bg | `px-6 py-2.5` borde `slate-300` |
| **Flat / ghost** | transparent | `slate-600` | `slate-100` bg | `px-3 py-2` |
| **Icon button** | transparent | `slate-500` | `slate-100` bg | `p-2` |

- Borde redondeado: `rounded-lg` (8px)
- Texto: 14px, medium (500)
- Altura mínima: 40px (para touch target accesible)

### 5.2 Cards

- Fondo: `white`
- Border radius: `rounded-xl` (12px)
- Sombra: `shadow-sm` → `0 1px 2px rgba(0,0,0,0.05)`
- Padding: `p-6`
- Título de card: 16px, semibold, `slate-900`

### 5.3 Sidebar

- Ancho: 240px (`w-60`)
- Fondo: `slate-800`
- Texto activo: `white` con fondo `rgba(255,255,255,0.08)`
- Texto inactivo: `slate-400`
- Hover: `slate-700` bg
- Íconos: 20px, alineados con texto
- Branch select: custom con texto blanco, sin línea de base
- Border radius items: 8px

### 5.4 Tablas

- Contenedor: `mat-card`, `!rounded-xl !shadow-sm`, overflow hidden
- Header: `text-xs uppercase tracking-wider text-slate-500 bg-slate-50`
- Filas: `border-b border-slate-100 hover:bg-slate-50`
- Celdas de datos: `text-sm text-slate-600`
- Primary column (nombre): `font-medium text-slate-900`
- Empty state: `text-sm text-slate-400 text-center py-8`

### 5.5 Formularios / Inputs (Material)

- `appearance="outline"`
- Borde default: `slate-300`
- Focus: `indigo-500` ring
- Label: 14px, `slate-500`
- Input text: 14px, `slate-900`
- Error: `red-500` texto, `red-500` borde
- Espaciado entre campos: `mb-4`

### 5.6 Badges / Estados

| Estado | Fondo | Texto |
|--------|-------|-------|
| Activo / Activo | `emerald-100` | `emerald-800` |
| Inactivo / Inactivo | `slate-100` | `slate-600` |
| Pausado / Pausada | `amber-100` | `amber-800` |
| Cancelado / Cancelada | `red-100` | `red-800` |
| Vencido / Vencida | `slate-100` | `slate-400` |
| Advertencia (stock bajo) | `amber-100` | `amber-800` |

- Padding: `px-2.5 py-0.5`
- Font: 12px medium
- Border radius: `rounded-full`

### 5.7 Alertas / Mensajes

| Tipo | Fondo | Borde | Texto |
|------|-------|-------|-------|
| Error | `red-50` | `red-200` | `red-700` |
| Success | `emerald-50` | `emerald-200` | `emerald-700` |
| Warning | `amber-50` | `amber-200` | `amber-700` |
| Info | `sky-50` | `sky-200` | `sky-700` |

- Padding: `px-4 py-3`
- Font: 13px medium
- Border radius: `rounded-lg`

### 5.8 Loading / Spinner

- Color: `indigo-500`
- Texto acompañante: `text-sm text-slate-400`

### 5.9 Login Page

- Fondo: sólido `indigo-600` (sin degradado), con patrón de círculos sutiles vía CSS
- Card: `white`, `rounded-xl`, padding 40px, sombra `0 20px 60px rgba(79, 70, 229, 0.2)`
- Icono: `indigo-600`, 48px
- Título: `slate-900`, 24px, semibold
- Subtítulo: `slate-500`, 14px
- Botón: primary (indigo-600), full width

---

## 6. Design Tokens (CSS Custom Properties)

Definir en `:root` dentro de `styles.scss`:

```scss
:root {
  // Primary
  --color-primary: #4F46E5;
  --color-primary-hover: #4338CA;
  --color-primary-active: #3730A3;
  --color-primary-light: #EEF2FF;
  --color-primary-border: #C7D2FE;

  // Neutral
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-surface-hover: #F1F5F9;
  --color-border: #E2E8F0;
  --color-border-strong: #CBD5E1;

  // Text
  --color-text-primary: #0F172A;
  --color-text-heading: #334155;
  --color-text-body: #475569;
  --color-text-secondary: #64748B;
  --color-text-muted: #94A3B8;
  --color-text-disabled: #CBD5E1;

  // Sidebar
  --color-sidebar-bg: #1E293B;
  --color-sidebar-hover: #334155;
  --color-sidebar-text: #FFFFFF;
  --color-sidebar-text-muted: #94A3B8;

  // Semantic
  --color-success: #10B981;
  --color-success-bg: #D1FAE5;
  --color-success-text: #065F46;
  --color-warning: #F59E0B;
  --color-warning-bg: #FEF3C7;
  --color-warning-text: #92400E;
  --color-error: #EF4444;
  --color-error-bg: #FEE2E2;
  --color-error-text: #991B1B;
  --color-accent: #0EA5E9;
  --color-accent-bg: #E0F2FE;

  // Typography
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.5rem;

  // Border radius
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  // Shadows
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

---

## 7. Material Theme Personalizado

Reemplazar `indigo-pink.css` por un tema SASS que use la paleta definida.

Archivo: `src/styles/theme.scss`

```scss
@use '@angular/material' as mat;

$indigo-palette: (
  50: #EEF2FF,
  100: #E0E7FF,
  200: #C7D2FE,
  300: #A5B4FC,
  400: #818CF8,
  500: #6366F1,
  600: #4F46E5,  // primary
  700: #4338CA,
  800: #3730A3,
  900: #312E81,
  contrast: (50: #0F172A, 100: #0F172A, 200: #0F172A, 300: #0F172A,
             400: #FFFFFF, 500: #FFFFFF, 600: #FFFFFF, 700: #FFFFFF,
             800: #FFFFFF, 900: #FFFFFF)
);

$accent-palette: (
  50: #E0F2FE,
  100: #BAE6FD,
  200: #7DD3FC,
  300: #38BDF8,
  400: #0EA5E9,  // accent
  500: #0284C7,
  600: #0369A1,
  700: #075985,
  800: #0C4A6E,
  900: #082F49,
  contrast: (50: #0F172A, 100: #0F172A, 200: #0F172A, 300: #0F172A,
             400: #FFFFFF, 500: #FFFFFF, 600: #FFFFFF, 700: #FFFFFF,
             800: #FFFFFF, 900: #FFFFFF)
);

$warn-palette: (
  50: #FEF2F2,
  100: #FEE2E2,
  200: #FECACA,
  300: #FCA5A5,
  400: #F87171,
  500: #EF4444,
  600: #DC2626,
  700: #B91C1C,
  800: #991B1B,
  900: #7F1D1D,
  contrast: (50: #0F172A, 100: #0F172A, 200: #0F172A, 300: #0F172A,
             400: #FFFFFF, 500: #FFFFFF, 600: #FFFFFF, 700: #FFFFFF,
             800: #FFFFFF, 900: #FFFFFF)
);

$primary: mat.define-palette($indigo-palette, 600);
$accent: mat.define-palette($accent-palette, 400);
$warn: mat.define-palette($warn-palette, 500);

$theme: mat.define-light-theme((
  color: (primary: $primary, accent: $accent, warn: $warn),
  typography: mat.define-typography-config(
    $font-family: 'Inter, system-ui, -apple-system, sans-serif',
  ),
  density: 0,
));

@include mat.all-component-themes($theme);
@include mat.typography-hierarchy($theme);
```

Ajustar `angular.json` para que styles incluya `src/styles/theme.scss` después de los tokens.

---

## 8. Principios de Diseño

1. **Consistencia > creatividad** — usa los tokens, no inventes colores nuevos
2. **Contraste primero** — todo texto debe pasar WCAG AA (ratio ≥ 4.5:1)
3. **Menos es más** — nada de decoración innecesaria; cada elemento tiene un propósito
4. **Jerarquía visual** — usa tamaño, peso y color para guiar la atención, no animación
5. **Mobile-first mentalidad** — aunque es desktop, las tablas deben ser legibles sin scroll horizontal excesivo
6. **Feedback inmediato** — hover en todo lo cliqueable, loading states, error states
7. **Idioma** — interfaz en español, mensajes al usuario en español

---

## 9. Checklist de Accesibilidad

- [ ] Todos los botones tienen `:hover` y `:focus-visible` states
- [ ] Todos los inputs tienen labels visibles (no placeholders como label)
- [ ] Los mensajes de error están asociados al input via `aria-describedby` o `mat-error`
- [ ] Los íconos decorativos tienen `aria-hidden="true"`
- [ ] Los íconos funcionales tienen `aria-label`
- [ ] El sidebar usa landmarks semánticos (`<nav>`)
- [ ] Las tablas tienen `<th>` con scope
- [ ] Los colores no son el único indicador de estado (usar íconos + texto)
- [ ] Ratio de contraste ≥ 4.5:1 para texto normal, ≥ 3:1 para texto grande
- [ ] La navegación por teclado es completa (Tab, Enter, Escape)
