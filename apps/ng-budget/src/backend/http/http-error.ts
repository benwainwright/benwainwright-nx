import { HTTP } from '@benwainwright/constants';

export class HttpError extends Error {
  public constructor(
    public readonly statusCode: typeof HTTP.statusCodes[keyof typeof HTTP.statusCodes],
    message: string
  ) {
    super(message);
  }
}
