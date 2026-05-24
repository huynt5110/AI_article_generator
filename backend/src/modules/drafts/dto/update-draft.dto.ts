import { IsArray, IsNotEmpty, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOperationDto {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsNotEmpty()
  value: any;
}

export class UpdateDraftDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  hook?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOperationDto)
  operations: UpdateOperationDto[];
}
