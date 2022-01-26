import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { SelectedCellEvent, InputType } from '../../selectedCellEvent';
import { ChangedCellData, Dimensions, ExcelGridComponent, SelectedCellData } from '../../excelGridComponent';
import { InputDefinition } from '../../../../core/model/InputDefinition';
import { RuntimeConfiguration } from '../../../../core/configuration/RuntimeConfiguration';
import * as ExcelIO from '@grapecity/spread-excelio';
import * as XLSX from 'xlsx';
import { MatrixBuilder } from '../MatrixBuilder';
import { CellHelper } from '../CellHelper';
import { Logger } from '../../../../core/service/Logger';
import { Cultures } from '../../../../core/configuration/cultures';
import { EditorFeature, ModelDefinition } from '../../../../core/model/ModelFile';
import { InputCellTypeHelper } from '../InputCellTypeHelper';
import * as GC from '@grapecity/spread-sheets';
import '@grapecity/spread-sheets-charts';
import '@grapecity/spread-sheets-designer-resources-en';
import '@grapecity/spread-sheets-designer';
import { v4 as uuidv4 } from 'uuid';
window["GC"] = GC;

@Component({
  selector: 'excel-designer',
  templateUrl: './excel-designer.component.html',
  styleUrls: ['./excel-designer.component.scss'],
})
export class ExcelDesignerComponent extends ExcelGridComponent implements OnInit {

  private static excelIO = new ExcelIO.IO();

  private _previousSchema: ModelDefinition;
  private _inputCellTypeHelper: InputCellTypeHelper;
  private _encodedFile: string;

  @Input()
  public props: any;
  @Input()
  public mode: 'readonly' | 'area' | 'default' | 'area-readonly' | 'form-readonly' | 'edit-default' = 'default';
  @Input()
  public restrictedFeatures: EditorFeature[] = [];
  @Output()
  public selectedCell = new EventEmitter<SelectedCellEvent>();
  @Output()
  public workbookReady = new EventEmitter<boolean>();
  @Output()
  public getDimensions = new EventEmitter<Dimensions>();
  @Output()
  public snapshot = new EventEmitter<string>();
  @Output()
  public focusedCellData = new EventEmitter<SelectedCellData>();
  @Output()
  public changedCellData = new EventEmitter<ChangedCellData>();

  @ViewChild('iconIn')
  public iconIn: any;
  @ViewChild('iconOut')
  public iconOut: any;
  @ViewChild('iconValidation')
  public iconValidation: any;
  @ViewChild('iconValidationMessage')
  public iconValidationMessage: any;

  public finalData = {};
  public sheets = {};
  public sheetNames = [];
  public activeSheet = '';
  public fileData = null;
  public expandedItem = '';
  public sheetData = [];
  title = 'spreadjs-angular-app';

  rowOutlineInfo: any;
  showRowOutline = true;
  private workBook: GC.Spread.Sheets.Workbook;

  constructor(private _logger: Logger, private _runtime: RuntimeConfiguration) {
    super();
    if (this._runtime.grapecityDesignerLicense && this._runtime.grapecityDesignerLicense != '') {
      this._logger.debug('setting license');

      GC.Spread.Sheets.LicenseKey = (ExcelIO as any).LicenseKey = this._runtime.grapecityLicense;
      (GC.Spread.Sheets as any).Designer.LicenseKey = this._runtime.grapecityDesignerLicense;
    }

    const customCulture: GC.Spread.Common.CultureInfo = new Cultures().getCustomCulture(_runtime.locale);
    if (customCulture) {
      GC.Spread.Common.CultureManager.addCultureInfo(_runtime.locale, customCulture);
      GC.Spread.Common.CultureManager.culture(_runtime.locale);
    } else {
      _logger.debug('no custom culture found for ' + _runtime.locale);
    }

    _logger.debug(`current culture ${GC.Spread.Common.CultureManager.culture()}`, GC.Spread.Common.CultureManager.getCultureInfo(GC.Spread.Common.CultureManager.culture()));
  }

  ngOnInit(): void {
    this.props = {
      styleInfo: "width: 100%; height: 100%", config: this.getConfig()
    };

  }

