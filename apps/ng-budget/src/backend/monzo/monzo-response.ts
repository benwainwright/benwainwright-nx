import { MonzoAPI } from '@otters/monzo';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { authorise } from '../monzo/authorise';
import { returnErrorResponse } from '../http/return-error-response';
import { returnOkResponse } from '../http/return-ok-response';
import { isAxiosError } from 'axios';
import { MONZO } from '@benwainwright/constants';

type HandlerCallback<T> = (
  event: APIGatewayProxyEventV2,
  client: MonzoAPI
) => Promise<T>;

export const monzoResponse = async <T>(
  event: APIGatewayProxyEventV2,
  callback: HandlerCallback<T>
) => {
  try {
    const authResult = await authorise(event);
    if (!authResult.complete) {
      return authResult.response;
    }
    const { client } = authResult;
    return returnOkResponse(event, { data: await callback(event, client) });
  } catch (error) {
    const hasExpired =
      isAxiosError(error) &&
      error.response?.data.code === MONZO.errorCodes.expiredAccessToken;

    if (hasExpired) {
      try {
        const refreshAuthResult = await authorise(event, true);
        if (!refreshAuthResult.complete) {
          return refreshAuthResult.response;
        }
        const { client: refreshedClient } = refreshAuthResult;
        return returnOkResponse(event, {
          data: await callback(event, refreshedClient),
        });
      } catch (error) {
        return returnErrorResponse(event, error);
      }
    }
    return returnErrorResponse(event, error);
  }
};
