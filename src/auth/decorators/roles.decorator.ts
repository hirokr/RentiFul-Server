import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  TENANT = 'TENANT',
  MANAGER = 'MANAGER',
}

export const Roles = (...roles: (UserRole | string)[]) => SetMetadata('roles', roles);