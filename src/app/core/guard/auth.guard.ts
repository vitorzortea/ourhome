import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, tap } from 'rxjs';
import { AuthService } from '../../feature/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn$.pipe(
    tap(isIn => {
      if (!isIn) {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      }
    }),
    map(isIn => isIn)
  );
};
