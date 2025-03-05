import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User | null = null;
  userRole: string | null = null;

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      if (user) {
        await this.loadUserRole(user.uid);
      } else {
        this.userRole = null;
      }
    });
  }

  async saveUserToFirestore(user: User) {
    if (!user) return;

    const userRef = doc(this.firestore, `users/${user.uid}`);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        role: "viewer",  // Default role
        createdAt: new Date(),
        lastLogin: new Date()
      });
    } else {
      await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
    }
  }

  /** ✅ Login Function */
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.currentUser = userCredential.user;
      await this.loadUserRole(this.currentUser.uid);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('❌ Login failed:', error);
    }
  }

  /** ✅ Load User Role from Firestore */
  async loadUserRole(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      this.userRole = userSnap.data()['role'];
    } else {
      console.warn('⚠️ User role not found in Firestore');
    }
  }

  /** ✅ Logout */
  async logout() {
    await signOut(this.auth);
    this.currentUser = null;
    this.userRole = null;
    this.router.navigate(['/login']);
  }

  /** ✅ Get Current Role */
  getRole(): string | null {
    return this.userRole;
  }
}
