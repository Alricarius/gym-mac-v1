import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../../features/auth/services/token.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { AuthStore } from '../../features/auth/services/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const authStore = inject(AuthStore);

  const token = tokenService.getAccessToken();
  let authReq = req;

  if (token && !req.url.includes('/auth/login')) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === HttpStatusCode.Unauthorized && !req.url.includes('/auth/refresh')) {
        const authService = inject(AuthService);
        return authService.refresh().pipe(
          switchMap((res) => {
            const cloned = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` },
            });
            return next(cloned);
          }),
          catchError(() => {
            authStore.clear();
            tokenService.clearTokens();
            router.navigate(['/login']);
            return throwError(() => error);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
