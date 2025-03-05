// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

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
  
  ],
  providers: [AuthService],
  template: `
    <mat-toolbar color="primary">
      Casey Equipment App
    </mat-toolbar>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <a class="navbar-brand" href="#">Casey Equipment</a>
  
  <div class="navbar-nav">
    <a class="nav-item nav-link" *ngIf="authService.getRole() === 'admin'" routerLink="/admin">Admin Panel</a>
    <a class="nav-item nav-link" *ngIf="authService.getRole()" (click)="authService.logout()">Logout</a>
  </div>
</nav>
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened>
        <mat-nav-list>
          <a mat-list-item routerLink="/admin">Admin Panel</a>
          <a mat-list-item routerLink="/ios">iOS App</a>
          <a mat-list-item routerLink="/tabs">Spread Sheets</a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}