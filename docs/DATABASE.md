# Base de Datos

## Motor

PostgreSQL 16+. Elección por:
- Madurez y confiabilidad
- Tipos de datos avanzados (JSONB, arrays, enum)
- Buen rendimiento con joins complejos
- Extensiones útiles (pg_stat_statements, uuid-ossp)
- Soporte nativo de TypeORM y NestJS

## Convenciones

### Nombres

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Tablas | snake_case, plural | `members`, `subscription_plans` |
| Columnas | snake_case | `first_name`, `created_at` |
| PKs | `id` (UUID v7) | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| FKs | `{tabla}_id` | `member_id`, `plan_id` |
| Índices | `idx_{tabla}_{columna}` | `idx_members_email` |
| Unique | `uq_{tabla}_{columna}` | `uq_members_email` |
| Enums | `UPPER_SNAKE_CASE` | `MEMBER_STATUS`, `PAYMENT_METHOD` |

### Tipos de datos

- **IDs**: UUID v7 (ordenable cronológicamente, evita colisiones)
- **Strings cortos**: `VARCHAR(100)` o `VARCHAR(255)`
- **Strings largos**: `TEXT`
- **Fechas**: `TIMESTAMPTZ` (siempre con zona horaria)
- **Booleanos**: `BOOLEAN`
- **Decimales**: `DECIMAL(10,2)` para montos
- **Enums**: `CREATE TYPE` de PostgreSQL (no strings)
- **JSON**: `JSONB` para datos flexibles (configuraciones, metadata)

### Soft Delete

Todas las tablas tienen `deleted_at TIMESTAMPTZ NULL`. Las consultas siempre filtran `WHERE deleted_at IS NULL`. TypeORM soporta `@DeleteDateColumn()`.

### Audit fields

Todas las tablas tienen (excepto `updated_by` aún no implementado):

```sql
created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
deleted_at    TIMESTAMPTZ NULL
createdById   UUID REFERENCES users(id)
```

- `createdById` es **NOT NULL** en 12 tablas (FK → users), **nullable** solo en `notifications` (sistema puede crear sin usuario).
- El valor se inyecta desde el JWT vía `@CurrentUser('id')` en los controladores.
- `updated_by` está pendiente para una iteración futura.
- Usar `@BeforeUpdate()` en TypeORM para actualizar `updated_at`.

## Diagrama Entidad-Relación

> Nota: `createdById` es NOT NULL en todas las tablas excepto `notifications` (nullable). `users` no tiene `createdById` por ser la tabla raíz del sistema.



```
branches
  id (PK)
  name
  address
  phone
  logo_url
  is_active
  createdById (FK → users) NOT NULL

users
  id (PK)
  branch_id (FK → branches)
  name
  email (UQ)
  password_hash
  role (ENUM: superadmin, admin, recepcionista, instructor)
  is_active

refresh_tokens
  id (PK)
  user_id (FK → users)
  token_hash
  expires_at TIMESTAMPTZ
  createdById (FK → users) NOT NULL

members
  id (PK)
  branch_id (FK → branches)
  name
  email (UQ)
  phone
  photo_url
  document_number (UQ)
  birth_date
  address
  emergency_contact
  emergency_phone
  notes
  status (ENUM: active, suspended, expired, cancelled)
  last_check_in
  createdById (FK → users) NOT NULL

subscription_plans
  id (PK)
  branch_id (FK → branches, nullable)
  name
  description
  duration_days
  price DECIMAL(10,2)
  max_visits_per_week (nullable, NULL = ilimitado)
  grace_days
  is_active
  createdById (FK → users) NOT NULL

subscriptions
  id (PK)
  member_id (FK → members)
  plan_id (FK → subscription_plans)
  branch_id (FK → branches)
  start_date DATE
  end_date DATE
  status (ENUM: active, paused, expired, cancelled)
  paused_at TIMESTAMPTZ
  resumed_at TIMESTAMPTZ
  cancelled_at TIMESTAMPTZ
  auto_renew BOOLEAN DEFAULT false
  createdById (FK → users) NOT NULL

payments
  id (PK)
  subscription_id (FK → subscriptions)
  member_id (FK → members)
  amount DECIMAL(10,2)
  method (ENUM: cash, card, transfer, qr)
  reference (nullable)
  due_date DATE
  paid_date TIMESTAMPTZ
  status (ENUM: pending, paid, overdue, refunded)
  notes
  createdById (FK → users) NOT NULL

check_ins
  id (PK)
  member_id (FK → members)
  branch_id (FK → branches)
  type (ENUM: entry, exit)
  timestamp TIMESTAMPTZ DEFAULT NOW()
  createdById (FK → users) NOT NULL

classes
  id (PK)
  branch_id (FK → branches)
  name
  description
  instructor_id (FK → users)
  capacity INT
  duration_minutes INT
  is_active
  createdById (FK → users) NOT NULL

class_schedules
  id (PK)
  class_id (FK → classes)
  day_of_week INT (0=Sun, 1=Mon...6=Sat)
  start_time TIME
  end_time TIME
  createdById (FK → users) NOT NULL

bookings
  id (PK)
  member_id (FK → members)
  class_schedule_id (FK → class_schedules)
  date DATE
  status (ENUM: confirmed, cancelled, attended, no_show)
  checked_in_at TIMESTAMPTZ
  createdById (FK → users) NOT NULL

inventory_items
  id (PK)
  branch_id (FK → branches)
  name
  quantity INT
  condition (ENUM: new, good, needs_repair, damaged)
  last_maintenance DATE
  notes
  createdById (FK → users) NOT NULL

inventory_loans
  id (PK)
  member_id (FK → members)
  item_id (FK → inventory_items)
  loan_date TIMESTAMPTZ
  return_date TIMESTAMPTZ (nullable)
  returned_at TIMESTAMPTZ (nullable)
  status (ENUM: active, returned, overdue)
  createdById (FK → users) NOT NULL

notifications
  id (PK)
  member_id (FK → members, nullable)
  type (ENUM: expiration, payment, class_reminder, promotion)
  channel (ENUM: email, sms, push)
  subject TEXT
  body TEXT
  sent_at TIMESTAMPTZ
  read_at TIMESTAMPTZ (nullable)
  createdById (FK → users, nullable)
```

