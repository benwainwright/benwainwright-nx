import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
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

    const response = await client.accounts('uk_retail');

    return returnOkResponse({ data: response });
  } catch (error) {
    return returnErrorResponse(error);
  }
};
