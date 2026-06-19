# Manejo de Errores

## Estrategia general

- **Errores operacionales** → excepciones HTTP con código de error legible
- **Errores de programación** → 500 Internal Server Error + logging detallado
- **Errores de validación** → 400 Bad Request con mensajes descriptivos
- **Errores de negocio** → 409 Conflict con código de error específico

## Estructura de respuesta de error

```json
{
  "statusCode": 409,
  "error": "SUBSCRIPTION_EXPIRED",
  "message": "La membresía del miembro Juan Pérez está vencida desde el 15/06/2026",
  "timestamp": "2026-06-18T12:00:00.000Z",
  "path": "/api/v1/check-in/verify/abc-123",
  "details": {
    "memberId": "abc-123",
    "expiredAt": "2026-06-15T00:00:00.000Z"
  }
}
```

## Códigos de error estandarizados

| Código | HTTP | Descripción |
|--------|------|-------------|
| `VALIDATION_ERROR` | 400 | Datos de entrada inválidos |
| `INVALID_CREDENTIALS` | 401 | Email o contraseña incorrectos |
| `TOKEN_EXPIRED` | 401 | Access token expirado |
| `TOKEN_INVALID` | 401 | Token inválido |
| `FORBIDDEN` | 403 | No tiene permisos para esta acción |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `EMAIL_EXISTS` | 409 | El email ya está registrado |
| `SUBSCRIPTION_ACTIVE` | 409 | El miembro ya tiene una suscripción activa |
| `SUBSCRIPTION_EXPIRED` | 409 | La membresía está vencida |
| `MAX_CAPACITY_REACHED` | 409 | Clase con cupo lleno |
| `BOOKING_CONFLICT` | 409 | El miembro ya tiene reserva en este horario |
| `PLAN_IN_USE` | 409 | No se puede eliminar el plan porque tiene suscripciones activas |
| `MEMBER_HAS_DEBT` | 409 | El miembro tiene pagos pendientes |
| `INVENTORY_UNAVAILABLE` | 409 | El equipo no está disponible para préstamo |
| `BRANCH_MISMATCH` | 403 | El recurso no pertenece a esta sucursal |
| `MEMBER_SUSPENDED` | 409 | El miembro está suspendido |
| `RATE_LIMIT_EXCEEDED` | 429 | Demasiadas solicitudes |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |

## Exception filters

### Global exception filter

```typescript
// common/filters/global-exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: PinoLogger,
    private readonly reflector: Reflector,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let errorResponse: ErrorResponse;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'object' && exResponse !== null) {
        const body = exResponse as any;
        errorResponse = {
          statusCode: body.statusCode ?? status,
          error: body.error ?? 'HTTP_ERROR',
          message: body.message ?? exception.message,
          timestamp: new Date().toISOString(),
          path: request.url,
          details: body.details,
        };
      } else {
        errorResponse = this.createErrorResponse(status, 'HTTP_ERROR', exception.message, request.url);
      }
    } else if (exception instanceof EntityNotFoundError) {
      status = 404;
      errorResponse = this.createErrorResponse(404, 'NOT_FOUND', 'Recurso no encontrado', request.url);
    } else if (exception instanceof QueryFailedError) {
      status = 400;
      errorResponse = this.createErrorResponse(400, 'DATABASE_ERROR', 'Error en la consulta', request.url);
    } else {
      status = 500;
      errorResponse = this.createErrorResponse(500, 'INTERNAL_ERROR', 'Error interno del servidor', request.url);
    }

    // Logging
    if (status >= 500) {
      this.logger.error({ err: exception, path: request.url }, 'Internal server error');
    } else if (status >= 400) {
      this.logger.warn({ status, error: errorResponse.error, path: request.url }, 'Client error');
    }

    response.status(status).json(errorResponse);
  }

  private createErrorResponse(
    statusCode: number,
    error: string,
    message: string,
    path: string,
    details?: any,
  ): ErrorResponse {
    return {
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
      path,
      details,
    };
  }
}
```

### Business exceptions

