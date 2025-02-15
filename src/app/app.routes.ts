import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}