  public initFormArea(formArea: string) {
    const range = this._inputCellTypeHelper.getRange(formArea);
    const sheet = range.sheet;

    for (let index = 0; index < this.workBook.getSheetCount(); index++) {
      const element = this.workBook.getSheet(index);
      if (sheet.name() == element.name()) {
        this.workBook.setActiveSheetIndex(index);
        this._logger.debug('activating', sheet.name());
        continue;
      }
      element.visible(false);
    }
    // Hide column headers.
    sheet.options.colHeaderVisible = false;
    sheet.options.rowHeaderVisible = false;
    range.setBorder(new GC.Spread.Sheets.LineBorder(), { outline: true });
    this.hideCells(range.col, range.col + range.colCount, sheet.getColumnCount(), (index: number) => sheet.setColumnVisible(index, false));
    this.hideCells(range.row, range.row + range.rowCount, sheet.getRowCount(), (index: number) => sheet.setRowVisible(index, false));

    sheet.frozenColumnCount(range.col);
    sheet.frozenTrailingColumnCount(0, true);
    sheet.frozenRowCount(range.row);
    sheet.frozenTrailingRowCount(0, true);

    this.resize();
  }

  private hideCells(start: number, end: number, max: number, hidingAction: (index: number) => void): void {
    if (start >= 1) {
      for (let index = 0; index < start; index++) {
        hidingAction(index);
      }
    }

    if (max > end) {
      for (let index = end; index <= max; index++) {
        hidingAction(index);
      }
    }
  }

  getConfig() {

    this._logger.debug('designer mode', this.mode);
    var config = (GC.Spread.Sheets as any).Designer.DefaultConfig;

    // add custom command too
    let commandMap = config.commandMap;
    if (!config.commandMap) {
      commandMap = config.commandMap = {};
    }
    config.contextMenu = [];

    this._logger.debug('context menu configured.', { commandMap, readOnly: this.mode == 'readonly' || this.mode == 'area-readonly' || this.mode == 'form-readonly' });

    return config;
  }

  public setFormArea(address: string): Promise<string> {
    if (this.formArea) {
      var old = this._inputCellTypeHelper.getRange(this.formArea);
      old.setBorder(new GC.Spread.Sheets.LineBorder(), { outline: true });
    }

    if (address == this.formArea || address == null) {
      this.formArea = null;
      return new Promise((resolve, reject) => { resolve(null); });
    } else {
      this.formArea = address;
      return this._inputCellTypeHelper.selectFormView(this.formArea);
    }
  }
  private selectFormView(): Promise<string> {
    const worksheet = this.workBook.getActiveSheet();
    const form: GC.Spread.Sheets.Range = worksheet.getSelections()[0];

    const sheetName = worksheet.name();
    const startColumn = XLSX.utils.encode_col(form.col);
    const endColumn = XLSX.utils.encode_col(form.col + form.colCount - 1);

    const areaAddress = `${sheetName}-${startColumn}${(form.row + 1)}:${endColumn}${form.row + form.rowCount}`;

    return this.setFormArea(areaAddress);
  }

