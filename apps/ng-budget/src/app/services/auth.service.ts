import { Injectable } from '@angular/core';
import { filter, BehaviorSubject, Observable, switchMap, map } from 'rxjs';
import { BackendConfig } from '@benwainwright/types';
import { AppConfigService } from './app-config.service';
import { CognitoAuth } from 'amazon-cognito-auth-js';

export interface User {
  username: string;
  groups: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private config: BackendConfig | undefined;
  private user = new BehaviorSubject<User | undefined>(undefined);
  private loadedSubject = new BehaviorSubject(false);
  private auth: CognitoAuth | undefined;

  constructor(private configService: AppConfigService) {
    this.configService
      .getConfig()
      .pipe(map(this.saveConfig.bind(this)))
      .subscribe(async () => {
        this.saveUser();
        await this.loadUserFromUrlCredentials(window.location.href);
        this.loadedSubject.next(true);
      });
  }

  public redirectUrl() {
    return this.configService.getConfig().pipe(
      filter((config) => Boolean(config)),
      map((config) => config?.authSignInUrl)
    );
  }

  public getUser() {
    return this.loaded().pipe(switchMap(() => this.user));
  }

  private saveConfig(config: BackendConfig | undefined) {
    if (!this.auth && config) {
      this.config = config;
      const authData = {
        UserPoolId: config.userpoolId,
        ClientId: config.userPoolClientId,
        RedirectUriSignIn: `https://${config.domainName}/`,
        RedirectUriSignOut: `https://${config.domainName}/`,
        AppWebDomain: config.domainName,
        TokenScopesArray: ['email'],
        Region: config.region,
      };
      this.auth = new CognitoAuth(authData);
    }

    return config;
  }

  private saveUser() {
    const auth = this.auth;
    if (!auth) {
      return;
    }
    const username = auth.getUsername();
    if (!username) {
      return;
    }

    const user = { username, groups: [] };
    this.user.next(user);
  }

  private async parseUrl(url: string) {
    const auth = this.auth;
    try {
      if (!auth) {
        return;
      }
      const authPromise = new Promise((accept, reject) => {
        auth.userhandler = {
          onSuccess: accept,
          onFailure: reject,
        };
      });

      auth.parseCognitoWebResponse(url);
      await authPromise;
    } catch (error) {
      return;
    } finally {
      if (auth) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        auth.userhandler = { onSuccess: () => {}, onFailure: () => {} };
      }
    }
  }

  private async loadUserFromUrlCredentials(url: string) {
    if (url.indexOf('id_token') !== -1) {
      await this.parseUrl(url);
      this.saveUser();
    }
  }

  loaded() {
    return this.loadedSubject.pipe(filter((value) => value));
  }

  redirectIfLoggedOut() {
    if (!this.config) {
      return;
    }

    if (!this.user.value) {
      window.location.href = this.config.authSignInUrl;
    }
  }

  getCurrentUser(): Observable<User | undefined> {
    return this.user.asObservable();
  }
}
