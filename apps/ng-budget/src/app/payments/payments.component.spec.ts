import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { bootstrapComponent } from '../../testing-utils/bootstrap-component';

import { PaymentsComponent } from './payments.component';

describe('PaymentsComponent', () => {
  it('should create', () => {
    const component = bootstrapComponent(PaymentsComponent, [
      MatDialog,
      Overlay,
    ]);
    expect(component).toBeTruthy();
  });
});
