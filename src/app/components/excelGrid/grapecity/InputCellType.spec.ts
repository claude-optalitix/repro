import { InputCellType } from './InputCellType'

describe('InputCellType', () => {

    it('should create', () => {
        const cellType = new InputCellType(new Image(50, 50));
        expect(cellType.typeName).toBe("InputCellType");
        expect(cellType['_img']).not.toBeNull();
    });

    it('should createEditorElement', () => {
        const cellType = new InputCellType(new Image(50, 50));
        var input = cellType.createEditorElement(null);

        expect(input).not.toBeNull();
    });

    it('should getEditorValue', () => {
        const cellType = new InputCellType(new Image(50, 50));
        var input = cellType.getEditorValue({ value: 'toto' });

        expect(input).toBe('toto');
    });

    it('should setEditorValue', () => {
        const cellType = new InputCellType(new Image(50, 50));
        var editor = { value: null };
        cellType.setEditorValue(editor, 'toto');

        expect(editor.value).toBe('toto');
    });
});