```typescript
// common/exceptions/business.exception.ts
export class BusinessException extends HttpException {
  constructor(
    code: string,
    message: string,
    status: HttpStatus = HttpStatus.CONFLICT,
    details?: any,
  ) {
    super(
      {
        statusCode: status,
        error: code,
        message,
        details,
      },
      status,
    );
  }
}

// Uso
export class SubscriptionExpiredException extends BusinessException {
  constructor(memberName: string, expiredAt: Date) {
    super(
      'SUBSCRIPTION_EXPIRED',
      `La membresía de ${memberName} está vencida desde el ${formatDate(expiredAt)}`,
      HttpStatus.CONFLICT,
      { expiredAt },
    );
  }
}

export class EmailAlreadyExistsException extends BusinessException {
  constructor(email: string) {
    super(
      'EMAIL_EXISTS',
      `El email ${email} ya está registrado`,
      HttpStatus.CONFLICT,
      { email },
    );
  }
}
```

## Validación de DTOs

```typescript
// common/pipes/validation.pipe.ts
@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,           // Elimina propiedades no decoradas
      forbidNonWhitelisted: true, // Error si envía propiedades extra
      transform: true,           // Transforma tipos automáticamente
      exceptionFactory: (errors) => {
        const details = errors.map(err => ({
          field: err.property,
          constraints: err.constraints,
          value: err.value,
        }));

        return new HttpException(
          {
            statusCode: 400,
            error: 'VALIDATION_ERROR',
            message: 'Datos de entrada inválidos',
            timestamp: new Date().toISOString(),
            details,
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    });
  }
}
```

## Logging

### Logger estructurado con Pino

```typescript
// main.ts
import { Logger } from 'nestjs-pino';

app.useLogger(app.get(Logger));

// Uso en servicios
@Injectable()
export class PaymentService {
  constructor(private readonly logger: PinoLogger) {}

  async processPayment(dto: CreatePaymentDto) {
    this.logger.info({ amount: dto.amount, method: dto.method }, 'Processing payment');

    try {
      const result = await this.processor.charge(dto.amount, dto);
      this.logger.info({ paymentId: result.id }, 'Payment processed successfully');
      return result;
    } catch (error) {
      this.logger.error({ err: error, dto }, 'Payment processing failed');
      throw error;
    }
  }
}
```

### Correlación de requests

```typescript
// main.ts
import { v4 as uuid } from 'uuid';

app.use((req, res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] ?? uuid();
  next();
});
```

## Manejo de errores en Angular

### Error Interceptor global

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorData = error.error;

        // 401 — redirigir a login
        if (error.status === 401) {
          this.authService.logout();
          return throwError(() => error);
        }

        // 403 — sin permisos
        if (error.status === 403) {
          this.notificationService.showError('No tienes permisos para esta acción');
          return throwError(() => error);
        }

        // 409 — errores de negocio (mostrar mensaje específico)
        if (error.status === 409 && errorData?.message) {
          this.notificationService.showError(errorData.message);
          return throwError(() => error);
        }

        // 422 / 400 — errores de validación
        if (error.status === 400 && errorData?.details) {
          // Los detalles de validación se manejan en el formulario
          return throwError(() => error);
        }

        // 500+ — error inesperado
        if (error.status >= 500) {
          this.logger.error('Server error', error);
          this.notificationService.showError('Error del servidor. Intenta de nuevo.');
        }

        return throwError(() => error);
      }),
    );
  }
}
```

## En el frontend (formularios)

```typescript
// Manejo de errores de validación en formularios
@Component({ ... })
export class MemberFormComponent {
  errorMessages = signal<Record<string, string>>({});

  onSubmit(): void {
    this.memberStore.create(this.form.value).catch((error) => {
      if (error.status === 400 && error.error?.details) {
        const messages: Record<string, string> = {};
        for (const detail of error.error.details) {
          const firstConstraint = Object.values(detail.constraints)[0];
          if (firstConstraint) {
            messages[detail.field] = firstConstraint as string;
          }
        }
        this.errorMessages.set(messages);
      }
    });
  }
}
```
