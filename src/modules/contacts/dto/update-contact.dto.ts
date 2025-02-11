import { IsOptional, IsString, IsNumber, IsDate, IsArray, Matches, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { PHONE_ERROR_MESSAGES } from '../constants/error-messages';

class PhoneDto {
  @IsOptional()
  @IsNumber()
  phoneId?: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^7[0-9]{10}$/, {
    message: PHONE_ERROR_MESSAGES.INVALID_FORMAT,
  })
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
