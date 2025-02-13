import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
} 