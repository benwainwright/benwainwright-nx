import { bootstrapComponent } from '../../testing-utils/bootstrap-component';

import { PotComponent } from './pot.component';

describe('PotComponent', () => {
  it('should create', () => {
    const component = bootstrapComponent(PotComponent);
    expect(component).toBeTruthy();
  });
});
