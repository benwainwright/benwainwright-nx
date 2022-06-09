import { TestBed } from '@angular/core/testing'
import { lastValueFrom, Observable, of, take } from 'rxjs'
import { Pot } from '../../types/pot'
import { date } from "../../lib/dates"
import { BalanceService } from './balance.service'

import { BudgetService } from './budget.service'
import { PotsService } from './pots.service'
import { RecurringPaymentsService } from './recurring-payments.service'

class MockBalanceService {
    getAvailableBalance(): Observable<number> {
        return of(1200)
    }
}

class MockPotsService {
    getPots(): Observable<Pot[]> {
        return of([
            {
                id: '0',
                balance: 50,
                name: 'my other cool pot',
            },
            {
                id: '1',
                balance: 105,
                name: 'my cool pot',
            },
            {
                id: '2',
                balance: 205,
                name: 'my other cool pot',
            },
            {
                id: '3',
                balance: 405,
                name: 'my next cool pot',
            },
        ])
    }
}

class MockRecurringPaymentsService {
    getPayments() {
        return of([
            {
                id: '1',
                name: 'Cleaner',
                when: 'on the 3rd of June',
                amount: 100,
                potId: '0',
            },
            {
                id: '2',
                name: 'Fish',
                when: '6th of June',
                amount: 100,
                potId: '0',
            },
            {
                id: '3',
                name: 'Electricity',
                when: 'every week on wednesday',
                amount: 25,
                potId: '1',
            },
        ])
    }
}

const expectSameDate = (dateOne: Date, dateTwo: Date) => {
    expect(dateOne.getDate()).toEqual(dateTwo.getDate())
    expect(dateOne.getMonth()).toEqual(dateTwo.getMonth())
    expect(dateOne.getFullYear()).toEqual(dateTwo.getFullYear())
}

describe('BudgetService', () => {
    it('generates the correct payments in the pot plan when creating the initial budget', async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: BalanceService, useClass: MockBalanceService },
                { provide: PotsService, useClass: MockPotsService },
                {
                    provide: RecurringPaymentsService,
                    useClass: MockRecurringPaymentsService,
                },
            ],
        })

        const service = TestBed.inject(BudgetService)

        const startDate = date(31, 5, 2022)
        const endDate = date(30, 6, 2022)

        await service.createInitialBudget({
            startDate,
            endDate,
        })

        const budget = await lastValueFrom(service.getBudget().pipe(take(1)))

        expect(budget.length).toEqual(1)
        expect(budget[0]).toEqual(
            expect.objectContaining({
                startDate,
                endDate,
            })
        )

        const first = budget[0].potPlans[0]
        expect(first.payments.length).toEqual(2)

        expectSameDate(first.payments[0].when, date(3, 6, 2022))
        expectSameDate(first.payments[1].when, date(6, 6, 2022))

        const second = budget[0].potPlans[1]

        expect(second.payments.length).toEqual(5)

        expectSameDate(second.payments[0].when, date(1, 6, 2022))
        expectSameDate(second.payments[1].when, date(8, 6, 2022))
        expectSameDate(second.payments[2].when, date(15, 6, 2022))
        expectSameDate(second.payments[3].when, date(22, 6, 2022))
        expectSameDate(second.payments[4].when, date(29, 6, 2022))

        expect(second.payments[2].amount).toEqual(25)

        const third = budget[0].potPlans[2]
        expect(third.payments.length).toEqual(0)

        const fourth = budget[0].potPlans[2]
        expect(fourth.payments.length).toEqual(0)
    })

    it('calculates the correct pot plan balances', async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: BalanceService, useClass: MockBalanceService },
                { provide: PotsService, useClass: MockPotsService },
                {
                    provide: RecurringPaymentsService,
                    useClass: MockRecurringPaymentsService,
                },
            ],
        })

        const service = TestBed.inject(BudgetService)

        const startDate = date(31, 5, 2022)
        const endDate = date(30, 6, 2022)

        await service.createInitialBudget({
            startDate,
            endDate,
        })

        const budget = await lastValueFrom(service.getBudget().pipe(take(1)))

        expect(budget[0].potPlans[0].adjustmentAmount).toEqual(150)
        expect(budget[0].potPlans[1].adjustmentAmount).toEqual(20)
        expect(budget[0].potPlans[2].adjustmentAmount).toEqual(-205)
        expect(budget[0].potPlans[3].adjustmentAmount).toEqual(-405)
        expect(budget[0].surplus).toEqual(1640)
    })
})
