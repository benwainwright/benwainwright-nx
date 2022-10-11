import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BudgetDashboardComponent } from './budget-dashboard/budget-dashboard.component';
import { BudgetComponent } from './budget/budget.component';
import { AuthorisedGuard } from './guards/authorised.guard';
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
    canActivate: [AuthorisedGuard],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthorisedGuard],
  },
  {
    path: 'payments',
    component: PaymentsComponent,
    canActivate: [AuthorisedGuard],
  },

  {
    path: 'budget/:id',
    component: BudgetComponent,
    canActivate: [AuthorisedGuard],
  },
  {
    path: 'pots',
    component: PotsComponent,
    canActivate: [AuthorisedGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
