import { IsEmail, IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn(['tenant', 'manager'])
  role: 'tenant' | 'manager';

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  @IsIn(['google', 'github', 'facebook', 'credentials'])
  provider?: 'google' | 'github' | 'facebook' | 'credentials';

  @IsString()
  @IsOptional()
  providerId?: string;
}