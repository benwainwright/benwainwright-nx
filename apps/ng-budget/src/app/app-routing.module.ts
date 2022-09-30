import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BudgetDashboardComponent } from './budget-dashboard/budget-dashboard.component';
import { BudgetComponent } from './budget/budget.component';
import { DummyDataComponent } from './dummy-data/dummy-data.component';
import { PaymentsComponent } from './payments/payments.component';
import { PotsComponent } from './pots/pots.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'budget-dashboard',
  },
  {
    path: 'budget-dashboard',
    component: BudgetDashboardComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'payments',
    component: PaymentsComponent,
  },
  {
    path: 'dummy-data',
    component: DummyDataComponent,
  },

  {
    path: 'budget/:id',
    component: BudgetComponent,
  },
  {
    path: 'pots',
    component: PotsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
