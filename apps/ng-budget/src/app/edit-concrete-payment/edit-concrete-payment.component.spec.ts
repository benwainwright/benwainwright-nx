import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditConcretePaymentComponent } from './edit-concrete-payment.component';

describe('EditConcretePaymentComponent', () => {
  let component: EditConcretePaymentComponent;
  let fixture: ComponentFixture<EditConcretePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditConcretePaymentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditConcretePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
