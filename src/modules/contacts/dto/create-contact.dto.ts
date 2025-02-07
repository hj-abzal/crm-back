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
} from 'class-validator';
import { Type } from 'class-transformer';
import { TASK_STATUS } from '../../tasks/task-status.enum';

class CreateContactPhoneDto {
  @IsString()
  @IsNotEmpty()
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
