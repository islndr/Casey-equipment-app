import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { IOSAppComponent } from './components/ios-app/ios-app.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard] }, // ✅ Use AuthGuard
  { path: 'tabs', component: TabsComponent, canActivate: [AuthGuard] }, // ✅ Use AuthGuard
  { path: 'ios', component: IOSAppComponent },
  { path: '**', redirectTo: '/admin' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}