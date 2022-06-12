import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'benwainwright-create-payment-dialog',
  templateUrl: './create-payment-dialog.component.html',
  styleUrls: ['./create-payment-dialog.component.css'],
})
export class CreatePaymentDialogComponent {
  public form = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    amount: new FormControl<number>(0, { nonNullable: true }),
    when: new FormControl<string>('', { nonNullable: true }),
  });
}
