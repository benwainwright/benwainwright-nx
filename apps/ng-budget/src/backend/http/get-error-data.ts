import { isAxiosError } from 'axios';

export const getErrorData = (error: Error | unknown) => {
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
