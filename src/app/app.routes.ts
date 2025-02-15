


import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' }, // ✅ Redirects to login page
  { path: 'auth', component: AuthComponent },
  { path: 'admin', component: AdminDashboardComponent },
];

