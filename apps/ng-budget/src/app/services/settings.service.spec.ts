import { SettingsService } from './settings.service';
import { lastValueFrom, pipe, take } from 'rxjs';

describe('settings service', () => {
  it('should be instantiated without error', () => {
    new SettingsService();
  });

  it('provides a default pay cycle of the first of every month', async () => {
    const service = new SettingsService();

    const result = await lastValueFrom(service.getSettings().pipe(take(1)));

    const today = new Date(Date.now());

    expect(result.payCycle).toEqual('last thursday of every month');
  });

  it('should return the new pay cycle when set', async () => {
    const service = new SettingsService();

    const firstResult = await lastValueFrom(
      service.getSettings().pipe(take(1))
    );

    expect(firstResult.payCycle).toEqual('last thursday of every month');

    service.setSettings({
      payCycle: 'the last thursday of every month',
    });

    const result = await lastValueFrom(service.getSettings().pipe(take(1)));
    expect(result.payCycle).toEqual('the last thursday of every month');
  });

  it('should emit new values when set', async () => {
    const service = new SettingsService();

    const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24 * 4);

    const today = new Date(Date.now());

    const settingsObservable = service.getSettings();

    const firstResult = await lastValueFrom(settingsObservable.pipe(take(1)));

    expect(firstResult.payCycle).toEqual('last thursday of every month');

    service.setSettings({
      payCycle: 'every thursday',
    });

    const result = await lastValueFrom(settingsObservable.pipe(take(1)));

    expect(result.payCycle).toEqual('every thursday');
  });

  it('provides a default overdraft of 0', async () => {
    const service = new SettingsService();

    const result = await lastValueFrom(service.getSettings().pipe(take(1)));

    expect(result.overdraft).toEqual(0);
  });

  it('should allow you to change the overdraft', async () => {
    const service = new SettingsService();

    service.setSettings({ overdraft: 100 });
    const result = await lastValueFrom(service.getSettings().pipe(take(1)));

    expect(result.overdraft).toEqual(100);
  });
});
