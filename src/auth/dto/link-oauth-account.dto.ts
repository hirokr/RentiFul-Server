import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class LinkOAuthAccountDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsIn(['tenant', 'manager'])
  role: 'tenant' | 'manager';

  @IsString()
  @IsIn(['google', 'github', 'facebook'])
  provider: 'google' | 'github' | 'facebook';

  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsString()
  @IsOptional()
  image?: string;
}