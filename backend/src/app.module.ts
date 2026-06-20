import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { dataSourceOptions } from './ormconfig';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MembersModule } from './modules/members/members.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CheckInModule } from './modules/check-in/check-in.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ClassesModule } from './modules/classes/classes.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { BranchesModule } from './modules/branches/branches.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    MembersModule,
    PlansModule,
    SubscriptionsModule,
    PaymentsModule,
    CheckInModule,
    ReportsModule,
    ClassesModule,
    BookingsModule,
    NotificationsModule,
    TasksModule,
    BranchesModule,
    InventoryModule,
  ],
})
export class AppModule {}
