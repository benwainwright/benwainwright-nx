import { HTTP } from '@benwainwright/constants';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { getDefaultHttpResponse } from './get-default-http-response';

export const returnOkResponse = <T>(event: APIGatewayProxyEventV2, body: T) => {
  return {
    statusCode: HTTP.statusCodes.Ok,
    body: JSON.stringify(body),
    ...getDefaultHttpResponse(event),
  };
};
