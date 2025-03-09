import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root' // ✅ Ensures Angular can inject this service
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // ✅ Check stored session if Firebase auth is null
    if (!this.authService.currentUser) {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser) {
        this.authService.currentUser = JSON.parse(storedUser);
        console.log('✅ User session restored by Auth Guard');
      }
    }
  
    if (this.authService.currentUser) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}