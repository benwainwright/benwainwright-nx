import { bootstrapComponent } from '../../testing-utils/bootstrap-component';

import { NavBarComponent } from './nav-bar.component';

describe('NavBarComponent', () => {
  it('should create', () => {
    const component = bootstrapComponent(NavBarComponent);
    expect(component).toBeTruthy();
  });
});
