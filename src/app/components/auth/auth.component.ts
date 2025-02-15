// 🚀 Login Component (Standalone)
// This component is used for authentication and does not rely on a module
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Import AuthService


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true, // ✅ Standalone component (no NgModule)
  imports: [CommonModule, FormsModule], // ✅ Uses Angular common module
})
export class AuthComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.email, this.password, this.rememberMe)
      .then(() => {
        console.log('✅ Login Successful');
        this.router.navigate(['/dashboard']);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          console.error('❌ Login Error:', error.message);
          alert(`Login failed: ${error.message}`);
        } else {
          console.error('❌ Unknown Login Error:', error);
          alert('An unknown error occurred during login.');
        }
      });
  }
}


