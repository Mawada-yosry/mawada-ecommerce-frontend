import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const role = authService.isUser();
    if (role === 'admin') {
        return true;
    }
    return router.createUrlTree(['/home']);
};