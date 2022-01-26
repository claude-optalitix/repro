import { ArrayTypeComponent } from './custom-array'
import { CustomCheckboxComponent } from './custom-checkbox'
import { CustomInputComponent } from './custom-input'
import { CustomSelectComponent } from './custom-select'
import { CustomLinkedInputComponent } from './custom-linked-input'
import { MatrixTypeComponent } from './custom-matrix'

export { ArrayTypeComponent } from './custom-array'
export { CustomCheckboxComponent } from './custom-checkbox'
export { CustomInputComponent } from './custom-input'
export { CustomSelectComponent } from './custom-select'
export { CustomLinkedInputComponent } from './custom-linked-input'
export { MatrixTypeComponent } from './custom-matrix'

export class CustomFormly {
    public static types = [
        { name: 'array', component: ArrayTypeComponent },
        { name: 'custominput', component: CustomInputComponent, wrappers: ['form-field'] },
        { name: 'matrix', component: MatrixTypeComponent, wrappers: ['form-field'] },       
        { name: 'customselect', component: CustomSelectComponent, wrappers: ['form-field'] },
        { name: 'customcheckbox', component: CustomCheckboxComponent, wrappers: ['form-field'] },
        { name: 'customlinkedinput', component: CustomLinkedInputComponent, wrappers: ['form-field'] },        
    ];
}