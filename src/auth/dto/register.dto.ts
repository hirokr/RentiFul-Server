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
  provider?: string;

  @IsString()
  @IsOptional()
  providerId?: string;
}

// Keep old name for backward compatibility
export const RegisterDto = CreateUserDto;