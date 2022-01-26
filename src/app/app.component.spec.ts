import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { RuntimeConfiguration } from './core/configuration/RuntimeConfiguration';
import { ToasterModule } from 'angular2-toaster';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule, ToasterModule
      ],
      providers: [
        { provide: RuntimeConfiguration, useValue: {apiUrl:'', logLevel:null} },   
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'acumen-webclient-excel'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('acumen-webclient-excel');
  });

});
