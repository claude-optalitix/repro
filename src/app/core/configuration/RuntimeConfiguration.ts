import { Injectable, isDevMode, Inject } from "@angular/core";
import { DEPLOY_URL } from "./deploy-url";
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

export class Endpoints {
  public local: EndpointConfig;
  public acumen: EndpointConfig;
}
export class EndpointConfig {
  public endpoint: string;
  public upsert: string;
  public list: string;
  public execute: string;
  public redirect: string;
  public config: string;
}

@Injectable()
export class RuntimeConfiguration {
  api: Endpoints;
  logLevel: string;
  version: string;
  grapecityLicense: string;
  grapecityDesignerLicense: string;
  jwtToken: string;
  locale: string = "en-gb";

  private _deployUrl: string;

  constructor(private _httpClient: HttpClient, private _route: ActivatedRoute, @Inject(DEPLOY_URL) deployUrl: string) { this._deployUrl = deployUrl; }

  private getLocal(){
    const defaultValue =  'en-gb';
    if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {     
      return defaultValue;
    }
    const wn = window.navigator as any;
    let lang = wn.languages ? wn.languages[0] : defaultValue;
    lang = lang || wn.language || wn.browserLanguage || wn.userLanguage;

    return lang.toLowerCase();
  }

  private loadFile(path: string, ignoreFailure: boolean): Promise<any> {
    return new Promise((r, e) => {
      this._httpClient.get(path)
        .subscribe(
          (content: RuntimeConfiguration) => {

            Object.assign(this, content);

            console.debug('overwrite config with', content);
            r(this);
          },
          error => { if (!ignoreFailure) e(error); else r(this); });
    })
  }

  async load(): Promise<any> {    
    let path = this._deployUrl + 'assets/runtime.json?t=' + new Date().getTime();
    //loading config from file
    let config = await this.loadFile(path, false); //base config
    if (isDevMode()) {     
      path = this._deployUrl + 'assets/runtime.local.json?t=' + new Date().getTime();
      config = await this.loadFile(path, true); //overwriting secrets (api keys, etc...)
    }

    //getting endpoint from caller
    this._route.queryParams.subscribe((params) => {

      if (params.source) {
        this.jwtToken = params.source;
        const payload: any = JSON.parse(atob(this.jwtToken.split('.')[1]));
        config.api['acumen'].endpoint = payload.iss;  //issuer will be considered for endpoint          
      }
    });

    config.locale = this.getLocal();

    return config;
  }
}

export function RuntimeConfigurationFactory(runtimeConfig: RuntimeConfiguration) {
  return () => runtimeConfig.load();
}