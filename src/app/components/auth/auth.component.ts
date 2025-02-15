import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  constructor(private auth: Auth) {}

  login(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then(user => console.log('Logged in:', user))
      .catch(error => console.error('Login error:', error));
  }
}