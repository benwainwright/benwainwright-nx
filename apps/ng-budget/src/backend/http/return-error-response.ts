import { HTTP } from '@benwainwright/constants';
import { allowHeaders } from './allow-headers';
import { HttpError } from './http-error';

const buildStack = (error: unknown) => {
  if (error instanceof Error) {
    if (process.env['ENVIRONMENT_NAME'] !== 'prod' && error.stack) {
      if (Array.isArray(error.stack)) {
        return { stack: error.stack };
      }
      const [, ...trace] = error.stack.split('\n');
      const stack = trace
        .map((line) => line.trim())
        .map((line) => {
          const [, ...rest] = line.split('at');
          return rest.join('at').trim();
        });
      return { stack: stack };
    }
  }
  return {};
};

export const returnErrorResponse = (error?: Error | unknown) => {
  const stack = buildStack(error);

  const statusCode =
    error instanceof HttpError
      ? error.statusCode
      : HTTP.statusCodes.InternalServerError;

  console.log(error);

  const errorObj =
    error && error instanceof Error ? { error: error.message } : {};

  return {
    body: JSON.stringify({ ...errorObj, ...stack }),
    statusCode,
    headers: {
      [HTTP.headerNames.AccessControlAllowOrigin]: `http://localhost:4200`,
      [HTTP.headerNames.AccessControlAllowCredentials]: `true`,
      [HTTP.headerNames.AccessControlAllowHeaders]: allowHeaders.join(', '),
    },
  };
};
