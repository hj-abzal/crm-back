import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DeletePhoneDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Number)
  phoneIds: number[];
}