  async handleFileInput(file: File, previousSchema: ModelDefinition) {
    const context = this;
    context._logger.debug('file', file);

    var fileTask = new Promise<string>(resolve => {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function () {
        var base64data = reader.result as string;

        context._logger.debug('file64 converted');
        resolve(base64data);
      }
    });

    this.loadingData = true;
    this._previousSchema = previousSchema;

    while (!this.workBook) { //waiting for initSpread to occur
      await this.delay(100);
    }

    this._inputCellTypeHelper = new InputCellTypeHelper(this.iconIn, this.iconOut, this.iconValidation, this.iconValidationMessage, this.workBook);

    this.workBook.suspendCalcService();
    this.workBook.suspendEvent();
    this.workBook.suspendPaint();
    this.workBook.options.calcOnDemand = true;    
    ExcelDesignerComponent.excelIO.open(file, async (json) => {
      this._logger.debug('Loading json', json);

      var filePromise = new Promise<void>(() => {
        this.workBook.fromJSON(json);

        this.loadedData = true;
        this._logger.debug('file loaded');

        var config = (GC.Spread.Sheets as any).Designer.DefaultConfig;
        if (this.mode == 'readonly') {
          config.ribbon = [];
          config.sidePanels = [{ position: "bottom", command: "statusBarPanel", uiTemplate: "statusBarPanelTemplate" }];
        } else if (this.mode == 'default' || this.mode == 'edit-default') {
          config.fileMenu = "none";
        } else if (this.mode == 'area-readonly' || this.mode == 'form-readonly') {
          config.ribbon = [];
          config.sidePanels = [];
          config.fileMenu = "none";
        } else {
          config.ribbon = [];
          config.sidePanels = [];
          config.fileMenu = "none";
        }
        this.ngOnInit();

        if (this.mode == 'readonly' || this.mode == 'form-readonly' || this.mode == 'edit-default') {
          this._logger.debug('readonly mode.');

          this.workBook.options.newTabVisible = false;
          this.workBook.options.tabEditable = false;
        } else if (this.mode == 'area' || this.mode == 'area-readonly') {
          this.workBook.options.newTabVisible = false;
          this.workBook.options.tabEditable = false;
          this.workBook.options.tabStripVisible = false;
          this.workBook.options.tabNavigationVisible = false;
          this.workBook.options.grayAreaBackColor = '#f5f6fa';

          //scrollbar options
          this.workBook.options.scrollbarMaxAlign = true;
          this.workBook.options.scrollIgnoreHidden = true;
          this.workBook.options.scrollbarAppearance = 1;  // 0 - excel like, 1 - slim
          this.workBook.options.showVerticalScrollbar = false;
          this.workBook.options.showHorizontalScrollbar = false;
          this.workBook.options.allowUserResize = false;
        }

        for (let i = 0; i < this.workBook.sheets.length; i++) {
          const spreadSheet = this.workBook.sheets[i];
          if (this.mode == 'readonly' || this.mode == 'area-readonly' || this.mode == 'form-readonly') {
            spreadSheet.options.isProtected = true;
          }
          spreadSheet.charts.preserveUnsupportedChart(true);
        }

        if (this._previousSchema) {
          this.loadPreviousSchema();
        }

        // Setup the context menu
        this.setupContextMenu();

        this.resize();

        this.workBook.bind(GC.Spread.Sheets.Events.CellClick, null, (event) => {
          if (this.focusedCellData) {
            const worksheet = this.workBook.getActiveSheet();
            const selection = worksheet.getSelections()[0];

            let range = '';
            if (selection.colCount > 1 || selection.rowCount > 1) {
              range = ':' + XLSX.utils.encode_col(selection.col + selection.colCount - 1) + (selection.row + selection.rowCount);
            }

            let name = XLSX.utils.encode_col(selection.col) + (selection.row + 1);
            this.focusedCellData.emit({ name: `${worksheet.name()}-${name}${range}`, data: { worksheet, selection } });
          }
        });
        this.workBook.bind(GC.Spread.Sheets.Events.CellChanged, null, (event: any, info: any) => {
          if (info.propertyName === 'value' && this.changedCellData) {
            this.changedCellData.emit({
              cellAddress: this.getCellAddress(this.workBook.getActiveSheet(), info.col, info.row),
              meta: info,
              name: this.getCellName(this.workBook.getActiveSheet(), info.col, info.row),
              workbook: this.workBook,
            });
          }
        });

        this.workbookReady.emit(true);
      });

      this._encodedFile = await fileTask;
      context._logger.debug('file64', this._encodedFile ? this._encodedFile.substr(0, 25) + '...' : null);
      await filePromise;

    }, (error) => {
      this._logger.error('Unable to load file', error)
    });
  }

