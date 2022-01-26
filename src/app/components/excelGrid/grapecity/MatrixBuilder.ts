import * as GC from '@grapecity/spread-sheets';
import * as XLSX from 'xlsx';
import { InputDefinition } from '../../../core/model/InputDefinition';
import { CellHelper } from './CellHelper';
import { LineBuilder } from './LineBuilder';
import { v4 as uuidv4 } from 'uuid';

export class MatrixBuilder extends LineBuilder{
    constructor(workbook: GC.Spread.Sheets.Workbook) {
        super(workbook);
    }

    getDefinitions(address: string, transposed: boolean, keys: {address:string, name:string, keys:any[]}) {
        var meta = this.decomposeAddress(address, transposed);
        const wsn = meta.addressMeta.worksheet.name() + '-';
        const listName = address.substring(0, address.lastIndexOf(':')).replace(/\s+/g, '');

        const items: InputDefinition[] = [{
            id: uuidv4(),
            address: keys.address,
            name: listName + '/' + keys.name.replace(/\s+/g, ''),
            default: keys.keys.map(x => (x.ignored) ? null : (x.override) ? x.override : x.name),
            format: null,
            required: false,
            title: keys.name,
            type: 'String',
            transpose: transposed,

        }];       
        
        for (let i = meta.vertice; i <= meta.verticeEnd; i++) {
            let lineAddress: string;
            if (!transposed) {
                const column = XLSX.utils.encode_col(i);
                lineAddress = `${wsn}${column + (meta.start + 1)}:${column + (meta.end + 1)}`;
            } else {
                lineAddress = `${wsn}${XLSX.utils.encode_col(meta.start)}${(i + 1)}:${XLSX.utils.encode_col(meta.end)}${(i + 1)}`;
            }

            var defaults = this.getLineDefaults(lineAddress, transposed);
            const defaultName = (!transposed) ? 'Col' : 'Row';
            if (!defaults.name) {
                defaults.name = `${defaultName}${i - meta.vertice + 1}`;
            }
            const range = (!transposed)
                ? meta.addressMeta.worksheet.getRange(meta.start, meta.vertice)
                : meta.addressMeta.worksheet.getRange(meta.vertice, meta.start)
                ;
            const lineDefinition: InputDefinition = {
                id: uuidv4(),
                address: lineAddress,
                name: listName + '/' + defaults.name.replace(/\s+/g, ''),
                default: defaults.values,
                format: null,
                required: false,
                title: defaults.name,
                type: CellHelper.processDataType(range),
                transpose: transposed,
            };

            items.push(lineDefinition);
        }

        const matrixDefinition: InputDefinition = {
            id: uuidv4(),
            address: address,
            name: listName,
            default: listName + '/' + keys.name.replace(/\s+/g, ''),
            format: null,
            required: false,
            title: listName,
            type: 'List',
            matrix: true,
            transpose: transposed,
        };

        return { matrix: matrixDefinition, columns: items };
    }

    public getKeys(address: string, transposed: boolean) {
        var meta = this.decomposeAddress(address, transposed);
        if (meta.start == 0)
            throw 'cannot convert into matrix';

        let keyAddress: string = `${meta.addressMeta.worksheet.name()}-`;
        if (!transposed) {
            keyAddress += `${XLSX.utils.encode_col(meta.vertice - 1)}${meta.start + 1}:${XLSX.utils.encode_col(meta.vertice - 1)}${meta.end + 1}`;
        } else {
            keyAddress += `${XLSX.utils.encode_col(meta.start)}${meta.vertice}:${XLSX.utils.encode_col(meta.end)}${meta.vertice}`;
        }

        const values = this.findKeyValues(meta.addressMeta.worksheet, meta.start, meta.end, meta.vertice, transposed);
        if (values.items.filter(x => x != null).length == 0)
            throw 'cannot have empty keys';

        let key = this.findLineName(meta.addressMeta.worksheet, meta.start, values.index, transposed);
        if (!key) {
            key = "Key";
        }

        return { name: key, address: keyAddress, keys: values.items.map(x => { return { name: x, override: null, ignored: x == null }; }) };
    }

    private findKeyValues(worksheet: GC.Spread.Sheets.Worksheet, start: number, end: number, vertice: number, transposed: boolean) {
        let line = vertice - 1;
        let keys: any[];
        while (line >= 0) {
            keys = this.getLineValues(worksheet, start, end, line, transposed);
            if (keys.filter(x => x).length == 0) {
                keys = [];
                line--;
            } else {
                break;
            }
        }

        return { index: line, items: keys };
    }
}
