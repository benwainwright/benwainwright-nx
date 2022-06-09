import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'

@Injectable({
    providedIn: 'root',
})
export class BalanceService {
    private balance: number = 1500

    constructor() {}

    getAvailableBalance(): Observable<number> {
        return of(this.balance)
    }
}
