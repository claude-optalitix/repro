import { ExcelGridComponent } from '../../../components/excelGrid/excelGridComponent';
import { InputType } from '../../../components/excelGrid/selectedCellEvent';
import { InputDefinition } from '../../../core/model/InputDefinition';
import { ModelDefinition } from '../../../core/model/ModelFile';
import { Logger } from '../../../core/service/Logger';
import { DataLoader } from './DataLoader';
import { TestBed } from '@angular/core/testing';

describe('DataLoader', () => {
    let loader: DataLoader;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        loader = new DataLoader(new ExcelGridComponentMock(), new Logger(null));
    });

    it('should readSessionData', () => {
        var schema = new ModelDefinition();
        schema.inputs = [new InputDefinition()];
        schema.outputs = [new InputDefinition()];
        const data = loader.readSessionData(schema);

        expect(data).toBeTruthy('no grid');
        expect(data['inputs']).toBeTruthy('no grid');
        expect(data['outputs']).toBeTruthy('no grid');
    });

    /*it('should loadSessionData', () => {
        var schema = new ModelDefinition();
        schema.inputs = [new InputDefinition()];
        schema.outputs = [new InputDefinition()];
                
        const data = loader.loadSessionData(schema, {inputs:[], outputs:[]});

        expect(data).toBeTruthy('no grid');
        expect(data['inputs']).toBeTruthy('no grid');
        expect(data['outputs']).toBeTruthy('no grid');
    });*/

    it('should getColumnMetadata', () => {
        var definition = <InputDefinition>{ address: "Sheet1-B2:B3", name: "List/Column" };
        var tdefinition = <InputDefinition>{ address: "Sheet1-B2:C2", name: "List/Column" };

        const meta = loader['getColumnMetadata'](definition, false);
        const tmeta = loader['getColumnMetadata'](tdefinition, true);

        expect(meta).toEqual({ sheetName: "Sheet1", columnName: "B", rowIndex: 2, field: "Column", min: 2, max: 3 });
        expect(tmeta).toEqual({ sheetName: "Sheet1", columnName: "B", rowIndex: 2, field: "Column", min: 1, max: 2 });
    });

    it('should getObject', () => {
        var definitions = [<InputDefinition>{ address: "Sheet1-B2:B3", name: "List", type: "List" }, <InputDefinition>{ address: "Sheet1-B2:B3", name: "List/Column" }];

        const data = loader['readListInputs'](definitions);

        expect(data).toEqual({ "List": [{ "Column": 1 }] });
    });

    it('should loadListInputs', () => {
        //normal list
        var definitions = [
            <InputDefinition>{ address: "Sheet1-B2:B3", name: "List", type: "List" },
            <InputDefinition>{ address: "Sheet1-B2:B3", name: "List/Column", type: "Number" }
        ];
        loader['loadListInputs'](definitions, { "List": [{ "Column": 1 }, { "Column": 0 }] });
        expect((loader['_excelGrid'] as ExcelGridComponentMock).valuesSet).toEqual([{ address: "Sheet1-B2:B3", value: null }, { address: "Sheet1-B2", value: 1 }, { address: "Sheet1-B3", value: 0 }]);

        (loader['_excelGrid'] as ExcelGridComponentMock).valuesSet = [];

        //transposed
        var definitions = [
            <InputDefinition>{ address: "Sheet1-B2:C2", name: "List", type: "List", transpose: true },
            <InputDefinition>{ address: "Sheet1-B2:C2", name: "List/Column", type: "Number" }
        ];
        loader['loadListInputs'](definitions, { "List": [{ "Column": 1 }, { "Column": 0 }] });
        expect((loader['_excelGrid'] as ExcelGridComponentMock).valuesSet).toEqual([{ address: "Sheet1-B2:C2", value: null }, { address: "Sheet1-B2", value: 1 }, { address: "Sheet1-C2", value: 0 }]);
    });
});

class ExcelGridComponentMock extends ExcelGridComponent {
    initFormArea(area) { }
    valuesSet: Array<any> = [];
    handleFileInput(file: File, previousSchema: ModelDefinition): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getFileAsBase64(): Promise<string> {
        return new Promise<string>((resolve) => { resolve('') });
    }
    parseSelectedCells(direction: InputType): void { }
    selectCells(direction: InputType, cells: any[]): void { }
    unselectCell(address: string): void { }
    refreshCell(address: string): void { }
    setValue(address: string, value: any): void {
        this.valuesSet.push({ address, value });
    }
    getValue(address: string) {
        return [1];
    }
    setFormArea(address:string): Promise<string> { throw new Error('Method not implemented.'); }
    focusAddress(address: string) {}
    takeSnapshot(): Promise<string>  {  return new Promise<string>((resolve) => { resolve(null) }); }
    worbookInitDone() : void{};
}