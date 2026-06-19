# Patrones de Diseño

Este documento describe los patrones de diseño utilizados en el sistema y dónde se aplican.

---

## Repository Pattern

**Propósito**: Abstraer la capa de persistencia. El dominio nunca depende de TypeORM ni de la base de datos.

**Dónde**: Todos los módulos del backend.

```
Service → IMemberRepository (interface) → MemberRepository (TypeORM)
```

```typescript
// El servicio solo conoce la interfaz
@Injectable()
export class MemberService {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepo: IMemberRepository,
  ) {}
}
```

---

## Unit of Work

**Propósito**: Garantizar que varias operaciones se ejecuten en una misma transacción.

**Dónde**: Operaciones que afectan múltiples tablas (crear suscripción + pago inicial, cancelar suscripción + reembolso).

```typescript
@Injectable()
export class SubscriptionService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly paymentService: PaymentService,
  ) {}

  async createWithPayment(dto: CreateSubscriptionDto): Promise<Subscription> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sub = await queryRunner.manager.save(SubscriptionEntity, { ... });
      const payment = await this.paymentService.createFromSubscription(
        queryRunner.manager, sub
      );
      await queryRunner.commitTransaction();
      return sub;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

---

## Strategy Pattern

**Propósito**: Seleccionar algoritmos en tiempo de ejecución según el contexto.

**Dónde**: Procesadores de pago, canales de notificación.

```typescript
// interface
export interface IPaymentProcessor {
  charge(amount: number, metadata: any): Promise<PaymentResult>;
  refund(transactionId: string): Promise<RefundResult>;
}

// estrategias concretas
@Injectable()
export class StripeProcessor implements IPaymentProcessor { ... }

@Injectable()
export class MercadoPagoProcessor implements IPaymentProcessor { ... }

// contexto
@Injectable()
export class PaymentProcessorFactory {
  private processors = new Map<string, IPaymentProcessor>();

  constructor(
    private readonly stripe: StripeProcessor,
    private readonly mp: MercadoPagoProcessor,
  ) {
    this.processors.set('stripe', stripe);
    this.processors.set('mercadopago', mp);
  }

  getProcessor(method: PaymentMethod): IPaymentProcessor {
    const processor = this.processors.get(method);
    if (!processor) throw new Error(`No processor for ${method}`);
    return processor;
  }
}
```

---

## Observer / Event Pattern

**Propósito**: Desacoplar módulos. Cuando algo sucede en un módulo, otros reaccionan sin acoplamiento directo.

**Dónde**: Eventos entre módulos (miembro creado → notificación de bienvenida, pago recibido → actualizar estado de suscripción).

```typescript
// Evento
export class MemberCreatedEvent {
  constructor(
    public readonly memberId: string,
    public readonly email: string,
    public readonly name: string,
  ) {}
}

// Emisor (MemberService)
@Injectable()
export class MemberService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async create(dto: CreateMemberDto): Promise<Member> {
    const member = await this.memberRepo.create(dto);
    this.eventEmitter.emit('member.created', new MemberCreatedEvent(
      member.id, member.email, member.name,
    ));
    return member;
  }
}

// Receptor (NotificationService)
@Injectable()
export class NotificationService {
  @OnEvent('member.created')
  async sendWelcomeEmail(event: MemberCreatedEvent) {
    await this.emailService.send({
      to: event.email,
      template: 'welcome',
      data: { name: event.name },
    });
  }
}
```

---

## DTO Pattern (Data Transfer Object)

**Propósito**: Definir contratos explícitos para las APIs. Separar la representación interna de la externa.

**Dónde**: Todos los controladores de NestJS.

```typescript
// DTO de entrada (request)
export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
}

// DTO de salida (response) — nunca expone la entidad
export class MemberResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  // Mapper
  static fromEntity(entity: Member): MemberResponseDto {
    return plainToInstance(MemberResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
```

---

## Mapper Pattern

**Propósito**: Convertir entre entidades de dominio, DTOs y entidades de persistencia.

**Dónde**: Capa de aplicación de cada módulo.

```typescript
export class MemberMapper {
  static toDomain(persistence: MemberEntity): Member {
    return new Member({
      id: persistence.id,
      name: persistence.name,
      email: persistence.email,
      // ...
    });
  }

  static toPersistence(domain: Member): MemberEntity {
    const entity = new MemberEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.email = domain.email;
    return entity;
  }

  static toResponse(domain: Member): MemberResponseDto {
    return MemberResponseDto.fromEntity(domain);
  }
}
```

---

## Factory Pattern

**Propósito**: Crear objetos complejos con lógica de inicialización.

**Dónde**: Creación de suscripciones (cálculo de fechas), facturas, reportes.

```typescript
@Injectable()
export class SubscriptionFactory {
  create(plan: Plan, startDate?: Date): Subscription {
    const start = startDate ?? new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.durationDays);

    return new Subscription({
      planId: plan.id,
      startDate: start,
      endDate: end,
      status: 'active',
      autoRenew: true,
    });
  }
}
```

---

## Singleton Pattern

**Propósito**: Una única instancia de un servicio compartida en toda la aplicación.

**Dónde**: Servicios de NestJS (scope `DEFAULT`), que es singleton por defecto.

---

## CQRS (Command Query Responsibility Segregation)

**Propósito**: Separar operaciones de escritura (commands) de operaciones de lectura (queries). Útil cuando las consultas tienen requisitos diferentes a los comandos.

**Dónde**: Módulo de reportes. Las consultas de analytics no usan las mismas entidades que las operaciones transaccionales.

```typescript
// Consulta separada para reportes
@Injectable()
export class IncomeReportService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async getMonthlyIncome(branchId: string, year: number): Promise<MonthlyIncome[]> {
    // Query optimizada para reportes, no usa repositorios
    return this.dataSource.query(`
      SELECT
        DATE_TRUNC('month', paid_date) as month,
        SUM(amount) as total
      FROM payments
      WHERE branch_id = $1
        AND status = 'paid'
        AND EXTRACT(YEAR FROM paid_date) = $2
      GROUP BY month
      ORDER BY month
    `, [branchId, year]);
  }
}
```

---

## Patrones adicionales

| Patrón | Uso |
|--------|-----|
| **Decorator** | Guards y decoradores personalizados de NestJS (`@Roles()`, `@CurrentUser()`) |
| **Interceptor** | Transformar respuestas, logging, medir tiempo de respuesta |
| **Pipe** | Validación y transformación de datos en controllers |
| **Adapter** | Adaptar librerías externas (Stripe SDK, Twilio) a interfaces propias |
| **Template Method** | Flujo de generación de reportes (misma estructura, diferente implementación) |
| **Chain of Responsibility** | Middleware de autenticación → guard de roles → validación → controlador |
