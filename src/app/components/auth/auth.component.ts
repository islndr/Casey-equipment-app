// 🚀 Login Component (Standalone)
// This component is used for authentication and does not rely on a module
import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true, // ✅ Standalone component (no NgModule)
  imports: [CommonModule], // ✅ Uses Angular common module
})
export class AuthComponent {
  constructor(private auth: Auth) {}

  login(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then(user => console.log('Logged in:', user))
      .catch(error => console.error('Login error:', error));
  }
}


