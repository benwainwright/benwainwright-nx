import {
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminUpdateUserAttributesCommandInput,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { COGNITO } from '@benwainwright/constants';
import { MonzoAPI, MonzoOAuthAPI } from '@otters/monzo';
import { getAttributeValue } from '../aws/get-attribute-value';
import { getSecrets } from '../aws/get-secret';
import { getEnv } from '../utils/get-env';
import { getInitialApi } from './get-initial-api';

export const getClient = async (
  username: string,
  code?: string,
  refresh?: boolean
) => {
  const userPoolId = getEnv('USER_POOL_ID');

  const clientIdSecretName = getEnv('MONZO_CLIENT_ID_SECRET');
  const clientSecretSecretName = getEnv('MONZO_CLIENT_SECRET_SECRET');
  const redirectUriSecretName = getEnv('MONZO_REDIRECT_URI_SECRET');

  const [clientId, clientSecret, redirectUri] = await getSecrets(
    clientIdSecretName,
    clientSecretSecretName,
    redirectUriSecretName
  );

  const oauth = new MonzoOAuthAPI({
    client_id: clientId as `oauth2client_${string}`,
    client_secret: String(clientSecret),
    redirect_uri: String(redirectUri),
  });

  const cognito = new CognitoIdentityProviderClient({
    region: getEnv('AWS_REGION'),
  });

  const userResult = await cognito.send(
    new AdminGetUserCommand({
      UserPoolId: userPoolId,
      Username: username,
    })
  );

  const attributes = userResult.UserAttributes;

  const accessToken = getAttributeValue(
    attributes,
    `custom:${COGNITO.customFields.accessToken}`
  );

  const refreshToken = getAttributeValue(
    attributes,
    `custom:${COGNITO.customFields.refreshToken}`
  );

  const expiresIn = getAttributeValue(
    attributes,
    `custom:${COGNITO.customFields.expiresIn}`
  );

  const expiresAt = getAttributeValue(
    attributes,
    `custom:${COGNITO.customFields.expiresAt}`
  );

  const userId = getAttributeValue(
    attributes,
    `custom:${COGNITO.customFields.userId}`
  ) as `user_${string}`;

  const expires = expiresAt ? Number(expiresAt) : 0;

  const client = new MonzoAPI(
    {
      access_token: accessToken ?? '',
      client_id: oauth.credentials.client_id,
      refresh_token: refreshToken ?? '',
      token_type: 'Bearer',
      user_id: userId,
      expires_in: expiresIn ? Number(expiresIn) : 0,
    },
    oauth.credentials
  );

  if (typeof expiresAt === 'string' && Date.now() < expires) {
    return client;
  }

  if (
    code ||
    (typeof expiresAt === 'string' && Date.now() > expires) ||
    (accessToken && !refreshToken) ||
    refresh
  ) {
    const { credentials, api } = await getInitialApi(
      oauth,
      client,
      refreshToken,
      code
    );

    const userPoolId = getEnv('USER_POOL_ID');
    const input: AdminUpdateUserAttributesCommandInput = {
      UserPoolId: userPoolId,
      Username: username,
      UserAttributes: [
        {
          Name: `custom:${COGNITO.customFields.expiresIn}`,
          Value: String(credentials.expires_in),
        },
        {
          Name: `custom:${COGNITO.customFields.refreshToken}`,
          Value: credentials.refresh_token ?? '',
        },
        {
          Name: `custom:${COGNITO.customFields.accessToken}`,
          Value: credentials.access_token ?? '',
        },
        {
          Name: `custom:${COGNITO.customFields.userId}`,
          Value: credentials.user_id ?? '',
        },
        {
          Name: `custom:${COGNITO.customFields.expiresAt}`,
          Value: String(credentials.expires_in * 1000 + Date.now()),
        },
      ],
    };

    const cognito = new CognitoIdentityProviderClient({});
    await cognito.send(new AdminUpdateUserAttributesCommand(input));
    return api;
  }

  const { state, url } = oauth.getOAuthURL();

  return {
    redirectState: state,
    redirectUrl: url,
  };
};
