import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    FormsModule,
    CommonModule,
  ],
  providers: [
    AuthService,
  ],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  rememberMe: boolean = false;
  
  constructor(private auth: Auth, private firestore: Firestore, private router: Router, private zone: NgZone, private authService: AuthService) {}


  
  async login() {
    this.errorMessage = ''; // Clear previous errors
  
    try {
      // ✅ Set session persistence based on "Remember Me"
      await setPersistence(this.auth, this.rememberMe ? browserLocalPersistence : browserSessionPersistence);

      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      const userId = userCredential.user.uid;
      
      const userRef = doc(this.firestore, `users/${userId}`);
      const userDoc = await getDoc(userRef);
  
      if (!userDoc.exists()) {
        throw new Error("User not found.");
      
      }
      console.log("Login button clicked with", this.email, this.password);
      const userData = userDoc.data();
      const role = userData?.['role'] || 'editor'; // Default to "editor"
      
      // ✅ Store user session
      const userSession = { uid: userId, email: this.email, role };
      if (this.rememberMe) {
        localStorage.setItem('user', JSON.stringify(userSession));
      } else {
        sessionStorage.setItem('user', JSON.stringify(userSession));
      }
  
      // ✅ Redirect based on role
      this.zone.run(() => {
        this.router.navigate(['/tabs']);
      });

    } catch (error: any) {
      console.error("❌ Login Error:", error);
  
      let errorMessage = "Login failed. Please check your credentials and try again.";
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "Invalid email format. Please enter a valid email.";
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = "Incorrect email or password. Please try again.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
      }
      this.authService.login(this.email, this.password, this.rememberMe).then(() => {
        console.log("✅ Login successful!");
        this.router.navigate(['/dashboard']); // Ensure navigation
      }).catch(error => {
        console.error("❌ Login failed:", error);
      });
      
      // ✅ Force update the UI using NgZone
      this.zone.run(() => {
        this.errorMessage = errorMessage;
      });
    }
  }

  /** ✅ Trigger Password Reset */
  resetPassword() {
    if (!this.email) {
      this.errorMessage = 'Please enter your email to reset your password.';
      return;
    }

    this.authService.resetPassword(this.email)
      .then(() => {
        this.successMessage = '📩 Reset email sent! Check your inbox.';
        this.errorMessage = ''; // Clear error if successful
      })
      .catch(error => {
        this.errorMessage = '❌ Error sending reset email. Please try again.';
        console.error(error);
      });
  }
}