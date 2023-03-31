export interface BackendConfig {
  region: string;
  userpoolId: string;
  userPoolClientId: string;
  apiUrl: string;
  authSignInUrl: string;
  authSignOutUrl: string;
  authSignInUrlForLocal: string;
  authSignOutUrlForLocal: string;
  domainName: string;
  authSignUpUrlForLocal: string;
  authSignUpUrl: string;
}

export interface MonzoRedirectResponse {
  redirectUrl: string;
}

export interface MonzoDataResponse<T> {
  data: T;
}

export type MonzoResponse<T> = MonzoRedirectResponse | MonzoDataResponse<T>;
