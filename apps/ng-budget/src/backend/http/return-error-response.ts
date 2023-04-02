import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { getErrorStatusCode } from './get-error-status-code';
import { getErrorData } from './get-error-data';
import { buildErrorStack } from './build-error-stack';
import { getDefaultHttpResponse } from './get-default-http-response';

export const returnErrorResponse = (
  event: APIGatewayProxyEventV2,
  error?: Error | unknown
) => {
  const stack = buildErrorStack(error);
  const statusCode = getErrorStatusCode(error);
  console.log(error);
  const errorObj = getErrorData(error);

  return {
    body: JSON.stringify({ ...errorObj, ...stack }),
    statusCode,
    ...getDefaultHttpResponse(event),
  };
};
