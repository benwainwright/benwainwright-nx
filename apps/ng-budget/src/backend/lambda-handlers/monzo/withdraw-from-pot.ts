import { HTTP } from '@benwainwright/constants';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { HttpError } from '../../http/http-error';
import { monzoResponse } from '../../monzo/monzo-response';

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  return monzoResponse(event, async (event, client) => {
    const potId = event?.pathParameters?.['potId'];

    const body = JSON.parse(event.body ?? '{}');

    const { destination, amount } = body;

    if (!potId) {
      throw new HttpError(
        HTTP.statusCodes.BadRequest,
        'Please supply a pot id'
      );
    }
    return await client.withdrawFromPot(potId as `pot_${string}`, {
      amount,
      destination_account_id: destination as `acc_${string}`,
      dedupe_id: context.awsRequestId,
    });
  });
};
