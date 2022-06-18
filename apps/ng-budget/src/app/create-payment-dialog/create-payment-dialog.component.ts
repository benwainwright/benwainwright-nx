import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface PaymentDialogData {
  name: string;
  amount: number;
  when: string;
}

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

  public constructor(
    public dialogRef: MatDialogRef<CreatePaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData
  ) {
    this.form.valueChanges.subscribe((value) => {
      this.data.amount = value.amount ?? 0;
      this.data.name = value.name ?? '';
      this.data.when = value.when ?? '';
    });
  }

  onSaveClick(): void {
    this.dialogRef.close();
  }
}
