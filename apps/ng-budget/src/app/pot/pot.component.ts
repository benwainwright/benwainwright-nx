import { Component, Input, OnInit } from '@angular/core';
import { PotPlan } from '@benwainwright/budget-domain';

@Component({
  selector: 'benwainwright-pot',
  templateUrl: './pot.component.html',
  styleUrls: ['./pot.component.css'],
})
export class PotComponent implements OnInit {
  @Input()
  public pot: PotPlan | undefined;

  public tableColumns: string[] = ['name', 'when', 'amount'];

  constructor() {}

  ngOnInit(): void {}
}
