import { Component } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';
@Component({
  selector: 'app-admin-dashboard',
  imports: [TabsComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
  standalone: true
}
)
export class AdminDashboardComponent {

}
