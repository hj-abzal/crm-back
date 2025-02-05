import { IsOptional, IsString, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContactDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsNumber()
  managerId?: number;

  @IsOptional()
  @IsNumber()
  readonly cityId?: number;

  @IsOptional()
  @IsNumber()
  readonly sourceId?: number;

  @IsOptional()
  @IsNumber()
  readonly statusId?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthDate?: Date;
}
