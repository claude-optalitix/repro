import * as GC from '@grapecity/spread-sheets';

export class CellHelper {

    public static processDataType(cell: GC.Spread.Sheets.CellRange, options: Array<object> = null): string {
        let value = cell.value();
        if (options && options.length > 0)
            value = options[0];

        let format: string = cell.formatter()?.toLowerCase();
        if (format == "general") {
            format = null;
        }

        let type = '';
        if (value === '' || (value == null && format == null) || format == '@') {
            return 'String';
        }
        if (typeof value === "boolean") {
            return 'Boolean';
        }
        if (!isNaN(value) && !(value instanceof Date)) {
            type = 'Number';
        } else {
            if (value instanceof Date || (format && format.indexOf('y') > -1 && format.indexOf('m') > -1 && format.indexOf('d') > -1)) {
                type = 'Date';
            } else if (new RegExp(/^\d+$/, 'gm').test(value)) {
                type = 'Number';
            } else {
                type = 'String';
            }
        }

        if (options && options.length > 0) {
            for (let i = 0; i < options.length; i++) {
                options[i] = CellHelper.parseValue(options[i], type);
            }
        }

        return type;
    }

    public static parseValue(value: any, type: string) {

        switch (type) {
            case 'Percent':
            case 'Number': {
                return parseFloat(value);
            }
            case 'String': {
                if (!value || value == '') {
                    return null;
                }
                return value.toString();
            }
            case 'Date': {
                return value;
            }
            case 'Boolean': {
                if (typeof (value) === 'string') {
                    value = value.trim().toLowerCase();
                }
                switch (value) {
                    case true:
                    case "true":
                    case 1:
                    case "1":
                        return true;
                    default:
                        return false;
                }
            }
            default:
                throw new Error("Unsupported type '" + type + "'");
        }
    }
}