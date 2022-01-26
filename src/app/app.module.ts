import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule } from 'angular2-toaster';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyModule } from '@ngx-formly/core';
import { AngularSplitModule } from 'angular-split';
import { NgxFileDropModule } from 'ngx-file-drop';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RuntimeConfiguration, RuntimeConfigurationFactory } from './core/configuration/RuntimeConfiguration';
import { Logger } from './core/service/Logger';
import { NotifyService } from './core/service/NotifyService';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { ExcelDesignerComponent } from './components/excelGrid/grapecity/designer/excel-designer.component';
import { FormComponent } from './views/form/form.component';
import { DesignerModule } from '@grapecity/spread-sheets-designer-angular'; 
import '@grapecity/spread-sheets-designer-resources-en'
import { CustomFormly, ArrayTypeComponent, CustomInputComponent, CustomSelectComponent, CustomCheckboxComponent, CustomLinkedInputComponent, MatrixTypeComponent} from './components/formly-field/custom-formly';
import { NgxSortableModule } from './components/ngx-sortable/ngx-sortable.module'
import { CommonModule } from '@angular/common';
import { AppBaseDirective } from './core/configuration/appBase.directive';
 

@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    ExcelDesignerComponent,    
    ArrayTypeComponent,
    SpinnerComponent,
    CustomInputComponent,
    CustomSelectComponent,
    CustomCheckboxComponent,
    CustomLinkedInputComponent,
    MatrixTypeComponent,
    TooltipComponent,
    AppBaseDirective,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    DesignerModule,
    ToasterModule.forRoot(),  
    AppRoutingModule,
    AngularSplitModule,
    NgbModule,
    FormsModule,
    NgxSortableModule,
    ReactiveFormsModule,
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: 'This field is required' },
      ],
      types: CustomFormly.types,
    }),
    FormlyBootstrapModule,
    NgxFileDropModule
  ],
  providers: [
    { provide: Window, useValue: window },
    RuntimeConfiguration,
    Logger,
    NotifyService,
    {
      provide: APP_INITIALIZER,
      useFactory: RuntimeConfigurationFactory,
      deps: [RuntimeConfiguration, HttpClient],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
