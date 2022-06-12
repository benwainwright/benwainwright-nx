import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePaymentDialogComponent } from './create-payment-dialog.component';

describe('CreatePaymentDialogComponent', () => {
  let component: CreatePaymentDialogComponent;
  let fixture: ComponentFixture<CreatePaymentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreatePaymentDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePaymentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
