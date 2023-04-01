import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalancePotsDialogComponent } from './balance-pots-dialog.component';

describe('BalancePotsDialogComponent', () => {
  let component: BalancePotsDialogComponent;
  let fixture: ComponentFixture<BalancePotsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BalancePotsDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BalancePotsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
