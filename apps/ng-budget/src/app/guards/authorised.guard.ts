import { Injectable } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { of, iif, map, Observable, switchMap } from 'rxjs';
import { AuthService, User } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthorisedGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.getUser().pipe(
      map((user) => {
        return Boolean(user);
      }),
      switchMap((loggedIn) =>
        iif(
          () => loggedIn,
          of(true),
          this.authService.redirectUrl().pipe(
            map((url) => {
              window.location.href = url ?? '';
              return false;
            })
          )
        )
      )
    );
  }
}
