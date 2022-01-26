import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
    selector: 'formly-field-custom-linked-input',
    template: `
    <span 
      *ngIf="to.helptext" 
      class="help-text-icon" 
      placement="right" 
      ngbTooltip={{to.helptext}} 
      tooltipClass="custom-tooltip-class">?
   </span>
   <div class="form-row">
    <div class="col-9">
        <input
            type="text"
            [formControl]="formControl"
            class="form-control"
            [formlyAttributes]="field"
            [class.is-invalid]="showError"            
        />
    </div>
    <div class="col-1">
        <input            
            id="checkCustom"
            type="checkbox"   
            class="form-control custom"    
            style="width: 20px; height: 20px;" 
            [checked]="checked"
            (change)="onChange()"
        />       
    </div>  
    <div class="col-2">       
        <label for="checkCustom">Custom</label>
    </div>  
  </div> 
  `,
})
export class CustomLinkedInputComponent extends FieldType implements OnInit {
    public checked = false;

    ngOnInit(): void {
        const cleaned = (this.to.attributes['title'] as string).replace(/\s+/ig, '');
        this.checked = cleaned != this.field.defaultValue;
        this.lockInput();
        this.to.attributes['custom'] = this.checked ? 1 : 0;
    }

    onChange(): void {
        this.checked = !this.checked;
        this.lockInput();
        this.to.attributes['custom'] = this.checked ? 1 : 0;
    }

    private lockInput(): void {

        const field = this.form.get(this.field.key.toString());
        if (!field)
            return;
        if (!this.checked) {
            field.disable();
        } else {
            field.enable();
        }
    }
}