import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePhoneDto {
  @IsOptional()
  @IsNumber()
  phoneId?: number;

  @IsString()
  phoneNumber: string;
}
