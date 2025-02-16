import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from '../tabs/tabs.component';
import { TabsService } from '../../services/tabs.service';
import { Router } from '@angular/router'; // Import Router for navigation

@Component({
  selector: 'app-admin-dashboard',
  standalone: true, // ✅ Ensure standalone component
  imports: [TabsComponent, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'], // Fix typo: styleUrl -> styleUrls
})
export class AdminDashboardComponent {
  constructor(private tabsService: TabsService, private router: Router) {} // ✅ Inject TabsService and Router

  logout() {
    // Implement your logout logic here
    // For example, clear user session, tokens, etc.
    console.log('User logged out');
    this.router.navigate(['/auth']); // Navigate to the login page
  }
}

