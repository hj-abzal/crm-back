import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
} from 'class-validator';
import { TASK_STATUS } from './task-status.enum';

export class TaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  result?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(TASK_STATUS)
  status?: TASK_STATUS;

  @IsOptional()
  @IsInt()
  contactId?: number;

  @IsNumber()
  managerId: number;
}
