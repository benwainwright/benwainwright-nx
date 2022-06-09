import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BudgetService } from './services/budget.service'
import { RecurringPaymentsService } from './services/recurring-payments.service'
import { SettingsService } from './services/settings.service'

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, AppRoutingModule],
    providers: [SettingsService, RecurringPaymentsService, BudgetService],
    bootstrap: [AppComponent],
})
export class AppModule {}
