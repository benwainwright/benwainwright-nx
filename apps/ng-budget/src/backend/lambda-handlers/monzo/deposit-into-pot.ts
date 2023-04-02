import { HTTP } from '@benwainwright/constants';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { HttpError } from '../../http/http-error';
import { monzoResponse } from '../../monzo/monzo-response';

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  return monzoResponse(event, async (event, client) => {
    const potId = event?.pathParameters?.['potId'];

    const body = JSON.parse(event.body ?? '{}');

    const { source, amount } = body;

    if (!potId) {
      throw new HttpError(
        HTTP.statusCodes.BadRequest,
        'Please supply a pot id'
      );
    }

    return await client.depositIntoPot(potId as `pot_${string}`, {
      amount,
      source_account_id: source as `acc_${string}`,
      dedupe_id: context.awsRequestId,
    });
  });
};
