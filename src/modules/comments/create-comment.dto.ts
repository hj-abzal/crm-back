import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsInt()
  contactId?: number;
}

export class CreateCommentFullDto extends CreateCommentDto {
  @IsNotEmpty()
  @IsInt()
  managerId: number;
}
