import { Injectable } from '@angular/core'
import { Observable, of, BehaviorSubject, Subject } from 'rxjs'
import { RecurringPayment } from '../../types/recurring-payment'

@Injectable({
    providedIn: 'root',
})
export class RecurringPaymentsService {
    private payments = new BehaviorSubject<RecurringPayment[]>([])

    public constructor() {}

    getPayments(): Observable<RecurringPayment[]> {
        return this.payments.asObservable()
    }

    setPayments(payments: RecurringPayment[]) {
        this.payments.next(payments)
    }
}
