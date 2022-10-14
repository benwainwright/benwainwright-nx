import { ErrorHandler, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: unknown): void {
    if (typeof error === 'string') {
      this.snackBar.open(`Error: ${error}`);
    } else if (error instanceof Error) {
      this.snackBar.open(`Error: ${error.message}`);
      console.log(error);
    }
  }
}
