# Pruebas

## Estrategia

| Tipo | Propósito | Herramienta | Cobertura objetivo |
|------|-----------|-------------|-------------------|
| **Unitarias** | Servicios, pipes, guards, mappers | Jest | 90%+ |
| **Integración** | Controladores + servicios + DB real | Jest + Supertest | 80%+ |
| **E2E** | Flujo completo: API → DB → respuesta | Jest + Supertest + Testcontainers | Crítico |
| **Frontend** | Componentes, servicios, store | Jasmine + Karma | 70%+ |
| **Electron** | IPC handlers, main process | Jest (node) | 80%+ |

---

## Backend: pruebas unitarias

### Configuración

```typescript
// jest.config.ts
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.service.ts', '**/*.controller.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

### Factory de test

```typescript
// test/factories/member.factory.ts
import { v4 as uuid } from 'uuid';
import { MemberStatus } from '../../src/modules/members/domain/enums';

export const memberFactory = (overrides?: Partial<Member>) => ({
  id: uuid(),
  name: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '+52 55 1234 5678',
  status: MemberStatus.Active,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

export const dtoFactory = (overrides?: Partial<CreateMemberDto>) => ({
  name: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '+52 55 1234 5678',
  ...overrides,
});
```

### Mock de repositorio

```typescript
// test/mocks/repository.mock.ts
export const mockRepository = (): jest.Mocked<IMemberRepository> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  softDelete: jest.fn(),
});
```

### Prueba de servicio

```typescript
// src/modules/members/application/services/member.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MemberService } from './member.service';
import { MEMBER_REPOSITORY } from '../../domain/interfaces/member.repository.interface';
import { memberFactory, dtoFactory } from '../../../../../test/factories/member.factory';
import { mockRepository } from '../../../../../test/mocks/repository.mock';

describe('MemberService', () => {
  let service: MemberService;
  let repo: jest.Mocked<IMemberRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        { provide: MEMBER_REPOSITORY, useValue: mockRepository() },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
    repo = module.get(MEMBER_REPOSITORY);
  });

  describe('create', () => {
    it('should create a member and return response DTO', async () => {
      const dto = dtoFactory();
      const member = memberFactory({ email: dto.email });
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockResolvedValue(member);

      const result = await service.create(dto);

      expect(result).toBeInstanceOf(MemberResponseDto);
      expect(result.email).toBe(dto.email);
      expect(repo.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException when email exists', async () => {
      repo.findByEmail.mockResolvedValue(memberFactory());

      await expect(service.create(dtoFactory())).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when member not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

## Backend: pruebas de integración

### Setup con base de datos real

```typescript
// test/setup.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

let app: INestApplication;
let moduleFixture: TestingModule;

beforeAll(async () => {
  moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.init();
});

afterAll(async () => {
  await app.close();
});

export { app, request };
```

### Prueba de controller

```typescript
// src/modules/members/infrastructure/controllers/member.controller.spec.ts
import { app, request } from '../../../../../test/setup';

describe('MemberController (integration)', () => {
  const validDto = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+52 55 1234 5678',
  };

  describe('POST /api/v1/members', () => {
    it('should return 201 and create member', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/members')
        .send(validDto)
        .expect(201);

      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe(validDto.name);
    });

    it('should return 409 when email exists', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/members')
        .send(validDto)
        .expect(409);
    });

    it('should return 400 when email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/members')
        .send({ ...validDto, email: 'not-an-email' })
        .expect(400);
    });
  });

  describe('GET /api/v1/members', () => {
    it('should return paginated members', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/members')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page');
    });
  });
});
```

---

## Frontend: pruebas de componentes

```typescript
// features/members/components/member-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberListComponent } from './member-list.component';
import { MemberStore } from '../services/member.store';

describe('MemberListComponent', () => {
  let component: MemberListComponent;
  let fixture: ComponentFixture<MemberListComponent>;
  let store: jest.Mocked<MemberStore>;

  beforeEach(async () => {
    const storeMock = {
      members: jest.fn().mockReturnValue([]),
      loading: jest.fn().mockReturnValue(false),
      error: jest.fn().mockReturnValue(null),
      loadAll: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MemberListComponent],
      providers: [{ provide: MemberStore, useValue: storeMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberListComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MemberStore) as any;
  });

  it('should call loadAll on init', () => {
    component.ngOnInit();
    expect(store.loadAll).toHaveBeenCalled();
  });

  it('should display members list', () => {
    store.members.mockReturnValue([{ id: '1', name: 'Juan' }]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('table')).toBeTruthy();
  });
});
```

---

## Pruebas E2E

```typescript
// test/e2e/member-flow.e2e-spec.ts
describe('Member Flow (e2e)', () => {
  let authToken: string;

  beforeAll(async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@gym.com', password: 'Admin123' });

    authToken = res.body.data.accessToken;
  });

  it('full member lifecycle', async () => {
    // 1. Create member
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/members')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test', email: 'test@example.com', phone: '+52 55 1234 5678' })
      .expect(201);

    const memberId = createRes.body.data.id;

    // 2. Get member
    await request(app.getHttpServer())
      .get(`/api/v1/members/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // 3. Update member
    await request(app.getHttpServer())
      .patch(`/api/v1/members/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Updated' })
      .expect(200);

    // 4. Delete member
    await request(app.getHttpServer())
      .delete(`/api/v1/members/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // 5. Verify deleted
    await request(app.getHttpServer())
      .get(`/api/v1/members/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});
```

---

## Comandos

```bash
# Backend
pnpm test              # Unit tests
pnpm test:watch        # Watch mode
pnpm test:cov          # With coverage
pnpm test:e2e          # E2E tests
pnpm test:integration  # Integration tests

# Frontend
pnpm ng test           # Unit tests
pnpm ng test --watch   # Watch mode

# Todos
pnpm test              # All tests
```
