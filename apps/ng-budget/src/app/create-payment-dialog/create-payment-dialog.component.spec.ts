import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { bootstrapComponent } from '../../testing-utils/bootstrap-component';
import {
  CreatePaymentDialogComponent,
  PaymentDialogData,
} from './create-payment-dialog.component';

class MockDialogRef {
  close() {
    // NOOP
  }
}

describe('CreatePaymentDialogComponent', () => {
  it('should create', () => {
    const mockData: PaymentDialogData = {
      name: 'foo',
      amount: 0,
      when: 'foo',
    };
    const component = bootstrapComponent(CreatePaymentDialogComponent, [
      { provide: MatDialogRef, useClass: MockDialogRef },
      { provide: MAT_DIALOG_DATA, useValue: mockData },
    ]);
    expect(component).toBeTruthy();
  });
});
