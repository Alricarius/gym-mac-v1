# Estado Global (State Management)

## Estrategia

Usamos un enfoque híbrido:

| Tipo | Cuándo | Herramienta |
|------|--------|-------------|
| **Estado local** | Estado de un solo componente o feature | Angular Signals |
| **Estado compartido** | Estado usado por varios componentes de un mismo feature | Servicio con Signals |
| **Estado global** | Estado usado por toda la aplicación (auth, notificaciones) | NgRx |
| **Estado servidor** | Datos del backend con sincronización | Signals + HTTP + polling/WS |

## Signals (Angular 18)

### Estado local de componente

```typescript
@Component({ ... })
export class MemberListComponent {
  // Estado local
  private readonly searchSignal = signal('');
  private readonly sortSignal = signal<SortConfig>({ field: 'name', dir: 'asc' });

  // Estado derivado
  readonly filteredMembers = computed(() => {
    const search = this.searchSignal().toLowerCase();
    return this.members().filter(m =>
      m.name.toLowerCase().includes(search)
    );
  });

  // Acciones
  onSearch(term: string): void {
    this.searchSignal.set(term);
  }
}
```

### Servicio de feature con Signals

Un store liviano por feature. Ideal para el 80% de los casos.

```typescript
@Injectable({ providedIn: 'root' })
export class PlanStore {
  private readonly logger = inject(LoggerService);

  // Estado
  private readonly plansSignal = signal<Plan[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly selectedIdSignal = signal<string | null>(null);

  // Selectores públicos
  readonly plans = this.plansSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selectedPlan = computed(() =>
    this.plans().find(p => p.id === this.selectedIdSignal())
  );

  constructor(private readonly planService: PlanService) {}

  async loadAll(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const result = await firstValueFrom(this.planService.findAll());
      this.plansSignal.set(result.data);
    } catch (err) {
      const msg = 'Error al cargar planes';
      this.errorSignal.set(msg);
      this.logger.error(msg, err);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async create(dto: CreatePlanDto): Promise<void> {
    try {
      const newPlan = await firstValueFrom(this.planService.create(dto));
      this.plansSignal.update(plans => [...plans, newPlan]);
    } catch (err) {
      this.errorSignal.set('Error al crear plan');
      throw err;
    }
  }

  select(id: string): void {
    this.selectedIdSignal.set(id);
  }
}
```

## NgRx

### Cuándo usarlo

- **Auth** — el estado de autenticación afecta a toda la app
- **Notificaciones globales** — toasts, loading indicators
- **WebSocket estado** — conexión, check-ins en tiempo real

### Auth store (ejemplo)

```typescript
// core/store/auth/auth.state.ts
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};
```

```typescript
// core/store/auth/auth.actions.ts
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; accessToken: string; refreshToken: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');
export const refreshToken = createAction('[Auth] Refresh Token');
```

```typescript
// core/store/auth/auth.reducer.ts
export const authReducer = createReducer(
  initialAuthState,

  on(login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(loginSuccess, (state, { user, accessToken }) => ({
    ...state,
    user,
    accessToken,
    isAuthenticated: true,
    loading: false,
    error: null,
  })),

  on(loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(logout, () => initialAuthState),
);
```

```typescript
// core/store/auth/auth.effects.ts
@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(({ user, accessToken, refreshToken }) => {
            localStorage.setItem('refreshToken', refreshToken);
            return loginSuccess({ user, accessToken, refreshToken });
          }),
          catchError((err) =>
            of(loginFailure({ error: err.error?.message ?? 'Error al iniciar sesión' }))
          ),
        )
      ),
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthService,
  ) {}
}
```

## Estado del servidor (datos del backend)

Para datos que vienen del backend y pueden cambiar externamente:

```typescript
@Injectable({ providedIn: 'root' })
export class LiveCheckInStore {
  private readonly activeCheckInsSignal = signal<CheckIn[]>([]);

  readonly activeCheckIns = this.activeCheckInsSignal.asReadonly();

  constructor(
    private readonly checkInService: CheckInService,
    private readonly socket: SocketService,
  ) {
    // Carga inicial
    this.loadActive();

    // Actualizaciones en tiempo real
    this.socket.on('check-in:updated', (data) => {
      this.activeCheckInsSignal.update(current => {
        if (data.type === 'entry') {
          return [...current, data];
        }
        return current.filter(c => c.memberId !== data.memberId);
      });
    });
  }

  async loadActive(): Promise<void> {
    const result = await firstValueFrom(this.checkInService.getActive());
    this.activeCheckInsSignal.set(result.data);
  }
}
```

## Optimistic Updates

Aplicar cambios en UI inmediatamente y revertir si falla.

```typescript
async toggleSuspendSubscription(subscriptionId: string): Promise<void> {
  const previous = this.subscriptionsSignal();

  // Actualización optimista
  this.subscriptionsSignal.update(subs =>
    subs.map(sub =>
      sub.id === subscriptionId
        ? { ...sub, status: sub.status === 'active' ? 'suspended' : 'active' }
        : sub
    )
  );

  try {
    await firstValueFrom(this.subscriptionService.toggleSuspend(subscriptionId));
  } catch {
    // Revertir en caso de error
    this.subscriptionsSignal.set(previous);
    this.errorSignal.set('Error al cambiar estado de suscripción');
  }
}
```

## Flujo completo: Signals + NgRx

```
Evento externo (click, WS, timer)
        │
        ▼
  Service / Effect
        │
        ▼
  Signal.set()  o  Store.dispatch()
        │
        ▼
  computed() / select()  →  UI reactiva
```

## Cache de datos maestros

Datos que cambian raramente (planes, configuración) se cachean en memoria y se refrescan periódicamente.

```typescript
@Injectable({ providedIn: 'root' })
export class PlanCache {
  private readonly cacheSignal = signal<{ data: Plan[]; timestamp: number } | null>(null);
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  readonly plans = computed(() => this.cacheSignal()?.data ?? []);

  async getPlans(): Promise<Plan[]> {
    const cached = this.cacheSignal();
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    const result = await firstValueFrom(this.planService.findAll());
    this.cacheSignal.set({ data: result.data, timestamp: Date.now() });
    return result.data;
  }

  invalidate(): void {
    this.cacheSignal.set(null);
  }
}
```
