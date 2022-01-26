import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-custom-input',
  template: `
    <span 
      *ngIf="to.helptext" 
      class="help-text-icon" 
      placement="right" 
      ngbTooltip={{to.helptext}} 
      tooltipClass="custom-tooltip-class">?
   </span>
    <input
      type="text"
      [formControl]="formControl"
      class="form-control"
      [formlyAttributes]="field"
      [class.is-invalid]="showError"
    />
  `,
})
export class CustomInputComponent extends FieldType {
  get type() {
    return this.to.type || 'text';
  }
}