import { bootstrapComponent } from '../../testing-utils/bootstrap-component';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  it('should create', () => {
    const component = bootstrapComponent(HeaderComponent);
    expect(component).toBeTruthy();
  });
});
