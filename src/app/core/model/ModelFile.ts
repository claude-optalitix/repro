import { InputDefinition } from './InputDefinition'

export enum EditorFeature {
  InputSingles = "InputSingles",
  InputTables = "InputTables",
  OutputSingles = "OutputSingles",
  OutputTables = "OutputTables",
  FormView = "FormView",
  Validation = "Validation",
}

export enum FormFeature {
  ApiName = "ApiName",
  Type= "Type",
  Title= "Title",
  Required= "Required",
  Transpose= "Transpose",
  MaxItems= "MaxItems",
}

export class ModelFile {
  public id: string;
  public tenant: string;
  public name: string;
  public file: string;
  public revisionDescription: string;
  public version: number;
  public inputs: Array<InputDefinition>;
  public outputs: Array<InputDefinition>;
  public inputLists: Array<InputDefinition>;
  public outputLists: Array<InputDefinition>;
  public formArea: string;
  public snapshot: string;
  public validation: ModelValidationData;
}

export class ModelDefinition {
  public id: string;
  public name: string;
  public version: number;
  public inputs: Array<InputDefinition>;
  public outputs: Array<InputDefinition>;
  public inputLists: Array<InputDefinition>;
  public outputLists: Array<InputDefinition>;
  public formArea: string;
  public snapshot: string;
  public validation: ModelValidationData;
}

export class ModelValidationData {
  validationCell?: string;
  validationMessage?: string;
}