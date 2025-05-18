import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpHeaders } from '@angular/common/http';
import { catchError, map, defaultIfEmpty, first } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): Promise<boolean> {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (!token || !username) {
      this.router.navigate(['/login']);
      return Promise.resolve(false);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.authService
      .isTokenValid(username, headers)
      .pipe(
        first(),
        map(isValid => {
          if (!isValid) {
            this.router.navigate(['/login']);
            return false;
          }
          return true;
        }),
        catchError(() => {
          this.router.navigate(['/login']);
          return of(false);
        }),
      )
      .toPromise() as Promise<boolean>;
  }
}
