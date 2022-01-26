import { EventEmitter } from '@angular/core';
import { ModelDefinition } from '../../core/model/ModelFile';
import { SelectedCellEvent, InputType } from './selectedCellEvent';
import * as GC from '@grapecity/spread-sheets';
export abstract class ExcelGridComponent {
 
  public loadedData: boolean = false;
  public loadingData: boolean = false;
  public formArea: string;
  public static namex = new RegExp("^[A-Za-z_][\\w\\-\\s]*$");

  selectedCell: EventEmitter<SelectedCellEvent>;  
  focusedCellData: EventEmitter<SelectedCellData>;  
  changedCellValue: EventEmitter<ChangedCellData>;  
  workbookReady: EventEmitter<boolean>;

  abstract initFormArea(formArea: string);
  abstract handleFileInput(file: File, previousSchema: ModelDefinition): Promise<void>;
  abstract getFileAsBase64(updated: boolean): Promise<string>;
  abstract parseSelectedCells(direction: InputType, start: "top"| "left"): void;
  abstract selectCells(direction: InputType, cells: Array<any>, worksheetName: string, start: "top"|"left"): void;
  abstract unselectCell(address: string): void;
  abstract refreshCell(address: string): void;
  abstract setValue(address: string, value: any): void;
  abstract getValue(address: string): any;
  abstract focusAddress(address: string) : void;
  abstract worbookInitDone() : void;
  abstract takeSnapshot() : Promise<string>;
  abstract setFormArea(address:string): Promise<string>

  isValidName(name: string): boolean {
    return ExcelGridComponent.namex.test(name.trim());
  }
}

export interface Dimension{
  width:number;
  height:number;
}
export interface Dimensions {
  total?: Dimension;
  host?: Dimension;
  viewport?: Dimension;
  workbook?: GC.Spread.Sheets.Workbook;
  mode?: string;
}
export interface SelectedCellData {
  name?: string;
  data?: any;
}
export interface ChangedCellData {
  name?: string;
  cellAddress?: string;
  meta?: any;
  workbook?: GC.Spread.Sheets.Workbook;
}
