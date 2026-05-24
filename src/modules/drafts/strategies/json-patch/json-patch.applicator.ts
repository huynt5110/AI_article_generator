import { Injectable, BadRequestException } from '@nestjs/common';
import { IPatchOperationStrategy } from './patch-operation.strategy';
import { ReplaceOperationStrategy } from './replace-operation.strategy';

@Injectable()
export class JsonPatchApplicator {
  private strategies: IPatchOperationStrategy[];

  constructor(
    // In a larger app, we'd inject an array of strategies via a custom provider.
    // For simplicity, we manually instantiate the known strategy here, 
    // but the pattern allows easy extension.
    replaceStrategy: ReplaceOperationStrategy
  ) {
    this.strategies = [replaceStrategy];
  }

  apply(document: any, operations: { op?: string, path: string, value?: any }[]): any {
    const updatedDocument = JSON.parse(JSON.stringify(document || {}));

    for (const operation of operations) {
      const strategy = this.strategies.find(s => s.supports(operation.op || 'replace'));
      
      if (!strategy) {
        throw new BadRequestException(`Unsupported patch operation: ${operation.op}`);
      }

      strategy.apply(updatedDocument, operation.path, operation.value);
    }

    return updatedDocument;
  }
}
