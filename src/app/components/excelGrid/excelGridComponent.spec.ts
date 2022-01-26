import { TestBed, async } from '@angular/core/testing';
import { ModelDefinition } from '../../core/model/ModelFile';
import { ExcelGridComponent } from './excelGridComponent';
import { InputType } from './selectedCellEvent';

describe('ExcelGridComponent', () => {
    let grid: ExcelGridComponent;

    beforeEach(async(() => {
        grid = new ExcelGridComponentShim();
    }));

    it('asserts ExcelGridComponent', () => {
        expect(grid).toBeTruthy();
    });

    it('asserts isValidName', () => {
        const testCases = {
            "validName": true,
            "valid_name": true,
            "_valid_name": true,
            "valid_name1": true,
            "valid name": true,
            "invalid_name$": false,
            "1_invalid_name": false,
        };
        Object.entries(testCases).forEach(([key, asExpected]) =>{
            const result = grid.isValidName(key);
            expect(result).toBe(asExpected, {key, asExpected, result});
        });

    });
});

class ExcelGridComponentShim extends ExcelGridComponent {
    initFormArea(area){  }
    handleFileInput(file: File, previousSchema: ModelDefinition): Promise<void> { throw new Error('Method not implemented.'); }
    getFileAsBase64(): Promise<string> { throw new Error('Method not implemented.'); }
    parseSelectedCells(direction: InputType): void { throw new Error('Method not implemented.'); }
    selectCells(direction: InputType, cells: any[]): void { throw new Error('Method not implemented.'); }
    unselectCell(address: string): void { throw new Error('Method not implemented.'); }
    refreshCell(address: string): void { throw new Error('Method not implemented.'); }
    setValue(address: string, value: any): void { throw new Error('Method not implemented.'); }
    getValue(address: string) { throw new Error('Method not implemented.'); }
    focusAddress(address: string) {}
    takeSnapshot(): Promise<string>  { throw new Error('Method not implemented.'); }
    worbookInitDone(): void  { throw new Error('Method not implemented.'); }
    setFormArea(address:string): Promise<string> { throw new Error('Method not implemented.'); }
}