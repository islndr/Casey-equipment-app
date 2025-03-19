import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-web',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    CommonModule
  ],
  providers: [AuthService],
  templateUrl: `./web.component.html`,
  styleUrls: ['./web.component.css']
})
export class WebComponent {
  constructor(public authService: AuthService) {}

  title = 'casey-equipment-app';
  isSidebarOpen = true; // Default state

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}