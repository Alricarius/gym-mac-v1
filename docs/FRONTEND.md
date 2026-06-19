# Frontend — Electron + Angular

## Stack

| Herramienta | Propósito |
|-------------|-----------|
| Angular 18 | Framework (standalone components) |
| Angular Material | Componentes de UI |
| Tailwind CSS | Estilos utilitarios |
| Signals (Angular) | Estado reactivo local |
| NgRx | Estado global |
| Electron 30 | Desktop runtime |
| Socket.IO Client | Tiempo real |
| electron-builder | Empaquetado |

## Estructura

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── role.guard.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   ├── services/
│   │   │   ├── api.service.ts        # HTTP base
│   │   │   ├── auth.service.ts
│   │   │   └── electron.service.ts   # IPC bridge
│   │   └── store/
│   │       └── auth/
│   │           ├── auth.actions.ts
│   │           ├── auth.effects.ts
│   │           ├── auth.reducer.ts
│   │           └── auth.selectors.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── data-table/
│   │   │   ├── search-bar/
│   │   │   └── confirm-dialog/
│   │   ├── directives/
│   │   │   └── has-role.directive.ts
│   │   └── pipes/
│   │       ├── status.pipe.ts
│   │       └── currency.pipe.ts
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── members/
│   │   ├── plans/
│   │   ├── subscriptions/
│   │   ├── payments/
│   │   ├── check-in/
│   │   ├── classes/
│   │   ├── instructors/
│   │   ├── reports/
│   │   └── settings/
│   └── layouts/
│       ├── main-layout/
│       └── auth-layout/
├── electron/
│   ├── main.ts                  # Main process
│   ├── preload.ts               # Preload script
│   └── services/
│       ├── ipc-handlers.ts      # IPC handlers
│       ├── updater.ts           # Auto-update
│       └── notifications.ts     # Notificaciones nativas
├── assets/
├── environments/
├── index.html
├── main.ts                      # Angular entry
└── styles.scss
```

## Comunicación con Electron IPC

Nunca se accede a Node.js APIs directamente desde el renderer. Todo viaja por IPC.

```typescript
// electron/preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('notification:show', title, body),
  printReceipt: (data: ReceiptData) =>
    ipcRenderer.invoke('print:receipt', data),
  onMenuAction: (callback: (action: string) => void) =>
    ipcRenderer.on('menu:action', (_event, action) => callback(action)),
});
```

```typescript
// core/services/electron.service.ts
@Injectable({ providedIn: 'root' })
export class ElectronService {
  private api = (window as any).electronAPI;

  getAppVersion(): Promise<string> {
    return this.api?.getAppVersion() ?? Promise.resolve('development');
  }

  showNotification(title: string, body: string): void {
    this.api?.showNotification(title, body);
  }

  isElectron(): boolean {
    return !!this.api;
  }
}
```

## Lazy Loading

Cada feature se carga de forma diferida:

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes'),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes'),
      },
      {
        path: 'members',
        loadChildren: () => import('./features/members/members.routes'),
      },
      // ...
    ],
  },
];
```

## Estado con Signals

Priorizar Signals para estado local de componentes y servicios de feature. NgRx solo para estado global compartido (auth, notificaciones globales).

```typescript
// features/members/services/member.store.ts
@Injectable({ providedIn: 'root' })
export class MemberStore {
  private readonly membersSignal = signal<Member[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly members = this.membersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private readonly memberService: MemberService) {}

  async loadAll(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const result = await firstValueFrom(this.memberService.findAll());
      this.membersSignal.set(result.data);
    } catch (err) {
      this.errorSignal.set('Error al cargar miembros');
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
```

## Optimistic Updates

Para operaciones como check-in, aplicar cambios en UI inmediatamente y revertir si falla el backend.

```typescript
async checkIn(memberId: string): Promise<void> {
  const previous = this.membersSignal();
  this.membersSignal.update(members =>
    members.map(m =>
      m.id === memberId ? { ...m, isCheckedIn: true } : m
    )
  );
  try {
    await firstValueFrom(this.checkInService.record(memberId));
  } catch {
    this.membersSignal.set(previous);
    this.errorSignal.set('Error al registrar check-in');
  }
}
```

## Manejo de errores global

Interceptor centralizado para mostrar notificaciones y redirigir en 401.

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly notification: ElectronService,
    private readonly auth: AuthService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.auth.logout();
        } else {
          this.notification.showNotification(
            'Error',
            error.error?.message ?? 'Ha ocurrido un error',
          );
        }
        return throwError(() => error);
      }),
    );
  }
}
```

## Estilos

Combinar Angular Material para componentes complejos (tablas, diálogos, formularios) con Tailwind CSS para layout y espaciado.

```html
<mat-card class="p-4 mb-6">
  <mat-card-header class="flex items-center justify-between">
    <mat-card-title class="text-xl font-semibold">
      Lista de Miembros
    </mat-card-title>
    <button mat-raised-button color="primary" (click)="openCreateDialog()">
      <mat-icon>add</mat-icon>
      Nuevo Miembro
    </button>
  </mat-card-header>

  <mat-card-content>
    <app-data-table
      [data]="members()"
      [columns]="columns"
      [loading]="loading()"
      (page)="onPageChange($event)"
      (search)="onSearch($event)"
    />
  </mat-card-content>
</mat-card>
```
