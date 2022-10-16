import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Pot } from '@benwainwright/budget-domain';

export type PotDialogData = Pot & { new: boolean; delete: boolean };

@Component({
  selector: 'benwainwright-pot-dialog',
  templateUrl: './pot-dialog.component.html',
  styleUrls: ['./pot-dialog.component.css'],
})
export class PotDialogComponent {
  public form: FormGroup;

  public new: boolean;

  constructor(
    public dialogRef: MatDialogRef<PotDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PotDialogData
  ) {
    this.new = data.new;

    this.form = new FormGroup({
      name: new FormControl<string>(data.name ?? '', { nonNullable: true }),
      balance: new FormControl<number>(data.balance ?? 0, {
        nonNullable: true,
      }),
    });

    this.form.valueChanges.subscribe((value) => {
      this.data.name = value.name ?? '';
      this.data.balance = value.balance ?? 0;
    });
  }

  onSaveClick(event: Event): void {
    this.dialogRef.close();
    event.preventDefault();
  }

  onDeleteClick(event: Event): void {
    this.dialogRef.close({ ...this.data, delete: true });
    event.preventDefault();
  }
}
