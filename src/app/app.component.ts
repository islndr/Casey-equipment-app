// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { getApps } from 'firebase/app';
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
export class AppComponent implements OnInit {
  constructor(public authService: AuthService, private router: Router) {}
  title = 'casey-equipment-app';
  isSidebarOpen = true; // Default state
  
  ngOnInit() {
    // Detect if running on an iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
  
    if (isIOS) {
      console.log("iOS device detected: redirecting to /iostabs");
      this.router.navigate(['/iostabs']);
    }
  
console.log('Firebase initialized:', getApps().length);
  }

    isRouteActive(route: string): boolean {
      return this.router.url.includes(route);
    }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;

  }
}

