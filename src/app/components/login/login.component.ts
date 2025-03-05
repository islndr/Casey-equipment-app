import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
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
    CommonModule
  ],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  
  

  constructor(private auth: Auth, private firestore: Firestore, private router: Router, private zone: NgZone) {}

  async login() {
    this.errorMessage = ''; // Clear previous errors
  
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      const userId = userCredential.user.uid;
      
      const userRef = doc(this.firestore, `users/${userId}`);
      const userDoc = await getDoc(userRef);
  
      if (!userDoc.exists()) {
        throw new Error("User not found.");
      }
  
      const userData = userDoc.data();
      const role = userData?.['role'] || 'user';
  
      this.router.navigate([role === 'admin' ? '/admin' : '/tabs']);
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
  
      // ✅ Force update the UI using NgZone
      this.zone.run(() => {
        this.errorMessage = errorMessage;
      });
    }
  }}
