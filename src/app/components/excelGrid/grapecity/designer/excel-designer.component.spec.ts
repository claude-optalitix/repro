import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Logger } from '../../../../core/service/Logger';
import { RuntimeConfiguration } from '../../../../core/configuration/RuntimeConfiguration';
import { ExcelDesignerComponent } from './excel-designer.component';
import { DesignerModule } from '@grapecity/spread-sheets-designer-angular';
import * as GC from '@grapecity/spread-sheets';
import { InputType, SelectedCellEvent } from '../../selectedCellEvent';
import { InputCellTypeHelper } from '../InputCellTypeHelper';
import { FormsModule } from '@angular/forms';
import * as ExcelIO from '@grapecity/spread-excelio';
import * as rsc from '../excel-files.spec'

describe('ExcelDesignerComponent', () => {
  let component: ExcelDesignerComponent;
  let fixture: ComponentFixture<ExcelDesignerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, DesignerModule],
      providers: [
        { provide: RuntimeConfiguration, useValue: { apiUrl: "", logLevel: null } },
        Logger
      ],
      declarations: [ExcelDesignerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should normalizeName', () => {

    const tests = {
      "a": "a",
      "a/a": "aa",
      "a a ": "aa",
    };
    for (const key in tests) {
      if (Object.prototype.hasOwnProperty.call(tests, key)) {
        var actual = component.normalizeName(key);
        const expected = tests[key];
        expect(expected).toBe(actual);

      }
    }
  });

  it('should parseListInput', () => {
    const worksheet = new WorksheetMock("mock");
    const workbook = new WorkbookMock();
    workbook.mockedActiveSheet = worksheet;
    const cell = new RangeMock(1, 1, 1, 1);
    var tests = [
      {
        readOnly: false,
        start: "top",
        expecteds: [
          { type: 2, meta: { id: '', address: 'mock-B2:B2', name: 'mock-B2', default: null, format: null, required: false, title: 'mock - B2', type: 'List', maxItems: 1, originalType: 'List', transpose: false, options: null } },
          { type: 2, meta: { id: '', address: 'mock-B2:B2', name: 'mock-B2/mock-B2', title: 'mock - B2', default: null, type: 'String', required: false, format: null, maxItems: null, originalType: 'String', options: null, transpose: false } },
        ]
      },
      {
        readOnly: true,
        start: "left",
        expecteds: [
          { type: 2, meta: { id: '', address: 'mock-B2:B2', name: 'mock-B2', default: null, format: null, required: false, title: 'mock - B2', type: 'List', maxItems: 1, originalType: 'List', transpose: false, options: null } },
          { type: 2, meta: { id: '', address: 'mock-B2:B2', name: 'mock-B2/mock-B2', title: 'mock - B2', default: null, type: 'String', required: false, format: null, maxItems: null, originalType: 'String', options: null, transpose: false } },
        ]
      }
    ];

    spyOn(component.selectedCell, 'emit');
    fixture.detectChanges();

    for (let index = 0; index < tests.length; index++) {
      const test = tests[index];

      component.mode = test.readOnly ? 'readonly' : 'default';
      component['workBook'] = workbook;
      var hlper = new InputCellTypeHelper(null, null, null, null, workbook);
      hlper.setCellType = function (range: GC.Spread.Sheets.CellRange, direction: InputType) { };
      hlper.getRange = function (address: string) { return null };
      component['_inputCellTypeHelper'] = hlper;

      component.parseListInput(test.start as any, InputType.listIn, cell);

      var events = new Array<SelectedCellEvent>();
      let calls: [] = (component.selectedCell.emit as any).calls.all();
      for (let index = 0; index < calls.length; index++) {
        const call = calls[index] as any;
        events.push(call.args[0] as SelectedCellEvent);
      }

      expect(component.selectedCell.emit).toHaveBeenCalledTimes(2 * (index + 1));

      for (let index = 0; index < test.expecteds.length; index++) {
        const expected = test.expecteds[index];        
        const actual = events[index];
        expected.meta.id = actual.meta.id;//id are randoms so we dont check them
        expect({ ...actual }).toEqual({ ...expected });
      }
    }
  });

  it('should cleanName', () => {
    const tests = {
      "hello": "hello",
      "hel-lo": "hel_lo",
      "hel.lo": "hel_lo",
      "hel lo": "hel lo",
    };

    Object.entries(tests).forEach(([key, asExpected]) => {
      const result = component.cleanName(key);

      expect(result).toBe(asExpected, { key, asExpected, result });
    });
  });

  it('should getCellName', () => {
    const tests = {
      "hello": "hello - A2",
      "hel-lo": "hel_lo - A2",
      "hel.lo": "hel_lo - A2",
      "hel lo": "hel lo - A2",
    };

    Object.entries(tests).forEach(([key, asExpected]) => {
      const sheet = new WorksheetMock(key);

      const result = component.getCellName(sheet, 0, 1);

      expect(result).toBe(asExpected, { key, asExpected, result });
    });
  });

  it('should getCellAddress', () => {
    const tests = {
      "hello": "hello-A2",
    };

    Object.entries(tests).forEach(([key, asExpected]) => {
      const sheet = new WorksheetMock(key);
      const result = component.getCellAddress(sheet, 0, 1);

      expect(result).toBe(asExpected, { key, asExpected, result });
    });
  });

  it('should selectCells', () => {
    var sheets = {
      "S1": new WorksheetMock("S1"),
      "S2": new WorksheetMock("S2"),
    }
    const workbook = new WorkbookMock();
    workbook.mockedActiveSheet = sheets["S1"];
    workbook.setActiveSheet = function (name: string) {
      workbook.mockedActiveSheet = sheets[name];
    };

    component['workBook'] = workbook;

    const tests = [
      { inputs: { target: InputType.in, cells: [{ columnName: "A", row: 0 }], name: null, start: undefined }, expected: { target: InputType.in, start: "top" } },
      { inputs: { target: InputType.out, cells: [{ columnName: "A", row: 0 }], name: null, start: "left" }, expected: { target: InputType.out, start: "left" } },
      { inputs: { target: InputType.out, cells: [{ columnName: "A", row: 0 }], name: "S2", start: "left" }, expected: { target: InputType.out, start: "left" } },
      { inputs: { target: InputType.validationCell, cells: [{ columnName: "A", row: 0 }], name: "S2", start: undefined }, expected: { target: InputType.validationCell, start: "top" } },
      { inputs: { target: InputType.validationMessage, cells: [{ columnName: "A", row: 0 }], name: "S2", start: undefined }, expected: { target: InputType.validationMessage, start: "top" } },
    ];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];

      let result = null;
      component.parseSelectedCells = function (target: InputType, start) {
        result = { target, start };
      }

      component.selectCells(test.inputs.target, test.inputs.cells, test.inputs.name, test.inputs.start as any);

      //throw JSON.stringify({ test, result });
      expect(result).toEqual(test.expected, { test, result });
    }

  });

  it('should parseMatrix', async () => {
    var file = rsc.dataURLtoFile('matrix.xlsx', rsc.file64);
    const io = new ExcelIO.IO();

    var tests = [
      {
        readOnly: false,
        start: "top",
        expecteds: [
          { type: 4, meta: {id: '', address: 'Tabelle1-B2:B4', name: 'Tabelle1-B2', default: 'Tabelle1-B2/Employee' , format: null, required: false, title: 'Tabelle1-B2', type: 'List', matrix: true, transpose: false,/* options: null, maxItems: null*/ keys: [{ name: 'Foo', override: null, ignored: false }, { name: 'Bar', override: null, ignored: false }, { name: 'Baz', override: null, ignored: false }] } },
          { type: 4, meta: {id: '', address: 'Tabelle1-A2:A4', name: 'Tabelle1-B2/Employee', title: 'Employee', default: ['Foo', 'Bar' ,'Baz'], type: 'String', format: null, required: false, transpose: false } },
          { type: 4, meta: {id: '', address: 'Tabelle1-B2:B4', name: 'Tabelle1-B2/Age', title: 'Age', default: [20, 34, 32], type: 'Number', required: false, format: null, transpose: false } },
        ]
      }
    ];

    spyOn(component.selectedCell, 'emit');
    fixture.detectChanges();

    await new Promise<void>(resolve => {

      io.open(file, (json) => {
        const workbook: GC.Spread.Sheets.Workbook = new GC.Spread.Sheets.Workbook();
        workbook.fromJSON(json);

        for (let index = 0; index < tests.length; index++) {
          const test = tests[index];

          component.mode = test.readOnly ? 'readonly' : 'default';
          component['workBook'] = workbook;
          var hlper = new InputCellTypeHelper(null, null, null, null, workbook);

          component['_inputCellTypeHelper'] = hlper;

          const cell = hlper.getRange('Tabelle1-B2:B4');
          component.parseMatrix(test.start, InputType.matrixIn, new GC.Spread.Sheets.Range(cell.row, cell.col, cell.rowCount, cell.colCount));

          var events = new Array<SelectedCellEvent>();
          let calls: [] = (component.selectedCell.emit as any).calls.all();
          for (let index = 0; index < calls.length; index++) {
            const call = calls[index] as any;
            events.push(call.args[0] as SelectedCellEvent);
          }

          expect(component.selectedCell.emit).toHaveBeenCalledTimes(2 * (index + 1)+1);

          for (let index = 0; index < test.expecteds.length; index++) {
            const expected = test.expecteds[index];
            const actual = events[index];
            expected.meta.id = actual.meta.id; // id random set so we dont check

            expect({ ...actual }).toEqual({ ...expected });
          }
        }

        resolve();
      });
    });
  });
});

class WorksheetMock extends GC.Spread.Sheets.Worksheet {
  getFormula(row, col) { return null; }
}

class WorkbookMock extends GC.Spread.Sheets.Workbook {
  mockedActiveSheet: WorksheetMock;
  getActiveSheet() { return this.mockedActiveSheet; }
}

class RangeMock extends GC.Spread.Sheets.Range { }
