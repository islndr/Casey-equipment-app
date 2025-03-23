import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { IOSAppComponent } from './components/ios-app/ios-app.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { IOSTabsComponent } from './components/ios-tabs/ios-tabs.component';
import { IOSSpecSheetsComponent } from './components/ios-spec-sheets/ios-spec-sheets.component';
import { PdfViewerComponent } from './components/ios-pdf-viewer/ios-pdf-viewer.component';
import { ContactManagementComponent } from './components/contact-management/contact-management.component';
import { IOSContactComponent } from './components/ios-contact/ios-contact.component';
import { FrontPageComponent } from './components/front-page.component';



export const routes: Routes = [
    { path: '', redirectTo: 'hero', pathMatch: 'full' },
  { path: 'iostabs', component: IOSTabsComponent }, // Default to Tabs
  { path: 'spec-sheets/:id', component: IOSSpecSheetsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard] }, // ✅ Use AuthGuard
  { path: 'tabs', component: TabsComponent, canActivate: [AuthGuard] }, // ✅ Use AuthGuard
  { path: 'ios', component: IOSAppComponent },
  { path: 'ios-pdf-viewer', component: PdfViewerComponent },
  { path: 'contact', component: ContactManagementComponent },
  { path: 'hero', component: FrontPageComponent },
  { path: 'ios-contact', component: IOSContactComponent },
  { path: '**', redirectTo: '/hero' },
  
  {
    path: 'ios-pdf-viewer',
    loadComponent: () =>
      import('./components/ios-pdf-viewer/ios-pdf-viewer.component').then(c => c.PdfViewerComponent)
  }
];





@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}