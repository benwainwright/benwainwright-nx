import { Injectable } from '@angular/core';
import {
  filter,
  BehaviorSubject,
  Observable,
  switchMap,
  map,
  mergeMap,
} from 'rxjs';
import { BackendConfig } from '@benwainwright/types';
import { AppConfigService } from './app-config.service';
import { CognitoAuth } from 'amazon-cognito-auth-js';
import { LoggerService } from './logger.service';

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

  constructor(
    private configService: AppConfigService,
    private logger: LoggerService
  ) {
    this.configService
      .getConfig()
      .pipe(map(this.saveConfig.bind(this)))
      .subscribe(async () => {
        await this.loadUserFromUrlCredentials(window.location.href);
        this.saveUser();
        this.logger.debug(`User saved`);
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
    return this.loaded().pipe(
      mergeMap(() => {
        this.logger.debug(`Loaded`);
        return this.user;
      })
    );
  }

  private saveConfig(config: BackendConfig | undefined) {
    this.logger.debug(JSON.stringify(config));
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

  public logout() {
    this.auth?.signOut();
    this.redirectIfLoggedOut();
  }

  private saveUser() {
    const auth = this.auth;
    this.logger.debug(`No auth found`);
    if (!auth) {
      return;
    }
    this.logger.debug(`Auth found`);
    const username = auth.getUsername();
    if (!username) {
      this.logger.debug(`No user to save`);
      return;
    } else {
      this.logger.debug(`Found user`);
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
      // eslint-disable-next-line no-restricted-syntax
      console.debug(`Parsing token`);
      await this.parseUrl(url);
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
