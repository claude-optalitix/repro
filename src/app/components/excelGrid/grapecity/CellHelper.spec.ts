import { CellHelper } from "./CellHelper";
import * as GC from '@grapecity/spread-sheets';

describe('CellHelper', () => {
    it('should processDataType', () => {
        const worksheet = new WorksheetMock("mock");
        const tests = [
            { expected: 'String', value: '', options: undefined },
            { expected: 'String', value: null, options: undefined },
            { expected: 'Number', value: 1, options: undefined },
            { expected: 'Number', value: '1' },
            { expected: 'Date', value: new Date() },
            { expected: 'String', value: '', options: ["A", "B"] },
            { expected: 'Number', value: '', options: ["1", "2"] },
        ];

        for (let index = 0; index < tests.length; index++) {
            const test = tests[index];

            const cell = new CellRangeMock(worksheet, null, null);
            cell._value = test.value;
            var type = CellHelper.processDataType(cell, test.options);
            expect(type).toBe(test.expected);
        }
    });

    it('should parseValue', () => {      

        var date = new Date();
        const tests = [
            { type: 'String', value: '', expected: null },
            { type: 'String', value: 1, expected: '1'},
            { type: 'Number', value: 1, expected: 1.0},
            { type: 'Number', value: '1', expected: 1.0},
            { type: 'Date', value: date, expected: date },
            { type: 'Boolean', value: 1, expected: true },
        ];

        for (let index = 0; index < tests.length; index++) {
            const test = tests[index];          
            var value = CellHelper.parseValue(test.value, test.type);
            expect(value).toBe(test.expected);
        }
    });

});

class WorksheetMock extends GC.Spread.Sheets.Worksheet {
    getFormula(row, col) { return null; }
}

class CellRangeMock extends GC.Spread.Sheets.CellRange {
    _value: any;
    value() { return this._value; }
}
