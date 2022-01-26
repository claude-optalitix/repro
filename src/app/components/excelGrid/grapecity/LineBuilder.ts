import * as GC from '@grapecity/spread-sheets';
import * as XLSX from 'xlsx';
import { InputCellTypeHelper } from './InputCellTypeHelper';

export abstract class LineBuilder {
    constructor(protected workbook: GC.Spread.Sheets.Workbook) {}

    public getAddress(range: GC.Spread.Sheets.Range) {
        let address = XLSX.utils.encode_col(range.col) + (range.row + 1) + ':' + XLSX.utils.encode_col(range.col + range.colCount - 1) + (range.row + range.rowCount);
        var sheet = this.workbook.getActiveSheet();
        address = sheet.name() + '-' + address;

        return address;
    }

    public getLineDefaults(address: string, transposed: boolean) {
        var meta = this.decomposeAddress(address, transposed);
        const values = this.getLineValues(meta.addressMeta.worksheet, meta.start, meta.end, meta.vertice, transposed);
        let key = this.findLineName(meta.addressMeta.worksheet, meta.start, meta.vertice, transposed);

        return { name: key, values: values };
    }

    protected getLineValues(worksheet: GC.Spread.Sheets.Worksheet, start: number, end: number, vertice: number, transposed: boolean): any[] {
        const values = [];

        for (let index = start; index <= end; index++) {
            var value = (!transposed) ? worksheet.getRange(index, vertice).value() : worksheet.getRange(vertice, index).value();
            values.push(value);
        }

        return values;
    }

    protected decomposeAddress(address: string, transposed: boolean) {
        const addressMeta = InputCellTypeHelper.parseAddress(address, this.workbook);
        const parts = addressMeta.rangeName.split(':');

        const cellBegining: XLSX.CellAddress = XLSX.utils.decode_cell(parts[0]);
        const cellEnding: XLSX.CellAddress = XLSX.utils.decode_cell(parts[1]);

        if(transposed){
            return { addressMeta, start : cellBegining.c, end : cellEnding.c, vertice : cellBegining.r, verticeEnd : cellEnding.r};
        }

        return { addressMeta, start : cellBegining.r, end : cellEnding.r, vertice : cellBegining.c, verticeEnd : cellEnding.c};
    }

    protected findLineName(worksheet: GC.Spread.Sheets.Worksheet, start: number, vertice: number, transposed: boolean): string {
        let key: string = null;
        for (let i = start - 1; i >= 0; i--) {
            var value = (!transposed) ? worksheet.getRange(i, vertice).value() : worksheet.getRange(vertice, i).value();

            if (value && typeof value === 'string') {
                key = value;
                break;
            }
        }

        return key;
    }
}