import { bootstrapComponent } from '../../testing-utils/bootstrap-component';

import { InputComponent } from './input.component';

describe('InputComponent', () => {
  it('should create', () => {
    const component = bootstrapComponent(InputComponent);
    expect(component).toBeTruthy();
  });
});
