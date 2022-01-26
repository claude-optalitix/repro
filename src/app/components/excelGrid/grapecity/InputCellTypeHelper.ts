import { InputType } from '../selectedCellEvent';
import * as GC from '@grapecity/spread-sheets';
import * as XLSX from 'xlsx';
import { InputCellType } from './InputCellType';
import html2canvas from 'html2canvas';

export class InputCellTypeHelper {

    private _iconInput: any;
    private _iconOutput: any;
    private _iconValidation: any;
    private _iconValidationMessage: any;
    private _workbook: GC.Spread.Sheets.Workbook;

    constructor(iconInput: any, iconOutput: any, iconValidation: any, iconValidationMessage: any, workbook: GC.Spread.Sheets.Workbook) {

        this._iconInput = iconInput;
        this._iconOutput = iconOutput;
        this._iconValidation = iconValidation;
        this._iconValidationMessage = iconValidationMessage;
        this._workbook = workbook;
    }

    public setCellType(range: GC.Spread.Sheets.CellRange, direction: InputType): void {
        if (direction == InputType.in || direction == InputType.listIn|| direction == InputType.matrixIn) {
            range.cellType(new InputCellType(this._iconInput));
        } else if (direction == InputType.validationCell) {
            range.cellType(new InputCellType(this._iconValidation));
        } else if (direction == InputType.validationMessage) {
            range.cellType(new InputCellType(this._iconValidationMessage));
        } else {
            range.cellType(new InputCellType(this._iconOutput));
        }
    }

    public clearCellType(range: GC.Spread.Sheets.CellRange): void {
        range.cellType(new GC.Spread.Sheets.CellTypes.Base());
    }    

    getRangeDimensions(range: GC.Spread.Sheets.CellRange) {
        let left = 38;
        let width = 0;
        let height = 0;
        let top = 0;

        for (let i = 0; i < range.col; i++) {
            left += range.sheet.getColumnWidth(i);
        }
        for (let i = 0; i < range.row; i++) {
            top += range.sheet.getRowHeight(i);
        }
        for (let i = range.col; i < (range.col + range.colCount); i++) {
            width += range.sheet.getColumnWidth(i);
        }
        for (let i = range.row; i < (range.row + range.rowCount); i++) {
            height += range.sheet.getRowHeight(i);
        }

        return { left, top, width, height };
    }

    async createSnapshot(range: GC.Spread.Sheets.CellRange) {
        const host = this._workbook.getHost();
        let dimensions = { top: 0, left: 0, width: host.clientWidth, height: host.clientHeight };
        if (range) {
            dimensions = this.getRangeDimensions(range);
            if (!(host.clientWidth >= dimensions.width && host.clientHeight >= dimensions.height)) {
                let zoom = 1;

                if (dimensions.height > host.clientHeight) {
                    const pct = dimensions.height / host.clientHeight;
                    zoom = 1 / pct;
                }
                if (dimensions.width > host.clientWidth) {
                    const pct = 1 / (dimensions.width / host.clientWidth);
                    if (pct < zoom) {
                        zoom = pct;
                    }
                }

                range.sheet.zoom(zoom);
                range.sheet.showRow(0, GC.Spread.Sheets.VerticalPosition.nearest);
                range.sheet.showColumn(0, GC.Spread.Sheets.HorizontalPosition.nearest);

                dimensions.height = dimensions.height * zoom;
                dimensions.width = dimensions.width * zoom;
                dimensions.top = dimensions.top * zoom;
                dimensions.left = dimensions.left * zoom;
            }
        }

        var canvas = await html2canvas(host, { x: dimensions.left, y: dimensions.top, width: dimensions.width, height: dimensions.height, logging: false });

        var scrBase64 = canvas.toDataURL('image/png');
        return scrBase64;
    }

    async selectFormView(formArea: string) {
        const range = this.getRange(formArea);

        const img = await this.createSnapshot(range);

        range.setBorder(new GC.Spread.Sheets.LineBorder("red", GC.Spread.Sheets.LineStyle.thick), { outline: true });

       return img;
    }

    public static parseAddress(address: string, workbook: GC.Spread.Sheets.Workbook){

        const idx = address.lastIndexOf("-");
        const sheetname = address.substr(0, (idx)).trim();
        const rangeName = address.substr(idx + 1).trim();

        let worksheet: GC.Spread.Sheets.Worksheet = null;
        for (let s = 0; s < workbook.sheets.length; s++) {

            if (workbook.sheets[s].name() == sheetname) {
                worksheet = workbook.sheets[s];
                break;
            }
        }

       return {worksheet : worksheet, rangeName};
    }
    public getRange(address: string): GC.Spread.Sheets.CellRange {
        
        var addressMeta = InputCellTypeHelper.parseAddress(address, this._workbook);

        let range: GC.Spread.Sheets.CellRange;
        if (addressMeta.rangeName.indexOf(":") >= 0) {
            const parts = addressMeta.rangeName.split(':');
            var coordinates1: XLSX.CellAddress = XLSX.utils.decode_cell(parts[0]);
            var coordinates2: XLSX.CellAddress = XLSX.utils.decode_cell(parts[1]);

            range = addressMeta.worksheet.getRange(coordinates1.r, coordinates1.c, coordinates2.r - coordinates1.r + 1, coordinates2.c - coordinates1.c + 1);
        } else {
            var coordinates: XLSX.CellAddress = XLSX.utils.decode_cell(addressMeta.rangeName);
            range = addressMeta.worksheet.getCell(coordinates.r, coordinates.c);
        }

        return range;
    }
}
