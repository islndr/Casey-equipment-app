// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';


import { HammerModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { MyHammerConfig } from '../hammer.config';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    CommonModule,
    RouterModule,
    HammerModule
   
  
  ],
  providers: [AuthService,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig
    },
  ],
  templateUrl: `./app.component.html`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public authService: AuthService) {}
  title = 'casey-equipment-app';
  isSidebarOpen = true; // Default state

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;

  }
}

