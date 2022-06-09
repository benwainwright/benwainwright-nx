import { TestBed } from '@angular/core/testing'
import { lastValueFrom, take } from 'rxjs'
import { BalanceService } from './balance.service'

describe('BalanceService', () => {
    it('should be created', () => {
        TestBed.configureTestingModule({})
        const service = TestBed.inject(BalanceService)
        expect(service).toBeTruthy()
    })

    it('should default to 1500 when initialised', async () => {
        TestBed.configureTestingModule({})
        const service = TestBed.inject(BalanceService)

        const pots = await lastValueFrom(
            service.getAvailableBalance().pipe(take(1))
        )

        expect(pots).toEqual(1500)
    })
})
