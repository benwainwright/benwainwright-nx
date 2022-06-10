import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BudgetDashboardComponent } from './budget-dashboard/budget-dashboard.component';
import { PaymentsComponent } from './payments/payments.component';
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
