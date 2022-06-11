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
import { DummyDataComponent } from './dummy-data/dummy-data.component';
import { BudgetComponent } from './budget/budget.component';
import { PotComponent } from './pot/pot.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { HeaderComponent } from './header/header.component';
import { BodyComponent } from './body/body.component';
import { DateParseInputComponent } from './date-parse-input/date-parse-input.component';
import { InputComponent } from './input/input.component';

@NgModule({
  declarations: [
    AppComponent,
    BudgetDashboardComponent,
    SettingsComponent,
    NavBarComponent,
    PaymentsComponent,
    DummyDataComponent,
    BudgetComponent,
    PotComponent,
    HeaderComponent,
    BodyComponent,
    DateParseInputComponent,
    InputComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  providers: [SettingsService, RecurringPaymentsService, BudgetService],
  bootstrap: [AppComponent],
})
export class AppModule {}
