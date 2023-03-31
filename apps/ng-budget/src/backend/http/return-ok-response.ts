import { HTTP } from '@benwainwright/constants';
import { allowHeaders } from './allow-headers';

export const returnOkResponse = <T>(body: T) => {
  return {
    statusCode: HTTP.statusCodes.Ok,
    body: JSON.stringify(body),
    headers: {
      [HTTP.headerNames.AccessControlAllowOrigin]: `http://localhost:4200`,
      [HTTP.headerNames.AccessControlAllowCredentials]: `true`,
      [HTTP.headerNames.AccessControlAllowHeaders]: allowHeaders.join(', '),
    },
  };
};
