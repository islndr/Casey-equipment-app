import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from '../tabs/tabs.component';
import { TabsService } from '../../services/tabs.service';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true, // ✅ Ensure standalone component
  imports: [TabsComponent, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',

}
)
export class AdminDashboardComponent {
  constructor(private tabsService: TabsService) {} // ✅ Inject TabsService

}

