import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root' // ✅ Ensures Angular can inject this service
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Observable<boolean> {
    return user(this.auth).pipe(
      map(authUser => {
        if (authUser) {
          return true; // ✅ Allow access if logged in
        } else {
          this.router.navigate(['/login']); // 🔹 Redirect to login if not authenticated
          return false;
        }
      })
    );
  }
}