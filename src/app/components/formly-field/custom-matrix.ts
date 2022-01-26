import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { keyDefinition } from '../../core/model/InputDefinition';

@Component({
  selector: 'formly-matrix-type',
  template: `
  <div class="mb-3">
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Ignore</th>
          <th>Overriden Key Name</th>
        </tr>
      </thead>
      <tr *ngFor="let item of items; let i = index">
        <td><input [attr.data-row]="i" [attr.data-name]="'key'" class="form-control" type="text" [(ngModel)]="item.name" /></td>
        <td><input [attr.data-row]="i" [attr.data-name]="'ignored'" class="form-control" type="checkbox" [(ngModel)]="item.ignored" /></td>
        <td><input [attr.data-row]="i" [attr.data-name]="'override'" class="form-control" type="text" [(ngModel)]="item.override" /></td>
      </tr>
    </table>
  </div>
  `,
})
export class MatrixTypeComponent extends FieldType implements OnInit {

  items: keyDefinition[] = [];

  ngOnInit(): void {
    const name = this.key.toString().split('.')[0];
    var keys = this.model[name]['keys'];
    if (keys) {
      this.items = keys;
    }
  }
}