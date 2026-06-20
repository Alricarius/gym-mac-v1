import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './modules/users/application/services/users.service';
import { MembersService } from './modules/members/application/services/members.service';
import { Member } from './modules/members/domain/entities/member.entity';
import { PlansService } from './modules/plans/application/services/plans.service';
import { Plan } from './modules/plans/domain/entities/plan.entity';
import { SubscriptionsService } from './modules/subscriptions/application/services/subscriptions.service';
import { CheckInsService } from './modules/check-in/application/services/check-ins.service';
import { CheckIn } from './modules/check-in/domain/entities/check-in.entity';
import { CheckInType } from './modules/check-in/domain/entities/check-in.entity';
import { ClassesService } from './modules/classes/application/services/classes.service';
import { BookingsService } from './modules/bookings/application/services/bookings.service';
import { DataSource } from 'typeorm';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const membersService = app.get(MembersService);
  const plansService = app.get(PlansService);
  const subscriptionsService = app.get(SubscriptionsService);

  const dataSource = app.get(DataSource);
  const checkInRepo = dataSource.getRepository(CheckIn);

  try {
    await usersService.create({
      email: 'admin@admin.com',
      password: 'Admin123',
      fullName: 'Admin Principal',
      role: 'admin' as any,
    });
    console.log('✓ Admin created');
  } catch (err: any) {
    if (err instanceof ConflictException || err?.status === 409) {
      console.log('~ Admin already exists, skipping');
    } else {
      throw err;
    }
  }

  const memberData = [
    { fullName: 'Carlos López', email: 'carlos@email.com', phone: '555-0101', gender: 'male' as any },
    { fullName: 'María García', email: 'maria@email.com', phone: '555-0102', gender: 'female' as any },
    { fullName: 'Juan Pérez', email: 'juan@email.com', phone: '555-0103', gender: 'male' as any },
    { fullName: 'Ana Martínez', email: 'ana@email.com', phone: '555-0104', gender: 'female' as any },
    { fullName: 'Pedro Sánchez', phone: '555-0105', gender: 'male' as any },
  ];

  const members: Member[] = [];
  for (const data of memberData) {
    try {
      const member = await membersService.create(data);
      members.push(member);
      console.log('✓ Member created:', member.fullName);
    } catch (err: any) {
      if (err instanceof ConflictException || err?.status === 409) {
        const existing = await membersService.findAll({});
        const found = existing.data.find((m: Member) => m.fullName === data.fullName);
        members.push(found!);
        console.log('~ Member already exists, skipping:', data.fullName);
      } else {
        throw err;
      }
    }
  }

  const planData = [
    { name: 'Mensual', duration: 30, price: 30, classCount: 8, description: 'Plan mensual con 8 clases' },
    { name: 'Trimestral', duration: 90, price: 80, classCount: 30, description: 'Plan trimestral con 30 clases' },
    { name: 'Anual', duration: 365, price: 300, description: 'Plan anual sin límite de clases' },
  ];

  const plans: Plan[] = [];
  for (const data of planData) {
    try {
      const plan = await plansService.create(data);
      plans.push(plan);
      console.log('✓ Plan created:', plan.name);
    } catch (err: any) {
      if (err instanceof ConflictException || err?.status === 409) {
        const existing = await plansService.findAll({});
        const found = existing.data.find((p: Plan) => p.name === data.name);
        plans.push(found!);
        console.log('~ Plan already exists, skipping:', data.name);
      } else {
        throw err;
      }
    }
  }

  const [carlos, maria, juan, ana] = members;
  const [mensual, trimestral, anual] = plans;

  const subsConfig = [
    { member: carlos, plan: mensual, startOffset: -15, method: 'cash' as any },
    { member: maria, plan: trimestral, startOffset: -30, method: 'card' as any },
    { member: juan, plan: mensual, startOffset: -3, method: 'transfer' as any },
    { member: ana, plan: anual, startOffset: -60, method: 'card' as any },
  ];

  for (const cfg of subsConfig) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + cfg.startOffset);

    try {
      await subscriptionsService.create({
        memberId: cfg.member.id,
        planId: cfg.plan.id,
        startDate: startDate.toISOString().split('T')[0],
        paymentMethod: cfg.method,
      });
      console.log('✓ Subscription + Payment created for', cfg.member.fullName);
    } catch (err: any) {
      if (err?.status === 409) {
        console.log('~ Subscription already exists for', cfg.member.fullName);
      } else {
        console.error('✗ Failed to create subscription for', cfg.member.fullName, err.message);
      }
    }
  }

  const today = new Date();
  const checkInMembers = [carlos, maria, juan, ana];
  let checkInCount = 0;

  for (let dayOffset = -6; dayOffset <= 0; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(8, 0, 0, 0);

    for (const member of checkInMembers) {
      if (Math.random() > 0.3) {
        const entry = new Date(date);
        entry.setHours(8 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60));
        await checkInRepo.insert({
          memberId: member.id,
          type: CheckInType.ENTRY,
          createdAt: entry,
        });
        checkInCount++;

        if (Math.random() > 0.5) {
          const exit = new Date(entry);
          exit.setHours(exit.getHours() + 1 + Math.floor(Math.random() * 2));
          await checkInRepo.insert({
            memberId: member.id,
            type: CheckInType.EXIT,
            createdAt: exit,
          });
          checkInCount++;
        }
      }
    }
  }

  console.log(`✓ ${checkInCount} check-ins created for the last 7 days`);

  const classesService = app.get(ClassesService);
  const bookingsService = app.get(BookingsService);

  const classData = [
    {
      name: 'Spinning', description: 'Clase intensiva de ciclismo indoor', capacity: 15, color: '#e74c3c',
      schedules: [
        { dayOfWeek: 1, startTime: '18:00', endTime: '19:00' },
        { dayOfWeek: 3, startTime: '18:00', endTime: '19:00' },
        { dayOfWeek: 5, startTime: '18:00', endTime: '19:00' },
      ],
    },
    {
      name: 'Yoga', description: 'Clase de yoga para todos los niveles', capacity: 20, color: '#2ecc71',
      schedules: [
        { dayOfWeek: 2, startTime: '07:00', endTime: '08:00' },
        { dayOfWeek: 4, startTime: '07:00', endTime: '08:00' },
      ],
    },
    {
      name: 'Funcional', description: 'Entrenamiento funcional de alta intensidad', capacity: 25, color: '#3498db',
      schedules: [
        { dayOfWeek: 1, startTime: '07:00', endTime: '08:00' },
        { dayOfWeek: 3, startTime: '07:00', endTime: '08:00' },
        { dayOfWeek: 5, startTime: '07:00', endTime: '08:00' },
      ],
    },
  ];

  for (const cd of classData) {
    try {
      const c = await classesService.create({
        name: cd.name, description: cd.description, capacity: cd.capacity, color: cd.color,
      });
      for (const s of cd.schedules) {
        await classesService.addSchedule(c.id, s);
      }
      console.log(`✓ Class created: ${c.name} with ${cd.schedules.length} schedules`);
    } catch (err: any) {
      console.log(`~ Class already exists, skipping: ${cd.name}`);
    }
  }

  const allClasses = (await classesService.findAll({})).data;
  const spinning = allClasses.find((c) => c.name === 'Spinning');

  if (spinning && carlos && juan) {
    const futureDates = [1, 3, 5].map((offset) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return d.toISOString().split('T')[0];
    });

    const spinningSchedules = spinning.schedules || [];

    for (let i = 0; i < Math.min(futureDates.length, spinningSchedules.length); i++) {
      try {
        await bookingsService.create({
          classId: spinning.id,
          scheduleId: spinningSchedules[i].id,
          memberId: carlos.id,
          bookingDate: futureDates[i],
        });
        console.log(`✓ Booking created for Carlos → Spinning on ${futureDates[i]}`);
      } catch (err: any) {
        console.log(`~ Booking skipped: ${err.message}`);
      }
    }

    const firstScheduleId = spinningSchedules[0]?.id;
    if (firstScheduleId) {
      try {
        await bookingsService.create({
          classId: spinning.id,
          scheduleId: firstScheduleId,
          memberId: juan.id,
          bookingDate: futureDates[0],
        });
        console.log(`✓ Booking created for Juan → Spinning on ${futureDates[0]}`);
      } catch (err: any) {
        console.log(`~ Booking skipped: ${err.message}`);
      }
    }
  }

  console.log('=== Seed complete ===');

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
