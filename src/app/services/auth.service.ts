import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  userRole: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private auth: Auth, private firestore: Firestore) {}

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    this.currentUser.next(userCredential.user);
    this.fetchUserRole(userCredential.user.uid);
  }

  async logout() {
    await signOut(this.auth);
    this.currentUser.next(null);
    this.userRole.next(null);
  }

  private async fetchUserRole(uid: string) {
    const userDoc = doc(this.firestore, `users/${uid}`);
    const userSnap = await getDoc(userDoc);
    if (userSnap.exists()) {
      this.userRole.next(userSnap.data()['role']);
    } else {
      this.userRole.next(null);
    }
  }
}