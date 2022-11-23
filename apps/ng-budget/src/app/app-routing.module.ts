import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { BudgetDashboardComponent } from './budget-dashboard/budget-dashboard.component';
import { BudgetComponent } from './budget/budget.component';
import { AuthorisedGuard } from './guards/authorised.guard';
import { PaymentsComponent } from './payments/payments.component';
import { PotsComponent } from './pots/pots.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: (Route & { navLabel?: string; icon?: string })[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'budget-dashboard',
  },
  {
    path: 'budget-dashboard',
    navLabel: 'Dashboard',
    icon: 'assessment',
    component: BudgetDashboardComponent,
    canActivate: [AuthorisedGuard],
  },
  {
    path: 'settings',
    icon: 'settings',
    navLabel: 'Settings',
    component: SettingsComponent,
    canActivate: [AuthorisedGuard],
    data: {
      reuseComponent: true,
    },
  },
  {
    path: 'payments',
    navLabel: 'Payments',
    icon: 'attach_money',
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
    icon: 'account_balance',
    navLabel: 'Pots',
    component: PotsComponent,
    canActivate: [AuthorisedGuard],
  },
];

export const menuItems = routes.flatMap((route) =>
  route.navLabel && route.path
    ? [{ navLabel: route.navLabel, path: route.path, icon: route.icon }]
    : []
);

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
