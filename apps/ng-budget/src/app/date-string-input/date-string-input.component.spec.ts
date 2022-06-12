import { bootstrapComponent } from '../../testing-utils/bootstrap-component';

import { DateStringInputComponent } from './date-string-input.component';

describe('DateStringInputComponent', () => {
  it('should create', () => {
    const component = bootstrapComponent(DateStringInputComponent);
    expect(component).toBeTruthy();
  });
});
