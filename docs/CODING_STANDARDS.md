# Coding Standards

## Gestión de versiones

### Conventional Commits

```
feat: add member check-in endpoint
fix: prevent duplicate email registration
docs: update API documentation
refactor: extract payment processing logic
test: add subscription renewal tests
chore: update dependencies
style: format code with prettier
```

Formato: `tipo(alcance): descripción en presente imperativo`

### Ramas

```
main           → Producción
develop        → Integración
feat/{name}    → Nuevas features
fix/{name}     → Correcciones
refactor/{name}→ Refactors
docs/{name}    → Documentación
```

---

## TypeScript

### Reglas generales

- `strict: true` en tsconfig
- `noImplicitAny: true`
- `strictNullChecks: true`
- Preferir `interface` sobre `type` para objetos
- Usar `type` para uniones, tuplas y tipos utilitarios

```typescript
// ✅ Bien
interface Member {
  id: string;
  name: string;
  email: string;
}

type MemberStatus = 'active' | 'suspended' | 'expired';
type PaginatedResponse<T> = { data: T[]; meta: PaginationMeta };

// ❌ Mal
type Member = {
  id: string;
  name: string;
};
```

### Naming

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Clases | PascalCase | `MemberService`, `CreateMemberDto` |
| Interfaces | PascalCase, prefijo I para interfaces de repositorio | `IMemberRepository` |
| Tipos | PascalCase | `MemberStatus`, `PaginatedResult` |
| Funciones | camelCase | `findAll()`, `createMember()` |
| Variables | camelCase | `activeMembers`, `totalCount` |
| Constantes | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE`, `DEFAULT_LIMIT` |
| Enums | PascalCase, valores UPPER_SNAKE_CASE | `MemberStatus.Active` |
| Archivos | kebab-case | `create-member.dto.ts` |
| Carpetas | kebab-case | `application/services/` |

### Imports

Orden:
1. Librerías externas
2. Módulos de NestJS/Common
3. Módulos internos del proyecto
4. Módulos relativos

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { MemberEntity } from './member.entity';
import { CreateMemberDto } from '../dto/create-member.dto';
```

---

## NestJS

### Módulos

- Cada módulo es un directorio autocontenido
- Exportar solo lo necesario desde `index.ts`
- Nunca importar archivos internos de otro módulo

### Controladores

- Nombres: `{recurso}.controller.ts`
- Métodos nombrados como la acción: `create()`, `findAll()`, `findOne()`
- Usar decoradores HTTP explícitos

```typescript
@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  async create(@Body() dto: CreateMemberDto): Promise<MemberResponseDto> {
    return this.memberService.create(dto);
  }

  @Get()
  async findAll(@Query() query: PaginationDto): Promise<PaginatedResult<MemberResponseDto>> {
    return this.memberService.findAll(query);
  }
}
```

### Servicios

- Nombres: `{recurso}.service.ts`
- Inyectar repositorios vía interfaces, no clases concretas
- Lógica de negocio siempre acá, nunca en controladores

```typescript
@Injectable()
export class MemberService {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepo: IMemberRepository,
  ) {}

  async create(dto: CreateMemberDto): Promise<MemberResponseDto> {
    const existing = await this.memberRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const member = await this.memberRepo.create(dto);
    return MemberMapper.toResponse(member);
  }
}
```

---

## Angular

### Componentes

- Standalone components (sin NgModules)
- Nombres: `{nombre}.component.ts`
- CSS: Tailwind + Angular Material (evitar CSS propio)
- Inputs/Outputs tipados

```typescript
@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `...`,
})
export class MemberListComponent {
  @Input() members: Signal<Member[]> = signal([]);
  @Output() pageChange = new EventEmitter<number>();
}
```

### Servicios

- Servicios de feature: `providedIn: 'root'`
- Servicios específicos de componente: `providedIn: 'component'`
- Comunicación con backend vía `HttpClient`

### Signals

- Estado local de componente → `signal()`
- Estado derivado → `computed()`
- Efectos secundarios → `effect()` (solo cuando es necesario)

### Templates inline (backticks)

Nunca uses `${{ variable }}` dentro de templates inline (backticks). El `${{` colisiona con la sintaxis de template literals de JavaScript `${...}`. Usá `{{ '$' + variable }}` en su lugar.

```typescript
// ❌ Mal — rompe el build
template: `<td>${{ plan.price }}</td>`

// ✅ Bien
template: `<td>{{ '$' + plan.price }}</td>`
```

---

## Estilo de código

### ESLint

Reglas clave:
- `@typescript-eslint/explicit-function-return-type`: off (NestJS lo infiere)
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: error
- `prefer-const`: error
- `no-console`: warn (usar logger)

### Prettier

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

---

## Pruebas

- Nombre del archivo: `{nombre}.spec.ts`
- Describir el escenario: `describe('MemberService.create', () => { ... })`
- It statements descriptivos: `it('should throw error when email already exists')`
- Usar factories para crear datos de prueba

```typescript
describe('MemberService', () => {
  let service: MemberService;
  let repo: jest.Mocked<IMemberRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MemberService,
        { provide: MEMBER_REPOSITORY, useValue: mockRepository() },
      ],
    }).compile();

    service = module.get(MemberService);
    repo = module.get(MEMBER_REPOSITORY);
  });

  describe('create', () => {
    it('should throw ConflictException when email exists', async () => {
      repo.findByEmail.mockResolvedValue(memberFactory());
      await expect(service.create(dtoFactory())).rejects.toThrow(ConflictException);
    });

    it('should return MemberResponseDto on success', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockResolvedValue(memberFactory());
      const result = await service.create(dtoFactory());
      expect(result).toBeInstanceOf(MemberResponseDto);
    });
  });
});
```
