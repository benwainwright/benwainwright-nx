import { Component, Input, OnInit } from '@angular/core';
import { PotPlan } from '@benwainwright/budget-domain';

@Component({
  selector: 'benwainwright-pot',
  templateUrl: './pot.component.html',
  styleUrls: ['./pot.component.css'],
})
export class PotComponent {
  @Input()
  public pot: PotPlan | undefined;

  @Input()
  public isFuture: boolean | undefined;

  public constructor() {}

  public tableColumns: string[] = ['name', 'when', 'amount'];

  public get backgroundClass(): string {
    if (this.isFuture) {
      return '';
    }

    if ((this.pot?.adjustmentAmount ?? 0) > 0) {
      return 'pot-deficit';
    }

    if ((this.pot?.adjustmentAmount ?? 0) < 0) {
      return 'pot-surplus';
    }

    return '';
  }

  public get allocated(): number {
    return (this.pot?.adjustmentAmount ?? 0) + (this.pot?.balance ?? 0);
  }
}
