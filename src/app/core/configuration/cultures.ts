import * as GC from '@grapecity/spread-sheets';

export class Cultures {
    custom = {};
    constructor() {
        var myCulture = new GC.Spread.Common.CultureInfo();
        myCulture.NumberFormat.currencySymbol = "£"
        myCulture.DateTimeFormat.amDesignator = "AM";
        myCulture.DateTimeFormat.pmDesignator = "PM";
        (myCulture.DateTimeFormat as any).defaultDatePattern = "dd/MM/yyyy HH:mm:ss";
        (myCulture.DateTimeFormat as any).dateSeparator = "/"
        myCulture.DateTimeFormat.fullDateTimePattern = "dddd, d. MMMM yyyy HH:mm:ss";
        myCulture.DateTimeFormat.longDatePattern = "dddd, d. MMMM yyyy";
        myCulture.DateTimeFormat.longTimePattern = "HH:mm:ss";
        myCulture.DateTimeFormat.monthDayPattern = "dd MMMM";
        myCulture.DateTimeFormat.shortDatePattern = "dd/MM/yyyy";
        myCulture.DateTimeFormat.shortTimePattern = "HH:mm";
        myCulture.DateTimeFormat
        myCulture.DateTimeFormat.yearMonthPattern = "MMMM yyyy";
        myCulture.LocalNumberFormat = { 14: "dd/MM/yyyy" };     
        (myCulture as any).id = 2057;

        this.custom['en-gb'] = myCulture;
    }

    public getCustomCulture(key: string): GC.Spread.Common.CultureInfo {
        var defaultCulture = new GC.Spread.Common.CultureInfo();//GC.Spread.Common.CultureManager.getCultureInfo('en-us');
        var customCulture = this.custom[key];
        if (!customCulture)
            return null;
        return Object.assign(defaultCulture, customCulture);
    }
}