import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ValidateCredentialsDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

// Keep old name for backward compatibility
export const LoginDto = ValidateCredentialsDto;