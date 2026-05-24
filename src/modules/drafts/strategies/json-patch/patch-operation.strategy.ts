export interface IPatchOperationStrategy {
  supports(operationType: string): boolean;
  apply(document: any, path: string, value?: any): any;
}
