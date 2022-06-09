import { TestBed } from '@angular/core/testing'
import { lastValueFrom, take } from 'rxjs'

import { PotsService } from './pots.service'

describe('PotsService', () => {
    it('should be created', () => {
        TestBed.configureTestingModule({})
        const service = TestBed.inject(PotsService)
        expect(service).toBeTruthy()
    })

    it('provides an empty array when first initialised', async () => {
        TestBed.configureTestingModule({})
        const service = TestBed.inject(PotsService)

        const pots = await lastValueFrom(service.getPots().pipe(take(1)))

        expect(pots).toEqual([])
    })
})
