import { IsString, Length, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(2, { message: 'Username must be at least 2 characters long' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  readonly username: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  readonly password: string;

  @IsString()
  @Length(30)
  readonly deviceId: string;
}
