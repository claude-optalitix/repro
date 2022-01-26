import * as GC from '@grapecity/spread-sheets';

export class InputCellType extends GC.Spread.Sheets.CellTypes.Base {

    private _img: any;

    constructor(img) {
        super();

        this.typeName = "InputCellType";
        this._img = img;
    }

    paint(ctx: CanvasRenderingContext2D, value: any, x: number, y: number, w: number, h: number, style: GC.Spread.Sheets.Style, context?: any): void {
        if (!ctx)
            return;

        ctx.save();

        // draw inside the cell's boundary
        ctx.rect(x, y, w, h);
        ctx.clip();

        // draw text
        super.paint(ctx, value, x + 20, y, w - 20, h, style, context);
        ctx.beginPath();

        ctx.drawImage(this._img.nativeElement, x + 2, y + 2, 16, 16);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    };

    createEditorElement(_context) {
        var input = document.createElement("input");
        return input;
    };

    getEditorValue(editorContext) {
        if (editorContext) {
            return editorContext.value;
        }
    };

    setEditorValue(editorContext, value) {
        if (editorContext) {
            editorContext.value = value;
        }
    }
}