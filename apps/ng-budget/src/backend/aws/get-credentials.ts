import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { COGNITO } from '@benwainwright/constants';
import { getEnv } from '../utils/get-env';
import { getAttributeValue } from './get-attribute-value';

export const getCredentials = async (username: string) => {
  const userPoolId = getEnv('USER_POOL_ID');

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
    COGNITO.customFields.accessToken
  );
  const refreshToken = getAttributeValue(
    attributes,
    COGNITO.customFields.refreshToken
  );

  return { accessToken, refreshToken };
};
