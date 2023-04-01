import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PotPlan } from '@benwainwright/budget-domain';
import { BudgetService } from '../services/budget.service';

interface Adjustment {
  pot: PotPlan;
  complete: boolean;
  started: boolean;
}

export interface BalancePotsDialogData {
  withdrawals: PotPlan[];
  deposits: PotPlan[];
}

@Component({
  selector: 'benwainwright-balance-pots-dialog',
  templateUrl: './balance-pots-dialog.component.html',
  styleUrls: ['./balance-pots-dialog.component.css'],
})
export class BalancePotsDialogComponent {
  public complete = false;
  public tableColumns: string[] = ['pot', 'amount', 'complete'];
  public adjustments: Adjustment[];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BalancePotsDialogData,
    public dialogRef: MatDialogRef<BalancePotsDialogData>,
    private budgets: BudgetService
  ) {
    this.adjustments = [...this.data.withdrawals, ...this.data.deposits].map(
      (pot) => ({
        pot,
        started: false,
        complete: false,
      })
    );
  }

  async balancePots() {
    const adjustments = [...this.adjustments];
    await adjustments.reduce(async (promise, adjustment, index) => {
      await promise;
      this.adjustments[index].started = true;
      await this.budgets.balancePot(adjustment.pot);
      this.adjustments[index].complete = true;
    }, Promise.resolve());
    this.complete = true;
  }

  close() {
    this.dialogRef.close();
  }
}
