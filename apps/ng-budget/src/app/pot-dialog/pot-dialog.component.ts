import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface PotDialogData {
  name: string;
  balance: number;
}

@Component({
  selector: 'benwainwright-pot-dialog',
  templateUrl: './pot-dialog.component.html',
  styleUrls: ['./pot-dialog.component.css'],
})
export class PotDialogComponent {

  public form = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    balance: new FormControl<number>(0, { nonNullable: true }),
  });

  constructor(
    public dialogRef: MatDialogRef<PotDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PotDialogData
  ) {
    this.form.valueChanges.subscribe((value) => {
      this.data.name = value.name ?? '';
      this.data.balance = value.balance ?? 0;
    });
  }

  onSaveClick(): void {
    this.dialogRef.close();
  }
}
