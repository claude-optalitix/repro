export class InputDefinition {
  public id:string;
  public address: string;
  public name?: string;
  public title?: string;
  public type?: string;
  public default?: any;
  public overwrittenDefault?: boolean;
  public format?: string;
  public transpose?: boolean;
  public matrix?: boolean;
  public required?: boolean;
  public maxItems?: number;
  public originalType?: string;
  public options?: Array<any>;
  public order?: number;
  public keys?: keyDefinition[];
  public ignoredColumns?: string[];
}
export class keyDefinition {
  public name: string;
  public ignored: boolean;
  public override: string;
}