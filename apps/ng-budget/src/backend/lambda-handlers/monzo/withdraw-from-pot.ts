import { HTTP } from '@benwainwright/constants';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { HttpError } from '../../http/http-error';
import { returnErrorResponse } from '../../http/return-error-response';
import { returnOkResponse } from '../../http/return-ok-response';
import { authorise } from '../../monzo/authorise';

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    const authResult = await authorise(event);
    if (!authResult.complete) {
      return authResult.response;
    }

    const { client } = authResult;

    const potId = event?.pathParameters?.['potId'];

    const body = JSON.parse(event.body ?? '{}');

    const { destination, amount } = body;

    if (!potId) {
      throw new HttpError(
        HTTP.statusCodes.BadRequest,
        'Please supply a pot id'
      );
    }

    const response = await client.withdrawFromPot(potId as `pot_${string}`, {
      amount,
      destination_account_id: destination as `acc_${string}`,
      dedupe_id: context.awsRequestId,
    });

    return returnOkResponse({ data: response });
  } catch (error) {
    return returnErrorResponse(error);
  }
};
