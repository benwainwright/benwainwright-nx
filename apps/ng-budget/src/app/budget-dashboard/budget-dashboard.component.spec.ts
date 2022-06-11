import { BudgetDashboardComponent } from './budget-dashboard.component';
import { bootstrapComponent } from '../../testing-utils/bootstrap-component';

describe('BudgetDashboardComponent', () => {
  it('should create', () => {
    const component = bootstrapComponent(BudgetDashboardComponent);
    expect(component).toBeTruthy();
  });
});
