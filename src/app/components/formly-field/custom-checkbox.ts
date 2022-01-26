import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-custom-checkbox',
  template: `
    <span 
        *ngIf="to.helptext" 
        class="help-text-icon" 
        placement="right" 
        ngbTooltip={{to.helptext}} 
        tooltipClass="custom-tooltip-class">?
    </span>
    <input
        type="checkbox"
        [class.is-invalid]="showError"
        [formControl]="formControl"
        class="form-control"
        [formlyAttributes]="field"
        style="width: 20px; height: 20px;"
    />
  `,
})
export class CustomCheckboxComponent extends FieldType {}