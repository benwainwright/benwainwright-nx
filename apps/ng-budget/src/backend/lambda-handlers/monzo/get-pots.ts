import { HTTP } from '@benwainwright/constants';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { HttpError } from '../../http/http-error';
import { monzoResponse } from '../../monzo/monzo-response';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  return monzoResponse(event, async (event, client) => {
    const accountId = event?.pathParameters?.['accountId'];

    if (!accountId) {
      throw new HttpError(
        HTTP.statusCodes.BadRequest,
        'Please supply an account ID'
      );
    }

    const response = await client.pots(accountId as `acc_${string}`);

    return response.filter((pot) => !pot.deleted);
  });
};
