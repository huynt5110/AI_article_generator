import { Injectable } from '@nestjs/common';
import { IPatchOperationStrategy } from './patch-operation.strategy';

@Injectable()
export class ReplaceOperationStrategy implements IPatchOperationStrategy {
  supports(operationType: string): boolean {
    // We treat missing operationType as 'replace' by default for backward compatibility
    return !operationType || operationType === 'replace';
  }

  apply(document: any, path: string, value: any): any {
    if (!document) document = {};
    
    const keys = path.split('.');
    let current = document;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]] === undefined || current[keys[i]] === null) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    return document;
  }
}
