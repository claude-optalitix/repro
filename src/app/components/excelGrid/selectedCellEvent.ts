import { InputDefinition } from '../../core/model/InputDefinition'

export enum InputType {
  in,
  out,
  listIn,
  listOut,
  matrixIn,
  matrixOut,
  validationCell,
  validationMessage,
}
export class SelectedCellEvent {
  public type: InputType;
  public meta: InputDefinition;
}

