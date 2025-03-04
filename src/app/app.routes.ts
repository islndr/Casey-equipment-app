import { Routes } from '@angular/router';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { SpecSheetTableComponent } from './components/spec-sheet-table/spec-sheet-table.component';
import { IOSAppComponent } from './components/ios-app/ios-app.component';
import { TabsComponent } from './components/tabs/tabs.component';

export const routes: Routes = [
  { path: '', redirectTo: '/spec-sheet', pathMatch: 'full' },
  { path: 'admin', component: AdminPanelComponent },
  { path: 'tabs', component: TabsComponent },
  { path: 'spec-sheet', component: SpecSheetTableComponent },
  { path: 'ios', component: IOSAppComponent },
  { path: '**', redirectTo: '/admin' }
];