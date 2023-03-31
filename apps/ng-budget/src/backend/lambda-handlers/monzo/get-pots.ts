import { HTTP } from '@benwainwright/constants';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { HttpError } from '../../http/http-error';
import { returnErrorResponse } from '../../http/return-error-response';
import { returnOkResponse } from '../../http/return-ok-response';
import { authorise } from '../../monzo/authorise';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const authResult = await authorise(event);
    if (!authResult.complete) {
      return authResult.response;
    }

    const { client } = authResult;

    const accountId = event?.pathParameters?.['accountId'];

    if (!accountId) {
      throw new HttpError(
        HTTP.statusCodes.BadRequest,
        'Please supply an account ID'
      );
    }

    const response = await client.pots(accountId as `acc_${string}`);

    return returnOkResponse({ data: response.filter((pot) => !pot.deleted) });
  } catch (error) {
    return returnErrorResponse(error);
  }
};
