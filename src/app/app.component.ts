import { Component } from '@angular/core';
import { RuntimeConfiguration } from './core/configuration/RuntimeConfiguration';
import { ToasterConfig } from 'angular2-toaster';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public version: string;
  public browser: string;
  public title = 'acumen-webclient-excel';
  public config: ToasterConfig = new ToasterConfig({ positionClass: 'toast-bottom-right' });

  constructor(runtime: RuntimeConfiguration) {
    this.version = runtime.version;
  }
}
