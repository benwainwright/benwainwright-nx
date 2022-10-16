import { ErrorHandler, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: unknown): void {
    if (typeof error === 'string') {
      this.openSnackBar(`Error: ${error}`);
    } else if (error instanceof Error) {
      this.openSnackBar(`Error: ${error.message}`);
      console.log(error);
    }
  }

  private openSnackBar(message: string) {
    const bar = this.snackBar.open(message, 'Close');
    bar.onAction().subscribe(() => {
      bar.dismiss();
    });

    setInterval(() => {
      bar.dismiss();
    }, 5000);
  }
}
