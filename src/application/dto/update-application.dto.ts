import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class UpdateApplicationDto {
  @IsEnum(['Pending', 'Denied', 'Approved'])
  status: ApplicationStatus;
}