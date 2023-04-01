import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPaymentSheetComponent } from './edit-payment-sheet.component';

describe('EditPaymentSheetComponent', () => {
  let component: EditPaymentSheetComponent;
  let fixture: ComponentFixture<EditPaymentSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPaymentSheetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPaymentSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
