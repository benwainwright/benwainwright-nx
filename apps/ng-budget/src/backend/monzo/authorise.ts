import { HTTP } from '@benwainwright/constants';
import { verifyJwtToken } from '@benwainwright/jwt-verify';
import { MonzoAPI } from '@otters/monzo';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpError } from '../http/http-error';
import { returnOkResponse } from '../http/return-ok-response';
import { getClient } from './get-client';

type AuthResponse =
  | {
      client: MonzoAPI;
      complete: true;
    }
  | {
      complete: false;
      response: APIGatewayProxyResultV2;
    };

export const authorise = async (
  event: APIGatewayProxyEventV2
): Promise<AuthResponse> => {
  const token = Object.entries(event.headers).find(
    ([key]) => key.toLocaleLowerCase() === 'authorization'
  )?.[1];

  if (!token) {
    throw new HttpError(403, 'Please supply token');
  }

  console.log({ token });

  const { isValid, error, userName } = await verifyJwtToken({ token });

  if (!isValid) {
    throw new HttpError(HTTP.statusCodes.Forbidden, error?.message ?? '');
  }

  const code = event.queryStringParameters?.['code'];

  const client = await getClient(userName, code);

  if ('redirectUrl' in client) {
    return {
      complete: false,
      response: returnOkResponse({ redirectUrl: client.redirectUrl }),
    };
  }
  return { complete: true, client };
};
