import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private inactivityTimeout: any;

  constructor(private router: Router, private ngZone: NgZone) {
    this.resetTimeout();
    window.addEventListener('mousemove', () => this.resetTimeout());
    window.addEventListener('keydown', () => this.resetTimeout());
  }

  resetTimeout() {
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => {
      this.ngZone.run(() => this.router.navigate(['/auth']));
    }, 5 * 60 * 1000); // 5 minutes
  }
}