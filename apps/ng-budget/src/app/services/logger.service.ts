import { Inject, Injectable } from '@angular/core';

export const LOGGER_CONTEXT_TOKEN = 'loggerContext';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  constructor() {}

  public log(message: string) {
    console.log(message);
  }

  public debug(message: string) {
    // eslint-disable-next-line no-restricted-syntax
    console.debug(message);
  }
}
