import { HTTP } from '@benwainwright/constants';
import { verifyJwtToken } from '@benwainwright/jwt-verify';
import { MonzoAPI } from '@otters/monzo';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getHeader } from '../get-header';
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
  event: APIGatewayProxyEventV2,
  refresh?: boolean
): Promise<AuthResponse> => {
  console.log(event);
  const token = getHeader(HTTP.headerNames.Authorization, event);

  if (!token) {
    throw new HttpError(HTTP.statusCodes.Forbidden, 'Please supply token');
  }

  console.log({ token });

  const { isValid, error, userName } = await verifyJwtToken({ token });

  if (!isValid) {
    throw new HttpError(HTTP.statusCodes.Forbidden, error?.message ?? '');
  }

  const code = event.queryStringParameters?.['code'];

  const client = await getClient(userName, code, refresh);

  if ('redirectUrl' in client) {
    return {
      complete: false,
      response: returnOkResponse(event, { redirectUrl: client.redirectUrl }),
    };
  }
  return { complete: true, client };
};
