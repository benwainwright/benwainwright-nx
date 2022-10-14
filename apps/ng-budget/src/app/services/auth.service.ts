import { Injectable } from '@angular/core';
import { filter, BehaviorSubject, Observable, map, mergeMap } from 'rxjs';
import { BackendConfig } from '@benwainwright/types';
import { AppConfigService } from './app-config.service';
import { CognitoAuth, CognitoAuthSession } from 'amazon-cognito-auth-js';
import { LoggerService } from './logger.service';
import { environment } from '../../environments/environment';

export interface User {
  username: string;
  session: CognitoAuthSession;
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
      map((config) =>
        environment.production
          ? config?.authSignInUrl
          : config?.authSignInUrlForLocal
      )
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

  public logout() {
    this.auth?.signOut();
    if (!this.config) {
      return;
    }

    window.location.href = environment.production
      ? this.config.authSignOutUrl
      : this.config.authSignOutUrlForLocal;
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

    const session = auth.getSignInUserSession();
    const tokenPayload = session.getIdToken().decodePayload() as any;
    const user = { username, session, groups: tokenPayload['cognito:groups'] };
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

  private saveConfig(config: BackendConfig | undefined) {
    this.logger.debug(JSON.stringify(config, null, 2));
    if (!this.auth && config) {
      this.config = config;
      const protocal = !environment.production ? 'http' : 'https';
      const authData = {
        UserPoolId: config.userpoolId,
        ClientId: config.userPoolClientId,
        RedirectUriSignIn: `${protocal}://${config.domainName}/`,
        RedirectUriSignOut: `${protocal}://${config.domainName}/`,
        AppWebDomain: config.domainName,
        TokenScopesArray: ['email'],
        Region: config.region,
      };
      this.auth = new CognitoAuth(authData);
    }

    return config;
  }

  private async loadUserFromUrlCredentials(url: string) {
    if (url.indexOf('id_token') !== -1) {
      // eslint-disable-next-line no-restricted-syntax
      this.logger.debug(`Parsing token`);
      await this.parseUrl(url);
    }
  }

  private loaded() {
    return this.loadedSubject.pipe(
      map((thing) => {
        return thing;
      }),
      filter((value) => value)
    );
  }
}
