import { verifyJwtToken } from '@benwainwright/jwt-verify';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { HEADER_NAMES } from '../http/headers';

import { HttpError } from '../http/http-error';
import { STATUS_CODES } from '../http/status-codes';

interface AuthoriseResponse {
  username: string;
  groups: ReadonlyArray<string>;
  firstName: string;
  surname: string;
}

export const authoriseJwt = async (
  event: APIGatewayProxyEventV2,
  groups?: string[]
): Promise<AuthoriseResponse> => {
  const authHeader =
    event.headers &&
    Object.entries(event.headers).find(
      (pair) => pair[0].toLowerCase() === 'authorization'
    )?.[1];

  if (!authHeader) {
    throw new HttpError(
      STATUS_CODES.Forbidden,
      "Request didn't contain an authorization header"
    );
  }

  const verifyResult = await verifyJwtToken({
    token: authHeader,
    authorisedGroups: groups,
  });

  if (!verifyResult.isValid) {
    throw new HttpError(
      STATUS_CODES.Forbidden,
      `Token validation failed: ${verifyResult.error?.message}`
    );
  }

  return {
    username: verifyResult.userName,
    groups: verifyResult.groups,
    firstName: verifyResult.firstName,
    surname: verifyResult.surname,
  };
};

const decodeBasicAuth = (authHeaderValue: string) => {
  const base64Encoded = authHeaderValue.split(' ')[1];
  const parts = Buffer.from(base64Encoded, 'base64')
    .toString('utf8')
    .split(':');

  const username = parts[0];
  const [, ...passwordParts] = parts;

  return {
    username,
    password: passwordParts.join(''),
  };
};

export const authoriseBasic = (
  event: APIGatewayProxyEventV2,
  username: string,
  password: string
) => {
  const credentials = decodeBasicAuth(
    event.headers[HEADER_NAMES.Authorization] ?? ''
  );

  if (credentials.username !== username || credentials.password !== password) {
    throw new HttpError(STATUS_CODES.Forbidden, `Basic authentication failed`);
  }
};
