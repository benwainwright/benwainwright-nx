import { HTTP } from '@benwainwright/constants';
import { isAxiosError } from 'axios';
import { HttpError } from './http-error';

export const getErrorStatusCode = (error: Error | unknown) => {
  if (error instanceof HttpError) {
    return error.statusCode;
  }

  if (isAxiosError(error)) {
    return error.response?.status;
  }

  return HTTP.statusCodes.InternalServerError;
};
