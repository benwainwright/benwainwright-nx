import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConcretePayment } from '@benwainwright/budget-domain';
import { Subscription } from 'rxjs';
import { SelectItem } from '../select/select.component';
import { PotsService } from '../services/pots.service';

export type EditConcretePaymentDialogData = ConcretePayment & {
  new: boolean;
  delete: boolean;
};

@Component({
  selector: 'benwainwright-edit-concrete-payment-dialog',
  templateUrl: './edit-concrete-payment.component.html',
  styleUrls: ['./edit-concrete-payment.component.css'],
})
export class EditConcretePaymentDialogComponent {
  public new: boolean;

  public form: FormGroup;
  public pots: SelectItem[] = [];
  public potsSubscription: Subscription | undefined;

  public constructor(
    public dialogRef: MatDialogRef<EditConcretePaymentDialogComponent>,
    public potsService: PotsService,
    @Inject(MAT_DIALOG_DATA) public data: EditConcretePaymentDialogData
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
      when: new FormControl<Date>(data.when, { nonNullable: true }),
    });

    this.form.valueChanges.subscribe((value) => {
      this.data.amount = Number(value.amount ?? 0);
      this.data.name = value.name ?? '';
      this.data.when = value.when ?? new Date();
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
