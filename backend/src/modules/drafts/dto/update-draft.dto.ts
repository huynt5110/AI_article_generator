import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOperationDto {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsNotEmpty()
  value: any;
}

export class UpdateDraftDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOperationDto)
  operations: UpdateOperationDto[];
}
