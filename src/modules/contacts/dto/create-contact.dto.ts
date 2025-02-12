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
  IsEnum,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TASK_STATUS } from '../../tasks/task-status.enum';
import { PHONE_ERROR_MESSAGES } from '../constants/error-messages';

class CreateContactPhoneDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^7[0-9]{10}$/, {
    message: PHONE_ERROR_MESSAGES.INVALID_FORMAT,
  })
  phoneNumber: string;
}

class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @IsEnum(TASK_STATUS)
  status: TASK_STATUS;

  @IsOptional()
  @IsString()
  result?: string;

  @IsNumber()
  managerId: number;
}

class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  text: string;
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

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTaskDto)
  task?: CreateTaskDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCommentDto)
  comment?: CreateCommentDto;
}
