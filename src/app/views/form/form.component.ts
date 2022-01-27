import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as GC from '@grapecity/spread-sheets';
import * as XLSX from 'xlsx';
import { environment } from '../../../environments/environment';
import { ChangedCellData, Dimensions, ExcelGridComponent } from '../../components/excelGrid/excelGridComponent';
import { ModelDefinition } from '../../core/model/ModelFile';
import { Logger } from '../../core/service/Logger';
import { ModelService } from '../../core/service/ModelService';
import { DataLoader } from './helpers/DataLoader';
import { CustomMetaService } from '../../core/configuration/custom-meta.service';
import { DEPLOY_URL } from '../../core/configuration/deploy-url';
import { ToasterService } from 'angular2-toaster';
import * as rsc from '../../components/excelGrid/grapecity/excel-files.spec'

@Component({
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  public isDev = !environment.production;
  private _version = 1;
  public _session: any;
  public _mode: 'readonly' | 'area' | 'default' | 'area-readonly' | 'form-readonly' = 'default';
  filtersLoaded: Promise<boolean>;
  public previousSchema: ModelDefinition;
  public runningModel: boolean;
  public modelName: string;
  public logoUrl: string;
  public deployUrl: string;
  displayWidth = '100%';
  displayHeight = '100%';
  loaded = false;
  isFormValid = false;
  isChanged = false;
  isSavingSession = false;
  validationMessage: string;

  @ViewChild('excelGrid')
  public excelGrid: ExcelGridComponent;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _logger: Logger,
    private _modelBuilder: ModelService,
    private customMetaService: CustomMetaService,
    private _toastyService: ToasterService,
    @Inject(DEPLOY_URL) deployUrl: string
  ) {
    this.deployUrl = deployUrl;
    customMetaService.setCustomMetadata({ title: 'Loading...' })

  }

  async ngOnInit() {
    this._version = 1;
    this.previousSchema = null;
    this._mode = 'default';
    this.customMetaService.setCustomMetadata({ cssLinks: [], favicon: null, title: environment.defaultTitle });
    this.filtersLoaded = Promise.resolve(true);   
    const delay = ms => new Promise(res => setTimeout(res, ms));

    this.previousSchema = <ModelDefinition>{};
    this._session = {inputs:[], outputs:[]};

    await delay(1000).then(() => {      
      
      const file = rsc.dataURLtoFile('test.xlsx', rsc.debug64);
      this.excelGrid.handleFileInput(file, this.previousSchema);

      this.isFormValid = true;
    })
  }

  getContainerHeight() {
    var winHeight = window.innerHeight;
    var hight = document.getElementById('nav-header').clientHeight;

    return (winHeight - hight - 5) + 'px';
  }
  onWorkbookReady() {

    this.loaded = true;
    this.loadSessionData(this._session);
    this._logger.debug('workbook ready');
    this.excelGrid.worbookInitDone();
  }

  loadSessionData(data: object) {
    var loader = new DataLoader(this.excelGrid, this._logger);
    loader.loadSessionData(this.previousSchema, data);
  }

  async saveSession(isDraft: boolean) {
    this.isSavingSession = true;

    var loader = new DataLoader(this.excelGrid, this._logger);

    const file = await this.excelGrid.getFileAsBase64(true); //always sending most updated file

    console.info('OK', file);
  }

  leave() {
    history.back();
  }

  public substituteErrorMessages(inputs: object): string {
    const messages = [];
    for (var key in inputs) {
      // check if the property/key is defined in the object itself, not in parent
      if (inputs.hasOwnProperty(key)) {
        var text: string = inputs[key];
        switch (inputs[key]) {
          case "INVALID_NAME": { text = "Invalid model name. Only alphanumeric characters are allowed."; } break;
          case "NAME_ALREADY_IN_USE": { text = "Model name already in use."; } break;
          case "NO_INPUTS": { text = "No inputs specified"; } break;
          case "NO_REVISION": { text = "Please state the reason of the revision change."; } break;
          case "NO_FILE": { text = "No files attached"; } break;
        }
        messages.push(text);
      }
    }

    return messages.join("\n");
  }

  public getDimensions(event: Dimensions): void {
    this._logger.debug('getDimensions', event);

    if (event.mode === 'area' || event.mode === 'area-readonly') {
      event.workbook.options.scrollbarAppearance = 0;
      if (event.total.width < window.innerWidth) {
        this.displayWidth = (event.total.width + 25) + 'px';
        event.workbook.options.showHorizontalScrollbar = false;
      } else {
        this.displayWidth = '100%';
        event.workbook.options.showHorizontalScrollbar = true;
      }
      if (event.total.height < window.innerHeight) {
        this.displayHeight = (event.total.height + 40) + 'px';
        event.workbook.options.showVerticalScrollbar = false;
      } else {
        this.displayHeight = '100%';
        event.workbook.options.showVerticalScrollbar = true;
      }

      this._logger.debug('resize window', { mode: event.mode, displayWidth: this.displayWidth, displayHeight: this.displayHeight, innerHeight: window.innerHeight, innerWidth: window.innerWidth });
      window.dispatchEvent(new Event('resize'));
    }
  }

  changedCellData(event: ChangedCellData) {
    const validationCell = this.previousSchema?.validation?.validationCell?.split('-');
    if (validationCell && validationCell[1]) {
      const cell = XLSX.utils.decode_cell(validationCell[1]);
      // Timeout = wait for calculation
      setTimeout(() => {
        this.isChanged = true;
        this._logger.debug('after 10 sec', event.workbook.getActiveSheet().getCell(cell.r, cell.c).value());
        this.isFormValid = event.workbook.getActiveSheet().getCell(cell.r, cell.c).value();
        this.validationMessage = this.getValidationMessage(event.workbook);
      }, 10);
    }
  }

  private getValidationMessage(workbook: GC.Spread.Sheets.Workbook): string {
    const validationMessageCell = this.previousSchema?.validation?.validationMessage?.split('-');
    if (validationMessageCell && validationMessageCell[1]) {
      const cell = XLSX.utils.decode_cell(validationMessageCell[1]);
      return workbook.getActiveSheet().getCell(cell.r, cell.c).value() || 'Validation Error';
    }
    return 'Please fill out required fields';
  }
}
