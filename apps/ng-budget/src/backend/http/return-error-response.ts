import { HTTP } from '@benwainwright/constants';
import { allowHeaders } from './allow-headers';
import { HttpError } from './http-error';
import { isAxiosError } from 'axios';

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

const getStatusCode = (error: Error | unknown) => {
  if (error instanceof HttpError) {
    return error.statusCode;
  }

  if (isAxiosError(error)) {
    return error.response?.status;
  }

  return HTTP.statusCodes.InternalServerError;
};

const getData = (error: Error | unknown) => {
  if (isAxiosError(error)) {
    return {
      message: error.response?.data.message,
      code: error.response?.data.code,
      params: error.response?.data.params,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return {};
};

export const returnErrorResponse = (error?: Error | unknown) => {
  const stack = buildStack(error);
  const statusCode = getStatusCode(error);
  console.log(error);
  const errorObj = getData(error);

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
