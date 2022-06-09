import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, of } from 'rxjs'

interface Settings {
    overdraft: number
    nextPayday: Date
}

@Injectable({
    providedIn: 'root',
})
export class SettingsService {
    constructor() {}

    private settings = new BehaviorSubject<Settings>({
        overdraft: 0,
        nextPayday: new Date(Date.now()),
    })

    getSettings(): Observable<Settings> {
        return this.settings.asObservable()
    }

    setSettings(settings: Partial<Settings>) {
        const nextSettings = { ...this.settings.value, ...settings }
        this.settings.next(nextSettings)
    }
}
