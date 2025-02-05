import { IsOptional, IsString, IsNumber, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class PhoneDto {
  @IsOptional()
  @IsNumber()
  phoneId?: number;

  @IsString()
  phoneNumber: string;
}

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

  @IsOptional()
  @IsArray()
  @Type(() => PhoneDto)
  phones?: PhoneDto[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds?: number[];
}
