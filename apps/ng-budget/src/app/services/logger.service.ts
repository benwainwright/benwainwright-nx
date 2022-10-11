import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  constructor() {}

  log(message: string) {
    console.log(message);
  }

  debug(message: string) {
    // eslint-disable-next-line no-restricted-syntax
    console.debug(message);
  }
}
