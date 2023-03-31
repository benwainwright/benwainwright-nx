import { HTTP } from '@benwainwright/constants';
import { MonzoAPI, MonzoOAuthAPI } from '@otters/monzo';
import { HttpError } from '../http/http-error';

const getInitialClient = async (
  oauth: MonzoOAuthAPI,
  client: MonzoAPI,
  refreshToken?: string,
  code?: string
) => {
  try {
    return code && !refreshToken
      ? await oauth.exchangeAuthorizationCode(code ?? '')
      : client;
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      console.log(error);
      throw new HttpError(
        HTTP.statusCodes.Forbidden,
        'Please authorise budget-app via Monzo app'
      );
    } else {
      throw error;
    }
  }
};

export const getInitialApi = async (
  oauth: MonzoOAuthAPI,
  client: MonzoAPI,
  refreshToken?: string,
  code?: string
) => {
  const api = await getInitialClient(oauth, client, refreshToken, code);
  try {
    const credentials = await api.refresh();
    const newClient = new MonzoAPI(credentials, oauth.credentials);
    return {
      credentials,
      api: newClient,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      return {
        credentials: api.credentials,
        api,
      };
    } else {
      throw error;
    }
  }
};
