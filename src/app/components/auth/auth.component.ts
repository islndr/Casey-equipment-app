import { Component } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  constructor(private auth: Auth, private authService: AuthService) {}

  async login() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      if (result.user) {
        await this.authService.saveUserToFirestore(result.user);
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
    }
  }

  logout() {
    signOut(this.auth);
  }
}