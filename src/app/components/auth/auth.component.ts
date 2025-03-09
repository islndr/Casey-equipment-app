import { Component } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, User } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc as firestoreSetDoc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
  export class AuthComponent {
    constructor(private auth: Auth, private authService: AuthService, private firestore: Firestore) {}

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
  /** ✅ Save User to Firestore (Ensures Users Exist in Database) */
async saveUserToFirestore(user: User) {
  if (!user) return;

  const userRef = doc(this.firestore, `users/${user.uid}`);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.log(`🆕 Adding new user: ${user.email} to Firestore as "editor"`);
    await this.setDoc(userRef, {
      email: user.email,
      role: "editor",  // Default role
      createdAt: new Date(),
      lastLogin: new Date()
    });
  } else {
    await this.setDoc(userRef, { lastLogin: new Date() }, { merge: true });
  }
}

  logout() {
    signOut(this.auth);
  }

  async setDoc(userRef: any, data: {
    email?: any; role?: string; // Default role
    createdAt?: Date; lastLogin?: Date;
  }, options?: { merge: boolean }) {
    try {
      await firestoreSetDoc(userRef, data, options || {});
    } catch (error) {
      console.error("❌ Firestore setDoc Error:", error);
    }
  }
}
