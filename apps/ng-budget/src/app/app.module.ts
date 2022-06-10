import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BudgetService } from './services/budget.service';
import { RecurringPaymentsService } from './services/recurring-payments.service';
import { SettingsService } from './services/settings.service';
import { BudgetDashboardComponent } from './budget-dashboard/budget-dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { PaymentsComponent } from './payments/payments.component';

@NgModule({
  declarations: [
    AppComponent,
    BudgetDashboardComponent,
    SettingsComponent,
    NavBarComponent,
    PaymentsComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
  providers: [SettingsService, RecurringPaymentsService, BudgetService],
  bootstrap: [AppComponent],
})
export class AppModule {}
