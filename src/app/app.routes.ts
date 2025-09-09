import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth.guard';
import { DashboardComponent } from './feature/panel/dashboard/dashboard.component';
import { RegisterComponent } from './feature/auth/register/register.component';
import { LoginComponent } from './feature/auth/login/login.component';

export const routes: Routes = [
    
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Área protegida
  { path: '', canActivate: [authGuard], component: DashboardComponent },

  { path: '**', redirectTo: '' }
];
