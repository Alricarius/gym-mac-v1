import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { MainLayoutComponent } from './layouts/main/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthLayoutComponent,
    canActivate: [loginGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
      },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'members',
        loadComponent: () =>
          import('./features/members/pages/member-list/member-list.component').then(
            (m) => m.MemberListComponent,
          ),
      },
      {
        path: 'members/new',
        loadComponent: () =>
          import('./features/members/pages/member-form/member-form.component').then(
            (m) => m.MemberFormComponent,
          ),
      },
      {
        path: 'members/:id',
        loadComponent: () =>
          import('./features/members/pages/member-form/member-form.component').then(
            (m) => m.MemberFormComponent,
          ),
      },
      {
        path: 'plans',
        loadComponent: () =>
          import('./features/plans/pages/plan-list/plan-list.component').then(
            (m) => m.PlanListComponent,
          ),
      },
      {
        path: 'plans/new',
        loadComponent: () =>
          import('./features/plans/pages/plan-form/plan-form.component').then(
            (m) => m.PlanFormComponent,
          ),
      },
      {
        path: 'plans/:id',
        loadComponent: () =>
          import('./features/plans/pages/plan-form/plan-form.component').then(
            (m) => m.PlanFormComponent,
          ),
      },
      {
        path: 'subscriptions',
        loadComponent: () =>
          import('./features/subscriptions/pages/subscription-list/subscription-list.component').then(
            (m) => m.SubscriptionListComponent,
          ),
      },
      {
        path: 'subscriptions/new',
        loadComponent: () =>
          import('./features/subscriptions/pages/subscription-form/subscription-form.component').then(
            (m) => m.SubscriptionFormComponent,
          ),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/payments/pages/payment-list/payment-list.component').then(
            (m) => m.PaymentListComponent,
          ),
      },
      {
        path: 'payments/new',
        loadComponent: () =>
          import('./features/payments/pages/payment-form/payment-form.component').then(
            (m) => m.PaymentFormComponent,
          ),
      },
      {
        path: 'payments/:id',
        loadComponent: () =>
          import('./features/payments/pages/payment-receipt/payment-receipt.component').then(
            (m) => m.PaymentReceiptComponent,
          ),
      },
      {
        path: 'check-in',
        loadComponent: () =>
          import('./features/check-in/pages/check-in/check-in.component').then(
            (m) => m.CheckInComponent,
          ),
      },
      {
        path: 'classes',
        loadComponent: () =>
          import('./features/classes/pages/class-list/class-list.component').then(
            (m) => m.ClassListComponent,
          ),
      },
      {
        path: 'classes/new',
        loadComponent: () =>
          import('./features/classes/pages/class-form/class-form.component').then(
            (m) => m.ClassFormComponent,
          ),
      },
      {
        path: 'classes/:id',
        loadComponent: () =>
          import('./features/classes/pages/class-form/class-form.component').then(
            (m) => m.ClassFormComponent,
          ),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/bookings/pages/booking-calendar/booking-calendar.component').then(
            (m) => m.BookingCalendarComponent,
          ),
      },
      {
        path: 'bookings/list',
        loadComponent: () =>
          import('./features/bookings/pages/booking-list/booking-list.component').then(
            (m) => m.BookingListComponent,
          ),
      },
      {
        path: 'bookings/new',
        loadComponent: () =>
          import('./features/bookings/pages/booking-form/booking-form.component').then(
            (m) => m.BookingFormComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/pages/reports/reports.component').then(
            (m) => m.ReportsComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