## Índices recomendados

```sql
-- Búsqueda de miembros
CREATE INDEX idx_members_name ON members USING gin(name gin_trgm_ops);
CREATE INDEX idx_members_email ON members (email) WHERE deleted_at IS NULL;
CREATE INDEX idx_members_document ON members (document_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_members_status ON members (status) WHERE deleted_at IS NULL;

-- Suscripciones activas
CREATE INDEX idx_subscriptions_active ON subscriptions (member_id, status)
  WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_subscriptions_expiring ON subscriptions (end_date)
  WHERE status = 'active' AND deleted_at IS NULL;

-- Pagos pendientes
CREATE INDEX idx_payments_overdue ON payments (due_date, status)
  WHERE status IN ('pending', 'overdue');

-- Check-ins recientes
CREATE INDEX idx_check_ins_date ON check_ins (member_id, timestamp DESC);

-- Clases por fecha
CREATE INDEX idx_bookings_date ON bookings (date, status);
CREATE INDEX idx_class_schedules_day ON class_schedules (day_of_week);
```

## Migraciones

TypeORM genera migraciones a partir de los cambios en las entidades.

```bash
# Generar migración automática
pnpm typeorm migration:generate src/migrations/AddMemberTable

# Ejecutar migraciones
pnpm typeorm migration:run
```

Las migraciones se ejecutan automáticamente al iniciar el backend en desarrollo. En producción, se ejecutan como paso separado en el CI/CD.

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'development') {
    const dataSource = app.get(DataSource);
    await dataSource.runMigrations();
  }

  await app.listen(3000);
}
```

## Estrategia contra N+1

Usar `relations` y `QueryBuilder` con joins explícitos. Nunca acceder a relaciones lazy fuera de un contexto de carga.

```typescript
// ❌ Mal: N+1 queries
const subscriptions = await this.subscriptionRepo.find();
for (const sub of subscriptions) {
  console.log(sub.member.name); // Cada iteración hace una query
}

// ✅ Bien: eager loading con relaciones
const subscriptions = await this.subscriptionRepo.find({
  relations: ['member', 'plan'],
});

// ✅ Bien: QueryBuilder con join
const subscriptions = await this.subscriptionRepo
  .createQueryBuilder('sub')
  .leftJoinAndSelect('sub.member', 'member')
  .leftJoinAndSelect('sub.plan', 'plan')
  .where('sub.status = :status', { status: 'active' })
  .getMany();
```

## Enums de PostgreSQL

```sql
CREATE TYPE member_status AS ENUM ('active', 'suspended', 'expired', 'cancelled');
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'expired', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'transfer', 'qr');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'refunded');
CREATE TYPE check_in_type AS ENUM ('entry', 'exit');
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'recepcionista', 'instructor');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'attended', 'no_show');
CREATE TYPE item_condition AS ENUM ('new', 'good', 'needs_repair', 'damaged');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push');
```
