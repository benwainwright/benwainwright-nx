import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PotDialogComponent } from './pot-dialog.component';

describe('PotDialogComponent', () => {
  let component: PotDialogComponent;
  let fixture: ComponentFixture<PotDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PotDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PotDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
