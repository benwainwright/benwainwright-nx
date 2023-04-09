import { Injectable } from '@angular/core';
import { filter, BehaviorSubject, map } from 'rxjs';
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

  public constructor(
    private configService: AppConfigService,
    private logger: LoggerService
  ) {
    this.configService
      .getConfig()
      .pipe(map(this.saveConfig.bind(this)))
      .subscribe(async () => {
        await this.loadUserFromUrlCredentials(window.location.href);
        await this.updateSavedUser();
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
      map((loaded) => {
        const currentUser = this.user.value;

        return currentUser;
      })
    );
  }

  private async getLatestValidSession() {
    if (!this.auth) {
      return;
    }
    const { auth } = this;
    const session = auth.getSignInUserSession();
    const { exp: expires } = session.getIdToken().decodePayload() as {
      exp: number;
    };
    const now = Math.floor(Date.now() / 1000);

    if (now < expires) {
      return session;
    }

    try {
      auth.refreshSession(session.getRefreshToken().getToken());
      const refreshPromise = new Promise((accept, reject) => {
        auth.userhandler = {
          onSuccess: accept,
          onFailure: reject,
        };
      });

      await refreshPromise;
      return auth.getSignInUserSession();
    } catch (error) {
      return;
    } finally {
      if (auth) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        auth.userhandler = { onSuccess: () => {}, onFailure: () => {} };
      }
    }
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

  private async updateSavedUser() {
    const auth = this.auth;
    this.logger.debug(`No auth found`);
    if (!auth) {
      return;
    }
    this.logger.debug(`Auth found`);
    const session = await this.getLatestValidSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenPayload = session?.getIdToken().decodePayload() as any;

    const username = auth.getUsername();

    if (!username) {
      this.logger.debug(`No user to save`);
      return;
    } else {
      this.logger.debug(`Found user`);
    }
    if (session) {
      const user = {
        username,
        session,
        groups: tokenPayload['cognito:groups'],
      };

      this.user.next(user);
    }
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
      this.auth.userhandler = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onSuccess: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onFailure: () => {},
      };
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
