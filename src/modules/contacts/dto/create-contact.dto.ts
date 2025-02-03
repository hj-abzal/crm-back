import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateContactPhoneDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContactPhoneDto)
  readonly contactPhones: CreateContactPhoneDto[];

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
  @IsInt()
  @Min(1)
  managerId: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthDate?: Date;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];
}
