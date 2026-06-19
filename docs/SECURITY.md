# Seguridad

## Autenticación

### JWT

- **Access token**: 15 minutos de validez
- **Refresh token**: 7 días, almacenado en base de datos (permite revocación)
- **Firma**: RS256 con par de llaves asimétricas
- **Payload mínimo**: `{ sub, email, role, branchId }`

```typescript
// auth.service.ts
async login(email: string, password: string) {
  const user = await this.userRepo.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const payload = { sub: user.id, email: user.email, role: user.role, branchId: user.branchId };
  const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
  const refreshToken = await this.createRefreshToken(user.id);

  return { accessToken, refreshToken, user: UserMapper.toResponse(user) };
}
```

### Refresh token rotation

Cada vez que se usa un refresh token:
1. Se valida y elimina de la BD
2. Se genera uno nuevo
3. Si se reusa un token ya eliminado → se revocan todos los tokens del usuario (posible robo)

```typescript
async refreshTokens(oldRefreshToken: string) {
  const stored = await this.refreshTokenRepo.findByToken(oldRefreshToken);

  if (!stored) {
    // Posible robo de token — revocar todos los tokens del usuario
    await this.refreshTokenRepo.revokeAllForUser(userId);
    throw new UnauthorizedException('Token reutilizado');
  }

  await this.refreshTokenRepo.delete(stored.id);
  const newRefreshToken = await this.createRefreshToken(stored.userId);
  const newAccessToken = this.jwtService.sign({ ... });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
```

## Autorización

### Role-based access control (RBAC)

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

```typescript
@Post()
@Roles(UserRole.Admin, UserRole.Superadmin)
@UseGuards(JwtAuthGuard, RolesGuard)
async create(@Body() dto: CreateMemberDto) { ... }
```

### Permisos por sucursal

Un usuario admin de la sucursal A no puede ver datos de la sucursal B.

```typescript
@Injectable()
export class BranchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    if (user.role === 'superadmin') return true;
    // Filtrar por branch_id en cada query
    request.branchFilter = { branchId: user.branchId };
    return true;
  }
}
```

## Protección de contraseñas

- **Hash**: bcrypt con 12 rounds
- **Mínimo**: 8 caracteres, 1 mayúscula, 1 número
- **Nunca** almacenar en texto plano
- **Nunca** devolver el hash en ninguna respuesta

## Rate limiting

```typescript
// main.ts
import helmet from 'helmet';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

app.use(helmet());
app.enableCors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
});

// Módulo global
ThrottlerModule.forRoot([{
  ttl: 60000,      // 1 minuto
  limit: 100,       // 100 requests por minuto
}]);
```

Endpoints sensibles con límites más estrictos:
- `/auth/login`: 5 intentos por minuto
- `/auth/refresh`: 10 por minuto

## Headers de seguridad

Helmet configura automáticamente:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 0`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy` (configurar según necesidad)

## Validación y sanitización

```typescript
// class-validator en todos los DTOs
export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @SanitizeHtml()        // Strip tags HTML
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\+?[\d\s-]{7,15}$/)
  phone: string;
}
```

## SQL Injection

TypeORM usa parameterized queries por defecto. Nunca concatenar strings en queries.

```typescript
// ✅ Bien
await this.repo.find({ where: { email } });

// ✅ Bien
await this.repo.query('SELECT * FROM members WHERE email = $1', [email]);

// ❌ Mal
await this.repo.query(`SELECT * FROM members WHERE email = '${email}'`);
```

## File upload

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('photo', {
  storage: diskStorage({
    destination: './uploads/photos',
    filename: (req, file, cb) => {
      const ext = extname(file.originalname);
      cb(null, `${uuid()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
      cb(new BadRequestException('Formato no permitido'), false);
    } else {
      cb(null, true);
    }
  },
}))
async uploadPhoto(@UploadedFile() file: Express.Multer.File) { ... }
```

## Logging de seguridad

Registrar siempre:
- Intentos de login fallidos
- Cambios de roles
- Eliminaciones de datos
- Acceso a recursos sin autorización

```typescript
@Injectable()
export class SecurityLogger {
  constructor(private readonly logger: PinoLogger) {}

  logFailedLogin(email: string, ip: string) {
    this.logger.warn({ email, ip }, 'Failed login attempt');
  }

  logRoleChange(userId: string, changedBy: string, newRole: string) {
    this.logger.info({ userId, changedBy, newRole }, 'Role changed');
  }
}
```
