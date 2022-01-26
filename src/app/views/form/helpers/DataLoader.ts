import { ExcelGridComponent } from '../../../components/excelGrid/excelGridComponent';
import { ModelDefinition } from '../../../core/model/ModelFile';
import { InputDefinition } from '../../../core/model/InputDefinition';
import { Logger } from '../../../core/service/Logger';
import * as XLSX from 'xlsx';

export class DataLoader {

    private _excelGrid: ExcelGridComponent;
    private _logger: Logger;

    constructor(excelGrid: ExcelGridComponent, logger: Logger) {

        this._excelGrid = excelGrid;
        this._logger = logger;
    }

    public readSessionData(schema: ModelDefinition): object {
        const obj = { inputs: {}, outputs: {} };
        if (schema) {
            if (schema.inputs) {
                var inputs = this.readInputs(schema.inputs);
                Object.assign(obj.inputs, inputs);
            }
            if (schema.inputLists) {
                var inputs = this.readListInputs(schema.inputLists);
                Object.assign(obj.inputs, inputs);
            }
            if (schema.outputs) {
                var inputs = this.readInputs(schema.outputs);
                Object.assign(obj.outputs, inputs);
            }
            if (schema.outputLists) {
                var inputs = this.readListInputs(schema.outputLists);
                Object.assign(obj.outputs, inputs);
            }
        }

        return obj;
    }

    public loadSessionData(model: ModelDefinition, data: object) {
        if (data) {
            if (model.inputs && data['inputs']) {
                this.loadInputs(model.inputs, data['inputs']);
            }
            if (model.inputLists && data['inputs']) {
                this.loadListInputs(model.inputLists, data['inputs']);
            }
            if (model.outputs && data['outputs']) {
                this.loadInputs(model.outputs, data['outputs']);
            }
            if (model.outputs && data['outputs']) {
                this.loadListInputs(model.outputLists, data['outputs']);
            }
            if(model.formArea){
                this._logger.debug('form area '+model.formArea);               
                this._excelGrid.initFormArea(model.formArea);
            }
        }
    }

    private readInputs(inputs: Array<InputDefinition>): object {
        var obj = {};
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const value = this._excelGrid.getValue(input.address);
            obj[input.name] = value;
        }
        return obj;
    }

    private readListInputs(inputs: Array<InputDefinition>): object {
        var obj = {};

        for (let i = 0; i < inputs.length; i++) {
            const list = inputs[i];
            if (list.type != 'List') {
                continue;
            }

            var columns = inputs.filter(x => x.type != 'List' && x.name.startsWith(list.name + '/'));

            var lists = this.getListValues(columns);

            var rows = [];
            for (let row = 0; row < lists.maxLength; row++) {
                const rowItem = this.getObject(row, columns, lists.holder);
                if (rowItem != null)
                    rows.push(rowItem);
            }

            obj[list.name] = rows;
        }

        return obj;
    }

    private loadInputs(inputs: Array<InputDefinition>, data: object) {
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].name in data) {
                const input = inputs[i];
                const value = data[input.name];

                this._logger.debug('overwritting', { input, value });
                this._excelGrid.setValue(input.address, value);
            }
        }
    }

    private loadListInputs(inputs: Array<InputDefinition>, data: object) {
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].name in data) {
                const list = inputs[i];
                if (list.type != 'List') {
                    continue;
                }

                this._excelGrid.setValue(list.address, null); //cleaning table

                var columns = inputs.filter(x => x.type != 'List' && x.name.startsWith(list.name + '/'));

                for (let i = 0; i < columns.length; i++) {

                    const metadata = this.getColumnMetadata(columns[i], list.transpose);

                    for (let start = metadata.min; start <= metadata.max; start++) {
                        const index = start - metadata.min;
                        let value = null;

                        if (data[list.name] && index < data[list.name].length) {
                            value = data[list.name][index][metadata.field];
                        } else {
                            break;
                        }
                        let address: string;
                        if (!list.transpose) {
                            address = `${metadata.sheetName}-${metadata.columnName}${start}`;
                        } else {
                            const columnName = XLSX.utils.encode_col(start);
                            address = `${metadata.sheetName}-${columnName}${metadata.rowIndex}`;
                        }

                        this._logger.debug('overwritting', { address, value });
                        this._excelGrid.setValue(address, value);
                    }
                }
            }
        }
    }


    private getListValues(columns: Array<InputDefinition>) {
        let maxLength = 0;
        const holder = {};
        for (let col = 0; col < columns.length; col++) {
            const column = columns[col];
            const values = this._excelGrid.getValue(column.address);
            if (values.length > maxLength) {
                maxLength = values.length;
            }
            holder[column.name] = values;
        }

        return {maxLength, holder};
    }

    private getObject(row: number, columns: Array<InputDefinition>, holder: object): object {
        let rowItem = null;

        for (let col = 0; col < columns.length; col++) {
            const column = columns[col];
            const fieldName = column.name.split('/')[1];

            var value = holder[column.name][row];
            if (value != null) {
                if (rowItem == null)
                    rowItem = {};
                rowItem[fieldName] = value;
            }
        }

        return rowItem;
    }

    private getColumnMetadata(column: InputDefinition, transpose: boolean) {

        let splitIndex = column.address.indexOf('-');// <TABLE_NAME> - <COLUMN><MIN_ROW>:<COLUMN><MAX_ROW>
        const sheetName = column.address.substr(0, splitIndex);
        const rangeName = column.address.substr(splitIndex + 1);
        splitIndex = rangeName.indexOf(':');
        const minRange = rangeName.substr(0, splitIndex);
        const maxRange = rangeName.substr(splitIndex + 1);
        const parts = minRange.match(/([A-z]+)(\d+)/);
        const columnName = parts[1];
        const field = column.name.split('/')[1];// <TABLE_NAME>/<COLUMN_NAME>
        const rowIndex = parseInt(parts[2]);

        let min: number, max: number;
        if (!transpose) {
            min = rowIndex;
            max = parseInt(maxRange.split(/([A-z]+)(\d+)/)[2]);
        } else {
            const partsMax = maxRange.match(/([A-z]+)(\d+)/);
            min = XLSX.utils.decode_col(parts[1]);
            max = XLSX.utils.decode_col(partsMax[1]);
        }

        return { sheetName, columnName, rowIndex, field, min, max };
    }
}