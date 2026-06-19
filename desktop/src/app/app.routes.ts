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
