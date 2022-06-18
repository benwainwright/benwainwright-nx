import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { bootstrapComponent } from '../../testing-utils/bootstrap-component';

import { PaymentsComponent } from './payments.component';

class MockMatDialog {
  open() {
    /* Noop */
  }
}

describe('PaymentsComponent', () => {
  it('should create', () => {
    const component = bootstrapComponent(PaymentsComponent, [
      { provide: MatDialog, useClass: MockMatDialog },
      Overlay,
    ]);
    expect(component).toBeTruthy();
  });
});
