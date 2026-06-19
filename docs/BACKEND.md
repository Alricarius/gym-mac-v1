# Backend — NestJS

## Stack

| Herramienta | Propósito |
|-------------|-----------|
| NestJS 10 | Framework principal |
| TypeScript 5 | Lenguaje |
| TypeORM | ORM + migraciones |
| PostgreSQL | Base de datos |
| JWT (passport) | Autenticación |
| Socket.IO | Tiempo real |
| Swagger | Documentación API |
| Pino | Logging estructurado |
| Jest | Pruebas |
| class-validator | Validación de DTOs |
| node-cron | Tareas programadas |

## Estructura de módulos

```
src/
├── common/                         # Código compartido
│   ├── decorators/                 # @CurrentUser, @Roles, etc.
│   ├── filters/                    # Exception filters globales
│   ├── guards/                     # JwtAuthGuard, RolesGuard
│   ├── interceptors/               # Logging, transform, cache
│   ├── pipes/                      # Validación personalizada
│   ├── dto/                        # Base DTOs (paginación, etc.)
│   └── interfaces/                 # Interfaces globales
├── config/                         # Configuración (env vars)
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts
├── modules/
│   ├── auth/
│   ├── members/
│   ├── plans/
│   ├── subscriptions/
│   ├── payments/
│   ├── check-in/
│   ├── classes/
│   ├── instructors/
│   ├── inventory/
│   ├── notifications/
│   ├── reports/
│   ├── branches/
│   └── config/
├── events/                         # Event bus global
├── app.module.ts
└── main.ts
```

## Convenciones

### Nomenclatura

- **Archivos**: `member.service.ts`, `create-member.dto.ts`, `member.repository.ts`
- **Clases**: `MemberService`, `CreateMemberDto`, `MemberRepository`
- **Métodos**: `create()`, `findById()`, `update()`, `softDelete()`
- **Tablas**: snake_case, plural (`members`, `subscription_plans`)
- **Columnas**: snake_case (`first_name`, `created_at`)

### Estructura de un módulo

Cada módulo exporta solo lo necesario en su `index.ts`. Nunca se importa directamente desde archivos internos de otro módulo.

```typescript
// members/index.ts
export { MemberModule } from './member.module';
export { MemberService } from './application/services/member.service';
export { CreateMemberDto } from './application/dtos/create-member.dto';
export { MemberResponseDto } from './application/dtos/member-response.dto';
```

### Inyección de dependencias

Siempre usar interfaces para los repositorios. Esto facilita el testing y poder cambiar la implementación.

```typescript
// domain/interfaces/member.repository.interface.ts
export const MEMBER_REPOSITORY = 'MEMBER_REPOSITORY';

export interface IMemberRepository {
  create(data: Partial<Member>): Promise<Member>;
  findById(id: string): Promise<Member | null>;
  findByEmail(email: string): Promise<Member | null>;
  findAll(filters: MemberFilters): Promise<PaginatedResult<Member>>;
  softDelete(id: string): Promise<void>;
}
```

```typescript
// infrastructure/persistence/member.repository.ts
@Injectable()
export class MemberRepository implements IMemberRepository {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly repo: Repository<MemberEntity>,
  ) {}

  async create(data: Partial<Member>): Promise<Member> { ... }
  // ...
}
```

```typescript
// member.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([MemberEntity])],
  controllers: [MemberController],
  providers: [
    MemberService,
    {
      provide: MEMBER_REPOSITORY,
      useClass: MemberRepository,
    },
  ],
  exports: [MemberService],
})
export class MemberModule {}
```

## Validación

Usar `class-validator` + `class-transformer` en todos los DTOs. Nunca confiar en validación del cliente.

```typescript
export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Matches(/^\+?[\d\s-]{7,15}$/)
  phone: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}
```

## Manejo de errores

Usar excepciones HTTP estándar de NestJS. Para errores de negocio, crear excepciones personalizadas.

```typescript
export class SubscriptionExpiredException extends HttpException {
  constructor(memberId: string) {
    super(
      {
        statusCode: 409,
        error: 'SUBSCRIPTION_EXPIRED',
        message: `La membresía del miembro ${memberId} está vencida`,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.CONFLICT,
    );
  }
}
```

## Logger

Usar Pino con correlación de requests.

```typescript
// main.ts
app.useLogger(new PinoLogger({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
}));
```

## Tareas programadas

Usar `@nestjs/schedule` para tareas como:
- Verificar membresías próximas a vencer (diario)
- Generar reportes automáticos (semanal)
- Limpiar tokens expirados (diario)
- Recordatorios de pago (diario)

```typescript
@Injectable()
export class SubscriptionTasks {
  @Cron('0 8 * * *') // 8 AM todos los días
  async checkExpiringSubscriptions() {
    const expiring = await this.subscriptionService.findExpiringWithin(3);
    for (const sub of expiring) {
      await this.notificationService.sendExpirationWarning(sub.member);
    }
  }
}
```

## Paginación

Todas las listas paginables usan el mismo formato:

```typescript
class PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```