  private setupContextMenu() {
    if (this.mode == 'readonly' || this.mode == 'edit-default') {
      const menuContext: GC.Spread.Sheets.ContextMenu.IMenuItemData[] = this.mode == 'edit-default' ? this.workBook.contextMenu.menuData : [];
      let restrictedFeatures = this.restrictedFeatures || [];
      // let restrictedFeatures = [EditorFeature.InputTables, EditorFeature.OutputTables, EditorFeature.InputSingles];

      if (!restrictedFeatures.includes(EditorFeature.InputSingles)) {
        if (!restrictedFeatures.includes(EditorFeature.InputTables)) {
          menuContext.push({
            text: 'Inputs',
            name: 'inputOptions',
            iconClass: 'custom-menuitem-icon menuitem-input-single',
            workArea: 'Viewport',
            subMenu: [
              {
                text: 'Select as an Input',
                name: 'inputCells',
                iconClass: 'custom-menuitem-icon menuitem-input-single',
                command: () => {
                  this.parseSelectedCells(InputType.in, 'top');
                },
                workArea: 'Viewport',
              },
              {
                text: 'Select as Input Table',
                name: 'inputTable',
                iconClass: 'custom-menuitem-icon',
                command: () => {
                  this.parseSelectedCells(InputType.listIn, 'top');
                },
                workArea: 'Viewport',
              },
            ],
          });
        } else {
          menuContext.push({
            text: 'Select as an Input',
            name: 'selectAsAnInput',
            iconClass: 'custom-menuitem-icon menuitem-input-single',
            command: () => {
              this.parseSelectedCells(InputType.in, 'top');
            },
            workArea: 'Viewport',
          });
        }
      }

      if (!restrictedFeatures.includes(EditorFeature.OutputSingles)) {
        if (!restrictedFeatures.includes(EditorFeature.OutputTables)) {
          menuContext.push({
            text: 'Outputs',
            name: "ouputOptions",
            iconClass: 'custom-menuitem-icon menuitem-output-single',
            workArea: 'Viewport',
            subMenu: [
              {
                text: 'Select as an Output',
                name: "outputCells",
                iconClass: 'custom-menuitem-icon menuitem-output-single',
                command: () => {
                  this.parseSelectedCells(InputType.out, "top");
                },
                workArea: 'Viewport',
              },
              {
                text: 'Select as Output Table',
                name: "outputTable",
                iconClass: 'custom-menuitem-icon',
                command: () => {
                  this.parseSelectedCells(InputType.listOut, "top");
                },
                workArea: 'Viewport',
              },
            ]
          });
        } else {
          menuContext.push({
            text: 'Select as an Output',
            name: 'selectAsAnOutput',
            iconClass: 'custom-menuitem-icon menuitem-output-single',
            command: () => {
              this.parseSelectedCells(InputType.out, 'top');
            },
            workArea: 'Viewport',
          });
        }
      }

      if (!restrictedFeatures.includes(EditorFeature.FormView)) {
        menuContext.push({
          text: 'Form View Options',
          name: 'formViewOptions',
          iconClass: 'custom-menuitem-icon menuitem-formview-options',
          workArea: 'Viewport',
          subMenu: [
            {
              text: 'Select Form Area',
              name: 'selectFormArea',
              iconClass: 'custom-menuitem-icon menuitem-formview-area',
              command: () => {
                this.selectFormView().then((image) => {
                  this.snapshot.emit(image);
                });
              },
              workArea: 'Viewport',
            },
            {
              text: 'Select Validation Cell',
              name: 'selectValidationCell',
              iconClass: 'custom-menuitem-icon menuitem-validation-cell',
              command: () => {
                this.parseSelectedCells(InputType.validationCell, 'top');
              },
              workArea: 'Viewport',
            },
            {
              text: 'Select Validation Message Cell',
              name: 'selectValidationMessageCell',
              iconClass: 'custom-menuitem-icon menuitem-validation-message',
              command: () => {
                this.parseSelectedCells(InputType.validationMessage, 'top');
              },
              workArea: 'Viewport',
            },
          ],
        });
      }

      if (menuContext.length > 0) {
        // override the context menu, you can use menuData.push() to append with default context menu
        this.workBook.contextMenu.menuData = menuContext;
        document.getElementById('vp_vp').oncontextmenu = (e) => {
          document.documentElement.style.setProperty('--contextmenu-left', (e.x + 196) + 'px');
        };
      } else {
        this.workBook.options.allowContextMenu = false;
        document.getElementById('vp_vp').oncontextmenu = (e) => {
          e.preventDefault();
          e.stopPropagation();
        };
      }
    } else {
      this.workBook.options.allowContextMenu = false;
      document.getElementById('vp_vp').oncontextmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };
    }
  }

  worbookInitDone() {
    this.workBook.resumeCalcService();
    this.workBook.resumeEvent();
    this.workBook.resumePaint();
  }

  resize() {
    if (this.getDimensions) {
      const sheet = this.workBook.getActiveSheet();
      var host = this.workBook.getHost();

      let startColumn = 0;
      let endColumn = sheet.getColumnCount();
      let startRow = 0;
      let endRow = sheet.getRowCount();

      if (this.formArea) {
        const area = this.formArea.substring(this.formArea.lastIndexOf('-') + 1);
        const parts = area.split(':');

        const start = parts[0].match(/([A-z])(\d+)/);
        const end = parts[1].match(/([A-z])(\d+)/);

        startColumn = XLSX.utils.decode_col(start[1]);
        endColumn = XLSX.utils.decode_col(end[1]) + 1;
        startRow = parseInt(start[2]) - 1;
        endRow = parseInt(end[2]);
      }

      let totalColumWidth = 0;
      let leftWidth = 0;

      for (let index = 0; index < endColumn; index++) {
        var size = sheet.getCellRect(startRow, index).width;
        if (!size) {
          size = sheet.getColumnWidth(index);
        }
        if (index < startColumn) {
          leftWidth += size;
        } else {
          totalColumWidth += size;
        }
      }

      let totalRowHeight = 0;
      let topHeight = 0;
      for (let index = 0; index < endRow; index++) {
        let size = sheet.getCellRect(index, startColumn).height;
        if (!size) {
          size = sheet.getRowHeight(index);

        }
        if (size == undefined) {
          size = sheet.getCell(index, startColumn).height();
        }
        if (!size) {
          size = 25;
        }
        if (index < startRow) {
          topHeight += size;
        } else {
          totalRowHeight += size;
        }
      }

      const viewportWidth = sheet.getViewportWidth(1);
      const viewportHeight = sheet.getViewportHeight(1);

      const height = host.getBoundingClientRect().height;
      const width = host.getBoundingClientRect().width;

      var event = {
        workbook: this.workBook,
        mode: this.mode,
        host: { height, width },
        viewport: { height: viewportHeight, width: viewportWidth },
        total: { height: totalRowHeight, width: totalColumWidth },
        start: { x: leftWidth, y: topHeight, },
        end: { x: leftWidth + totalColumWidth, y: topHeight + totalRowHeight, },
      };

      this._logger.debug('resize', event);

      const pictures = sheet.pictures.all()
      for (let index = 0; index < pictures.length; index++) {
        const picture = pictures[index];
        const x = picture.x();
        const y = picture.y();
        if ((x < event.start.x || x >= event.end.x) || (y < event.start.y || y >= event.end.y)) {
          this._logger.debug('delete picture', { x, y, picture });

          sheet.pictures.remove(picture.name());
        }

      }

      this.getDimensions.emit(event);
    }
  }

  parseSelectedCells(direction: InputType, start: "top" | "left" = "top") {
    // const workBook = this.workBook;
    const t: GC.Spread.Sheets.Range[] = this.workBook
      .getActiveSheet()
      .getSelections();

    const range = t[t.length - 1];
    switch (direction) {
      case InputType.in:
      case InputType.out:
        {
          this.parseInput(direction, range);
        }
        break;
      case InputType.listIn:
      case InputType.listOut:
        {
          this.parseListInput(start, direction, range);
        }
        break;
      case InputType.matrixIn:
      case InputType.matrixOut:
        {
          this.parseMatrix(start, direction, range);
        }
        break;
      case InputType.validationCell:
      case InputType.validationMessage:
        {
          this.parseInput(direction, range);
        }
        break;
      default:
        throw new Error('Unhandled value --> ' + direction);
    }
  }
  parseMatrix(direction: string, type: InputType, range: GC.Spread.Sheets.Range) {

    const transposed = (direction == 'left');

    const builder = new MatrixBuilder(this.workBook);
    let address = XLSX.utils.encode_col(range.col) + (range.row + 1) + ':' + XLSX.utils.encode_col(range.col + range.colCount - 1) + (range.row + range.rowCount);

    var sheet = this.workBook.getActiveSheet();
    address = sheet.name() + '-' + address;
    var keyItems = builder.getKeys(address, transposed);
    var definitions = builder.getDefinitions(address, transposed, keyItems);
    definitions.matrix.keys = keyItems.keys;

    if (this.mode == 'readonly' || this.mode == 'edit-default')
      this._inputCellTypeHelper.setCellType(sheet.getRange(range.row, range.col, range.rowCount, range.colCount), type);

    this.selectedCell.emit({
      type: type,
      meta: definitions.matrix
    });
    //todo add key columns
    for (let index = 0; index < definitions.columns.length; index++) {
      const element = definitions.columns[index];
      this.selectedCell.emit({
        type: type,
        meta: element
      });
    }
  }

  parseInput(direction: InputType, range: GC.Spread.Sheets.Range) {
    const workBook = this.workBook;
    const workSheet = workBook.getActiveSheet();
    const spans = workSheet.getSpans();

    for (let r = range.row; r < range.row + range.rowCount; r++) {
      const rowIndex = r;
      for (let c = range.col; c < range.col + range.colCount; c++) {
        const columnIndex = c;
        const cell = workSheet.getCell(rowIndex, columnIndex);

        if (this.isMergedCell(cell, spans)) {
          continue;
        }
        const address = this.getCellAddress(workSheet, columnIndex, rowIndex);

        if (this.mode == 'readonly' || this.mode == 'edit-default')
          this._inputCellTypeHelper.setCellType(cell, direction);

        const name = this.getDisplayName(workSheet, columnIndex, rowIndex);

        const formula = workSheet.getFormula(rowIndex, columnIndex);
        let value = cell.value();
        if (formula)
          value = GC.Spread.Sheets.CalcEngine.evaluateFormula(workSheet, formula, 0, 0);

        const options = this.getOptions(workSheet, cell);
        const type = CellHelper.processDataType(cell, options);
        const event: SelectedCellEvent = {
          type: direction,
          meta: {
            id: uuidv4(),
            address,
            name: name.name.replace(/\s+/g, ''),
            title: name.title,
            type,
            default: CellHelper.parseValue(value, type),
            required: false,
            format: null,
            originalType: type,
            options: options,
            transpose: false,
          },
        };
        this.selectedCell.emit(event);
      }
    }
  }
  isMergedCell(cell: GC.Spread.Sheets.CellRange, spans: GC.Spread.Sheets.Range[]): boolean {
    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];

      let inRange = false;
      if (cell.col >= span.col && cell.col < (span.col + span.colCount)) {
        inRange = true;
      }

      if (inRange && cell.row >= span.row && cell.row < (span.row + span.rowCount)) {
        if (cell.row == span.row && cell.col == span.col) {//topleft on merged cell
          return false;
        }

        return true;
      }
    }

    return false;
  }

  getOptions(workSheet: GC.Spread.Sheets.Worksheet, cell: GC.Spread.Sheets.CellRange): Array<any> {

    const validator = workSheet.getDataValidator(cell.row, cell.col, GC.Spread.Sheets.SheetArea.viewport);
    if (validator) {
      let validList = validator.getValidList(workSheet, 1, 1);
      if (validList) {
        validList = validList.filter(function (value) {
          return value !== null;
        });
        return validList;
      }
    }

    return null;
  }

  unselectCell(address: string): void {
    this._logger.debug('rmv icon from cell ', address);
    const cell = this._inputCellTypeHelper.getRange(address);
    if (cell) {
      this._inputCellTypeHelper.clearCellType(cell);
    }
  }

  parseListInput(start: "top" | "left", target: InputType, range: GC.Spread.Sheets.Range) {
    const workBook = this.workBook;
    const workSheet = workBook.getActiveSheet();
    const rowIndex = range.row;
    const colIndex = range.col;

    const listAddress = this.getCellAddress(workSheet, colIndex, rowIndex);
    let listName = this.getCellName(workSheet, colIndex, rowIndex);
    let listTitle = listName;

    const tmpCell = workSheet.getCell(rowIndex - 2, colIndex);
    if (tmpCell) {
      let tmpName = tmpCell.value();
      if (tmpName) {
        tmpName = tmpName.toString();
        listTitle = tmpName;
        tmpName = this.normalizeName(tmpName);
        if (this.isValidName(tmpName)) {
          listName = tmpName;
        }
      }
    }

    const listDefinition: InputDefinition = {
      id: uuidv4(),
      address: listAddress + ':' + XLSX.utils.encode_col(colIndex + range.colCount - 1) + (rowIndex + range.rowCount),
      name: listName.replace(/\s+/g, ''),
      default: null,
      format: null,
      required: false,
      title: listTitle,
      type: 'List',
      maxItems: (start == "top") ? range.rowCount : range.colCount,
      originalType: 'List',
      transpose: start == "left",
      options: null
    };

    let length: number, max: number, min: number;
    if (start == "top") {
      length = range.colCount;
      max = colIndex + length;
      min = colIndex;
    } else { //tranposed
      length = range.rowCount;
      max = rowIndex + length;
      min = rowIndex;
    }

    const allColumns: SelectedCellEvent[] = [];
    for (let i = min; i < max; i++) {
      let c: number, r: number;
      if (start == "top") {
        c = i;
        r = rowIndex;
      } else {
        c = colIndex;
        r = i;
      }

      const event = this.parseColumn(workSheet, target, listName, length, { column: c, row: r, start: start, maxRow: rowIndex + range.rowCount, maxCol: colIndex + range.colCount });
      if (event) {
        allColumns.push(event);
      }
    }

    if (allColumns.length > 0) {
      const listEvent = new SelectedCellEvent();
      listEvent.type = target;
      listEvent.meta = listDefinition;

      this.selectedCell.emit(listEvent);
      for (let i = 0; i < allColumns.length; i++) {
        this.selectedCell.emit(allColumns[i]);
      }

      if (this.mode == 'readonly' || this.mode == 'edit-default') {
        const listRange = this._inputCellTypeHelper.getRange(listDefinition.address);
        this._inputCellTypeHelper.setCellType(listRange, target);
      }
    } else {
      this._logger.warn('No valid columns in selected table, ignoring table.');
    }
  }

  parseColumn(worksheet: GC.Spread.Sheets.Worksheet, target: InputType, listName: string, length: number, coordinates: { column: number, row: number, maxCol: number, maxRow: number, start: "top" | "left" })
    : SelectedCellEvent {

    const address = this.getCellAddress(worksheet, coordinates.column, coordinates.row);
    const formula = worksheet.getFormula(coordinates.row, coordinates.column);
    if (formula && target == InputType.listIn) {
      this._logger.warn('Not selecting formula(' + address + ')', formula);
      return null;
    }

    const cellName = (coordinates.start == "top") ? worksheet.getCell(coordinates.row - 1, coordinates.column) : worksheet.getCell(coordinates.row, coordinates.column - 1);
    const cellValue = worksheet.getCell(coordinates.row, coordinates.column);

    let name: string = cellName.text();
    let title = name;
    name = this.normalizeName(name);
    if (name == '') {
      name = this.getCellName(worksheet, coordinates.column, coordinates.row);
      title = name;
    }
    let value = cellValue.value();
    if (formula)
      value = GC.Spread.Sheets.CalcEngine.evaluateFormula(worksheet, formula, 0, 0);
    const type: string = CellHelper.processDataType(cellValue);


    const range = (coordinates.start == "top")
      ? XLSX.utils.encode_col(coordinates.column) + '' + (coordinates.maxRow)
      : XLSX.utils.encode_col(coordinates.maxCol - 1) + '' + (coordinates.row + 1)
      ;

    const event = {
      type: target,
      meta: {
        id: uuidv4(),
        address: address + ':' + range,
        name: (listName + '/' + name).replace(/\s+/g, ''),
        title: title,
        default: CellHelper.parseValue(value, type),
        type,
        required: false,
        format: null,
        maxItems: null,
        originalType: type,
        options: null,
        transpose: false,
      },
    };

    return event;
  }

  normalizeName(text: string) {
    if (text == null)
      return null;
    return text.replace(/\W/ig, '');
  }

  getDisplayName(
    worksheet: GC.Spread.Sheets.Worksheet,
    column: number,
    row: number
  ): { name: string, title: string } {
    var title: string, name: string = null;
    const cell = worksheet.getCell(row, column - 1);

    if (cell) {
      let text = cell.value();
      if (typeof text === 'string') {
        if (!text.match(/^(\d+|true|false)$/ig)) {
          title = text;
        }

        text = this.normalizeName(text);
        if (this.isValidName(text)) {
          name = text;

        }
      }
    }

    if (!name || !title) {
      var cellAddress = this.getCellName(worksheet, column, row);
      if (!name)
        name = cellAddress;
      if (!title)
        title = cellAddress;
    }

    return { name, title };
  }

  getCellName(worksheet: GC.Spread.Sheets.Worksheet, column: number, row: number) {
    const sheetName = worksheet.name();
    const columnName = XLSX.utils.encode_col(column);

    return this.cleanName(sheetName) + ' - ' + columnName + (row + 1);
  }

  getCellAddress(worksheet: GC.Spread.Sheets.Worksheet, column: number, row: number) {
    const sheetName = worksheet.name();
    const columnName = XLSX.utils.encode_col(column);

    return sheetName + '-' + columnName + [row + 1];
  }

  cleanName(name: string): string {
    name = name.replace(/[^A-z0-9_\s]/g, '_');
    return name;
  }

  selectCells(direction: InputType, array: Array<any>, worksheetName: string, start: "top" | "left" = "top") {
    if (worksheetName != null) {
      this.workBook.setActiveSheet(worksheetName);
    }

    const worksheet: XLSX.WorkSheet = this.workBook.getActiveSheet();
    const address1: XLSX.CellAddress = XLSX.utils.decode_cell(array[0].columnName + (array[0].row + 1));
    let address2: XLSX.CellAddress;
    if (array.length > 1) {
      address2 = XLSX.utils.decode_cell(array[1].columnName + (array[1].row + 1));
    } else {
      address2 = address1;
    }

    worksheet.setActiveCell(address1.r, address1.c);
    worksheet.addSelection(
      address1.r,
      address1.c,
      address2.r - address1.r + 1,
      address2.c - address1.c + 1
    );

    this.parseSelectedCells(direction, start);
  }

  getFileAsBase64(updated: boolean): Promise<string> {

    if (updated) {
      // check whether validation cells should be removed before obtaining a json string.
      const validation = this._previousSchema?.validation
      if (validation?.validationCell) {
        this._inputCellTypeHelper.clearCellType(this._inputCellTypeHelper.getRange(validation.validationCell));
      }
      if (validation?.validationMessage) {
        this._inputCellTypeHelper.clearCellType(this._inputCellTypeHelper.getRange(validation.validationMessage));
      }

      return new Promise<string>((resolve, reject) => {
        const json = this.workBook.toJSON();

        let blob = null;
        try {
          
          var reader = new FileReader();
          reader.onloadend = function () {
            const filedata = reader.result as string;
            resolve(filedata);
          }

          ExcelDesignerComponent.excelIO.save(json, (b) => {
            blob = b;
            reader.readAsDataURL(blob);
          }, (error: any) => {
            this._logger.error('io is unable to save file', { error, blob, json, sjson: JSON.stringify(json)});
            reject(error);
          });
        } catch (error) {
          this._logger.error('unable to save file', { error, blob, json, sjson: JSON.stringify(json) });
          reject(error);
        }
      });
    }

    return new Promise<string>((resolve, reject) => {
      resolve(this._encodedFile);
    });
  }

  private overwriteInput(input: InputDefinition, direction: InputType): InputDefinition {
    const cell = this._inputCellTypeHelper.getRange(input.address);
    if (!cell) {//just checking cell still exists
      return null;
    }
    if (this.mode == 'readonly' || this.mode == 'edit-default')
      this._inputCellTypeHelper.setCellType(cell, direction);

    const options = this.getOptions(cell.sheet, cell);

    let type = 'List';
    let value = null;
    if (input.type != 'List') {
      type = (input.originalType == null) ? CellHelper.processDataType(cell, options) : input.type;
      value = CellHelper.parseValue(cell.value(), type);
    }


    var updated = { ...input };
    var update = { type, options: options };
    if (!input.overwrittenDefault && input.type != 'List' && input.name.indexOf('/') == -1) {
      update['default'] = value;
    }
    Object.assign(updated, update);

    this._logger.debug('overwriting', { title: input.title, previous: input, actual: updated });

    return updated;
  }

  private loadInput(inputs: InputDefinition[], direction: InputType): void {
    if (inputs) {
      for (let i = 0; i < inputs.length; i++) {
        const input = this.overwriteInput(inputs[i], direction);
        if (!input) {
          continue;
        }

        const event = { type: direction, meta: input };
        this.selectedCell.emit(event);
      }
    }
  }

  public loadPreviousSchema(): void {
    const schema = this._previousSchema;

    this.loadInput(schema.inputs, InputType.in);
    this.loadInput(schema.outputs, InputType.out);
    this.loadInput(schema.inputLists, InputType.listIn);
    this.loadInput(schema.outputLists, InputType.listOut);

    if (schema.formArea) {
      this._logger.debug('loading form area', schema.formArea);
      this.formArea = schema.formArea;
      this._inputCellTypeHelper.selectFormView(schema.formArea);
      this.snapshot.emit(schema.snapshot);
    }

    if (schema.validation) {
      if (schema.validation.validationCell) {
        const validationCell = this._inputCellTypeHelper.getRange(schema.validation.validationCell);
        this.selectedCell.emit({ type: InputType.validationCell, meta: { id: uuidv4(), address: schema.validation.validationCell } });
        this._inputCellTypeHelper.setCellType(validationCell, InputType.validationCell);
      }
      if (schema.validation.validationMessage) {
        const validationMessageCell = this._inputCellTypeHelper.getRange(schema.validation.validationMessage);
        this.selectedCell.emit({ type: InputType.validationMessage, meta: { id: uuidv4(), address: schema.validation.validationMessage } });
        this._inputCellTypeHelper.setCellType(validationMessageCell, InputType.validationMessage);
      }
    }
  }

  public initSpread($event: any): void {
    this._logger.debug('designer', $event);
    //$event.designer.allowContextMenu = false;
    this.workBook = $event.designer.getWorkbook();
  }

  public refreshCell(address: string): void {
    const cell = this._inputCellTypeHelper.getRange(address);
    const formula = cell.sheet.getFormula(cell.row, cell.col);
    let value = cell.value();
    if (formula)
      value = GC.Spread.Sheets.CalcEngine.evaluateFormula(cell.sheet, formula, 0, 0);
    cell.value(value);
  }

  public setValue(address: string, value: any): void {
    const cell = this._inputCellTypeHelper.getRange(address);
    cell.value(value);
  }

  public getValue(address: string): any {
    if (address.indexOf(':') >= 0) {
      const cell = this._inputCellTypeHelper.getRange(address);
      let array = cell.sheet.getArray(cell.row, cell.col, cell.rowCount, cell.colCount);

      const transposed = cell.colCount > 1;
      if (!transposed) {
        array = array.map(x => x[0]);
      } else {
        array = array[0];
      }

      return array;

    } else {
      const cell = this._inputCellTypeHelper.getRange(address);
      return cell.value();
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  focusAddress(address: string) {
    const cells = this._inputCellTypeHelper.getRange(address);
    this.workBook.setActiveSheet(cells.sheet.name());
    cells.sheet.setSelection(cells.row, cells.col, cells.rowCount, cells.colCount);
  }

  public takeSnapshot(): Promise<string> {
    return this._inputCellTypeHelper.createSnapshot(null);
  }
}
