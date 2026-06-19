import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './modules/users/application/services/users.service';
import { MembersService } from './modules/members/application/services/members.service';
import { PlansService } from './modules/plans/application/services/plans.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const membersService = app.get(MembersService);
  const plansService = app.get(PlansService);

  try {
    const admin = await usersService.create({
      email: 'admin@admin.com',
      password: 'Admin123',
      fullName: 'Admin Principal',
      role: 'admin' as any,
    });
    console.log('Admin created:', admin.email);
  } catch (err: any) {
    if (err instanceof ConflictException || err?.status === 409) {
      console.log('Admin already exists, skipping');
    } else {
      throw err;
    }
  }

  const members = [
    { fullName: 'Carlos López', email: 'carlos@email.com', phone: '555-0101', gender: 'male' as any },
    { fullName: 'María García', email: 'maria@email.com', phone: '555-0102', gender: 'female' as any },
    { fullName: 'Juan Pérez', email: 'juan@email.com', phone: '555-0103', gender: 'male' as any },
    { fullName: 'Ana Martínez', email: 'ana@email.com', phone: '555-0104', gender: 'female' as any },
    { fullName: 'Pedro Sánchez', phone: '555-0105', gender: 'male' as any },
  ];

  for (const data of members) {
    try {
      const member = await membersService.create(data);
      console.log('Member created:', member.fullName);
    } catch (err: any) {
      if (err instanceof ConflictException || err?.status === 409) {
        console.log('Member already exists, skipping:', data.fullName);
      } else {
        throw err;
      }
    }
  }

  const plans = [
    { name: 'Mensual', duration: 30, price: 30, classCount: 8, description: 'Plan mensual con 8 clases' },
    { name: 'Trimestral', duration: 90, price: 80, classCount: 30, description: 'Plan trimestral con 30 clases' },
    { name: 'Anual', duration: 365, price: 300, description: 'Plan anual sin límite de clases' },
  ];

  for (const data of plans) {
    try {
      const plan = await plansService.create(data);
      console.log('Plan created:', plan.name);
    } catch (err: any) {
      if (err instanceof ConflictException || err?.status === 409) {
        console.log('Plan already exists, skipping:', data.name);
      } else {
        throw err;
      }
    }
  }

  await app.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
