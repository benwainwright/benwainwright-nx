import { SettingsService } from './settings.service'
import { lastValueFrom, pipe, take } from 'rxjs'

describe('settings service', () => {
    it('should be instantiated without error', () => {
        new SettingsService()
    })

    it('provides a default payday of today', async () => {
        const service = new SettingsService()

        const result = await lastValueFrom(service.getSettings().pipe(take(1)))

        const today = new Date(Date.now())

        expect(result.nextPayday.getDay()).toEqual(today.getDay())
        expect(result.nextPayday.getMonth()).toEqual(today.getMonth())
        expect(result.nextPayday.getFullYear()).toEqual(today.getFullYear())
    })

    it('should return the new date when set', async () => {
        const service = new SettingsService()

        const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24 * 4)

        const today = new Date(Date.now())

        const firstResult = await lastValueFrom(
            service.getSettings().pipe(take(1))
        )

        expect(firstResult.nextPayday.getDay()).toEqual(today.getDay())
        expect(firstResult.nextPayday.getMonth()).toEqual(today.getMonth())
        expect(firstResult.nextPayday.getFullYear()).toEqual(
            today.getFullYear()
        )

        service.setSettings({
            nextPayday: tomorrow,
        })

        const result = await lastValueFrom(service.getSettings().pipe(take(1)))

        expect(result.nextPayday.getDay()).toEqual(tomorrow.getDay())
        expect(result.nextPayday.getMonth()).toEqual(tomorrow.getMonth())
        expect(result.nextPayday.getFullYear()).toEqual(tomorrow.getFullYear())
    })

    it('should emit new values when set', async () => {
        const service = new SettingsService()

        const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24 * 4)

        const today = new Date(Date.now())

        const settingsObservable = service.getSettings()

        const firstResult = await lastValueFrom(
            settingsObservable.pipe(take(1))
        )

        expect(firstResult.nextPayday.getDay()).toEqual(today.getDay())
        expect(firstResult.nextPayday.getMonth()).toEqual(today.getMonth())
        expect(firstResult.nextPayday.getFullYear()).toEqual(
            today.getFullYear()
        )

        service.setSettings({
            nextPayday: tomorrow,
        })

        const result = await lastValueFrom(settingsObservable.pipe(take(1)))

        expect(result.nextPayday.getDay()).toEqual(tomorrow.getDay())
        expect(result.nextPayday.getMonth()).toEqual(tomorrow.getMonth())
        expect(result.nextPayday.getFullYear()).toEqual(tomorrow.getFullYear())
    })

    it('provides a default overdraft of 0', async () => {
        const service = new SettingsService()

        const result = await lastValueFrom(service.getSettings().pipe(take(1)))

        expect(result.overdraft).toEqual(0)
    })

    it('should allow you to change the overdraft', async () => {
        const service = new SettingsService()

        service.setSettings({ overdraft: 100 })
        const result = await lastValueFrom(service.getSettings().pipe(take(1)))

        expect(result.overdraft).toEqual(100)
    })
})
