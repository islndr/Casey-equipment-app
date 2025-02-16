import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { TabsComponent } from './components/tabs/tabs.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'tabs', component: TabsComponent },
  // Add more routes as needed
];

