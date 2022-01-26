import { MatrixBuilder } from './MatrixBuilder'
import * as GC from '@grapecity/spread-sheets';
import * as ExcelIO from '@grapecity/spread-excelio';
import * as rsc from './excel-files.spec'

let workbook = null;

function getWorkbook() {
    return new Promise<GC.Spread.Sheets.Workbook>(resolve => {
        if (workbook == null) {
            var file = rsc.dataURLtoFile('matrix.xlsx', rsc.file64);
            const io = new ExcelIO.IO();
            workbook = new GC.Spread.Sheets.Workbook();
            io.open(file, (json) => {
                workbook.fromJSON(json);
                resolve(workbook);
            });
        } else {
            resolve(workbook);
        }
    });
}

describe('MatrixBuilder', () => {

    it('should getKeys', async () => {
        const workBook = await getWorkbook();
        const cellType = new MatrixBuilder(workBook);
        var keys = cellType.getKeys('Tabelle1-B2:B4', false);
        expect(keys.name).toBe('Employee');
        expect(keys.keys.map(x => x.name).join("|")).toBe('Foo|Bar|Baz');
    });

    it('should getLineDefaults', async () => {
        const workBook = await getWorkbook();
        const builder = new MatrixBuilder(workBook);

        var keys = builder.getLineDefaults('Tabelle1-A2:A4', false);
        expect(keys.name).toBe('Employee');
        expect(keys.values.join("|")).toBe('Foo|Bar|Baz');
    });

    it('should getDefinitions', async () => {
        const workBook = await getWorkbook();
        const builder = new MatrixBuilder(workBook);
        var actual = builder.getDefinitions('Tabelle1-B2:B4', false, { name: 'Employee', address: 'Tabelle1-A2:A4', keys: [{ name: 'Foo' }, { name: 'Bar' }, { name: 'Baz' }] });
        const expected = {
            matrix: { id: '', address: 'Tabelle1-B2:B4', name: 'Tabelle1-B2', default: 'Tabelle1-B2/Employee', required: false, title: 'Tabelle1-B2', type: 'List', matrix: true, transpose: false, format: null },
            columns: [
                { id: '', address: 'Tabelle1-A2:A4', name: 'Tabelle1-B2/Employee', default: ['Foo', 'Bar', 'Baz'], required: false, title: 'Employee', type: 'String', transpose: false, format: null },
                { id: '', address: 'Tabelle1-B2:B4', name: 'Tabelle1-B2/Age', default: [20, 34, 32], required: false, title: 'Age', type: 'Number', transpose: false, format: null },
            ]
        };
        expected.matrix.id = actual.matrix.id;
        for (let index = 0; index < actual.columns.length; index++)
            expected.columns[index].id = actual.columns[index].id;

        expect(actual.matrix).toEqual(expected.matrix);
        expect(actual.columns).toEqual(expected.columns);
    });
});
