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
