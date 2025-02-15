import { Injectable, inject, NgZone } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, User, onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private ngZone = inject(NgZone);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.ngZone.run(() => {
        this.userSubject.next(user);
      });
    });
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<User | null> {
    try {
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await this.ngZone.run(() => setPersistence(this.auth, persistenceType));
      const userCredential = await this.ngZone.run(() => signInWithEmailAndPassword(this.auth, email, password));
      this.userSubject.next(userCredential.user);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async register(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await this.ngZone.run(() => createUserWithEmailAndPassword(this.auth, email, password));
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.ngZone.run(() => signOut(this.auth));
      this.userSubject.next(null);
    } catch (error) {
      throw error;
    }
  }

  getAuthState(): Observable<User | null> {
    return this.user$;
  }

  isAuthenticated(): Observable<boolean> {
    return new Observable(observer => {
      this.user$.subscribe(user => observer.next(!!user));
    });
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }
}









