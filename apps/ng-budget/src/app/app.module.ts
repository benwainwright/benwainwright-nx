import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { MatChipsModule } from '@angular/material/chips';
import { AppComponent } from './app.component';
import {
  BudgetService,
  BUDGET_INJECTION_TOKEN,
} from './services/budget.service';
import {
  PAYMENTS_DATA_INJECTION_TOKEN,
  RecurringPaymentsService,
} from './services/recurring-payments.service';
import {
  SettingsService,
  SETTINGS_INJECTION_TOKEN,
} from './services/settings.service';
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from './header/header.component';
import { BodyComponent } from './body/body.component';
import { InputComponent } from './input/input.component';
import { MatDialogModule } from '@angular/material/dialog';

import { DateStringInputComponent } from './date-string-input/date-string-input.component';
import { CreatePaymentDialogComponent } from './create-payment-dialog/create-payment-dialog.component';
import { PotsComponent } from './pots/pots.component';
import { PotDialogComponent } from './pot-dialog/pot-dialog.component';
import { SelectComponent } from './select/select.component';
import { MatSelectModule } from '@angular/material/select';
import { LocalStorageDataSeriesService } from './services/local.storage.data-series.service';
import { POTS_INJECTION_TOKEN } from './services/pots.service';
import { Budget } from '@benwainwright/budget-domain';
import { AppConfigService } from './services/app-config.service';
import { AuthService } from './services/auth.service';
import { AuthorisedGuard } from './guards/authorised.guard';
import { LoggerService } from './services/logger.service';
import { ApiService } from './services/api.service';
import { RemoteDataService } from './remote-data.service';
import { RemoteDataSeriesService } from './services/remote-data-series.service';
import { RouteReuseStrategy } from '@angular/router';
import { AppRouteReuseStrategy } from '../lib/app-route-reuse-strategy';

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
    InputComponent,
    DateStringInputComponent,
    CreatePaymentDialogComponent,
    PotsComponent,
    PotDialogComponent,
    SelectComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatDialogModule,
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatChipsModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: AppRouteReuseStrategy },
    SettingsService,
    AppConfigService,
    AuthService,
    LoggerService,
    AuthorisedGuard,
    RecurringPaymentsService,
    BudgetService,
    {
      provide: BUDGET_INJECTION_TOKEN,
      useFactory: () =>
        new LocalStorageDataSeriesService('budget', Budget.fromJson),
    },
    {
      provide: PAYMENTS_DATA_INJECTION_TOKEN,
      useFactory: (api: ApiService, auth: AuthService) => {
        return new RemoteDataSeriesService('payments', api, auth);
      },
      deps: [ApiService, AuthService],
    },
    {
      provide: POTS_INJECTION_TOKEN,
      useFactory: (api: ApiService, auth: AuthService) => {
        return new RemoteDataSeriesService('pots', api, auth);
      },
      deps: [ApiService, AuthService],
    },
    {
      provide: SETTINGS_INJECTION_TOKEN,
      useFactory: (api: ApiService, auth: AuthService) => {
        return new RemoteDataService('settings', api, auth);
      },
      deps: [ApiService, AuthService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
