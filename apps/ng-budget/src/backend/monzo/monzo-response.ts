import { MonzoAPI } from '@otters/monzo';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { authorise } from '../monzo/authorise';
import { returnErrorResponse } from '../http/return-error-response';
import { returnOkResponse } from '../http/return-ok-response';

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
    return returnErrorResponse(event, error);
  }
};
