import { bootstrapComponent } from '../../testing-utils/bootstrap-component';

import { BudgetComponent } from './budget.component';

describe('BudgetComponent', () => {
  it('should create', () => {
    const component = bootstrapComponent(BudgetComponent);
    expect(component).toBeTruthy();
  });
});
