import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { Pot } from '../../types/pot'

@Injectable({
    providedIn: 'root',
})
export class PotsService {
    constructor() {}

    private pots = new BehaviorSubject<Pot[]>([])

    getPots(): Observable<Pot[]> {
        return this.pots.asObservable()
    }
}
