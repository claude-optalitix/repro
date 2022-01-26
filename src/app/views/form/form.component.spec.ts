import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormComponent } from './form.component';
import { ExcelDesignerComponent } from '../../components/excelGrid/grapecity/designer/excel-designer.component'
import { Logger } from '../../core/service/Logger';
import { NotifyService } from '../../core/service/NotifyService';
import { RuntimeConfiguration } from '../../core/configuration/RuntimeConfiguration';
import { ToasterService } from 'angular2-toaster';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyModule } from '@ngx-formly/core';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { FormsModule } from '@angular/forms';
import { DEPLOY_URL } from '../../core/configuration/deploy-url';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule,FormlyModule, FormlyBootstrapModule, FormsModule],
      providers: [
        { provide: 'Window', useValue: window },
        { provide: DEPLOY_URL, useValue: '/' },
        { provide: RuntimeConfiguration, useValue: { apiUrl: "", logLevel: null } },
        ToasterService,
        Logger,
        NotifyService
      ],
      declarations: [FormComponent, ExcelDesignerComponent, SpinnerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy('component failed to be created');   
  });
});
