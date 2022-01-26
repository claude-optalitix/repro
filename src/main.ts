import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DEPLOY_URL } from './app/core/configuration/deploy-url';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}


const deployUrl = (function() {
  const scripts = document.getElementsByTagName('script');
  const index = scripts.length - 1;
  const mainScript = scripts[index];
  return mainScript.src.replace(/main.*?\.js$/, '');
})();

const DEPLOY_URL_PROVIDER = {
  provide: DEPLOY_URL,
  useValue: deployUrl,
};

platformBrowserDynamic([DEPLOY_URL_PROVIDER]).bootstrapModule(AppModule)
  .catch(err => console.error(err));
