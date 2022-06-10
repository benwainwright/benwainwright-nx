import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'benwainwright-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  private subscription: Subscription | undefined;

  constructor(private settingService: SettingsService) {}

  ngOnDestroy(): void {}

  ngOnInit(): void {}
}
