import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  isNotEmpty,
  IsEmail,
} from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @IsDateString()
  applicationDate: string;

  @IsEnum(['Pending', 'Denied', 'Approved'])
  status: ApplicationStatus;

  @IsString()
  @IsNotEmpty()
  propertyId: string;
  
  @IsString()
  @IsNotEmpty()
  tenantCognitoId: string

  @IsString()
  @IsEmail()
  name: string;

  
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  message?: string;
}
