import { HTTP } from '@benwainwright/constants';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { getHeader } from '../get-header';
import { allowHeaders } from './allow-headers';

export const getDefaultHttpResponse = (event: APIGatewayProxyEventV2) => {
  const origin = getHeader(HTTP.headerNames.Origin, event);
  return {
    headers: {
      [HTTP.headerNames.AccessControlAllowOrigin]:
        origin ?? `https://quick-budget.co.uk`,
      [HTTP.headerNames.AccessControlAllowCredentials]: `true`,
      [HTTP.headerNames.AccessControlAllowHeaders]: allowHeaders.join(', '),
    },
  };
};
