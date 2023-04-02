import { ENV, ENVIRONMENT_NAMES } from '@benwainwright/constants';

export const buildErrorStack = (error: unknown) => {
  if (error instanceof Error) {
    if (
      process.env[ENV.ENVIRONMENT_NAME] !== ENVIRONMENT_NAMES.prod &&
      error.stack
    ) {
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
