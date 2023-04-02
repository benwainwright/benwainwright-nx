import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { monzoResponse } from '../../monzo/monzo-response';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  return monzoResponse(event, async (_event, client) => {
    return await client.accounts('uk_retail');
  });
};
