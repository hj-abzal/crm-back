import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'Username must be at least 2 characters long' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  readonly username: string;

  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(30, { message: 'First name must not exceed 30 characters' })
  readonly firstName: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(30, { message: 'Last name must not exceed 30 characters' })
  readonly lastName: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  readonly password: string;
}

export class UpdateUserDto {
  @IsString()
  @MinLength(2, { message: 'Username must be at least 2 characters long' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  readonly username: string;

  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(30, { message: 'First name must not exceed 30 characters' })
  readonly firstName: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(30, { message: 'Last name must not exceed 30 characters' })
  readonly lastName: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  password?: string;
}
