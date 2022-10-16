import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Pot, RecurringPayment } from '@benwainwright/budget-domain';
import { Subscription } from 'rxjs';
import { SelectItem } from '../select/select.component';
import { PotsService } from '../services/pots.service';

export type PaymentDialogData = RecurringPayment & {
  new: boolean;
  delete: boolean;
};

@Component({
  selector: 'benwainwright-create-payment-dialog',
  templateUrl: './create-payment-dialog.component.html',
  styleUrls: ['./create-payment-dialog.component.css'],
})
export class CreatePaymentDialogComponent {
  public new: boolean;

  public form: FormGroup;
  public pots: SelectItem[] = [];
  public potsSubscription: Subscription | undefined;

  public constructor(
    public dialogRef: MatDialogRef<CreatePaymentDialogComponent>,
    public potsService: PotsService,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData
  ) {
    this.potsSubscription = this.potsService
      .getPots()
      .subscribe(
        (pots) =>
          (this.pots = pots.map((pot) => ({ value: pot.id, label: pot.name })))
      );

    this.new = data.new;

    this.form = new FormGroup({
      name: new FormControl<string>(data.name, { nonNullable: true }),
      amount: new FormControl<number>(data.amount, { nonNullable: true }),
      when: new FormControl<string>(data.when, { nonNullable: true }),
      potId: new FormControl<string>(data.potId, { nonNullable: true }),
    });

    this.form.valueChanges.subscribe((value) => {
      this.data.amount = value.amount ?? 0;
      this.data.name = value.name ?? '';
      this.data.when = value.when ?? '';
      this.data.potId = value.potId ?? '';
    });
  }

  onCancelClick(event: Event): void {
    this.dialogRef.close();
    event?.preventDefault();
  }

  onDeleteClick(event: Event): void {
    this.dialogRef.close({ ...this.data, delete: true });
    event.preventDefault();
  }
}
