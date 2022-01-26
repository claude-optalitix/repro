import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-custom-select',
  template: `
    <span 
      *ngIf="to.helptext" 
      class="help-text-icon" 
      placement="right" 
      ngbTooltip={{to.helptext}} 
      tooltipClass="custom-tooltip-class">?
    </span>
    <select
      class="form-control"
      [formControl]="formControl"
      [class.is-invalid]="showError"
      [formlyAttributes]="field"
    >
      <option *ngIf="to.placeholder" [ngValue]="undefined">{{ to.placeholder }}</option>
      <ng-container *ngIf="to.options">
        <ng-container *ngFor="let opt of to.options">
          <option [ngValue]="opt.value">{{ opt.label }}</option>
        </ng-container>
      </ng-container>
    </select>
  `,
})
export class CustomSelectComponent extends FieldType {}