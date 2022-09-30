import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Pot } from '@benwainwright/budget-domain';
import { Subscription } from 'rxjs';
import { v4 } from "uuid"
import { PotDialogComponent, PotDialogData } from '../pot-dialog/pot-dialog.component';
import { PotsService } from '../services/pots.service';

@Component({
  selector: 'benwainwright-pots',
  templateUrl: './pots.component.html',
  styleUrls: ['./pots.component.css'],
})
export class PotsComponent implements OnInit {

  public potsSubscription: Subscription | undefined
  public pots: Pot[] = [];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private dialog: MatDialog,
    private potsService: PotsService,
  ) {}

  public tableColumns = ['name', 'balance'];

  ngOnInit(): void {
    this.potsSubscription = this.potsService
      .getPots()
      .subscribe((pots) => (this.pots = pots));
  }

  openCreateEditDialog(pot?: Pot) {
    const startingData: PotDialogData = {
      id: pot?.id ?? v4(),
      name: pot?.name ?? '',
      balance: pot?.balance ?? 0,
      new: !pot
    };

    const dialogRef = this.dialog.open<PotDialogComponent, PotDialogData, PotDialogData>(PotDialogComponent, {
      data: startingData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result?.new) {
        this.potsService.setPots([...this.pots, result]);
      } else if(result && !result.new) {
        this.potsService.updatePot(result)
      }
    });
  }
}
