import { IsEmail, IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsIn(['TENANT', 'MANAGER'])
  role: 'TENANT' | 'MANAGER';

  @IsString()
  @IsOptional()
  imageUrl?: string;
}