import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthRolesGuard } from '../guards/auth-roles.guard';
import { Roles, UserRole } from './roles.decorator';

export function RequireRoles(...roles: UserRole[]) {
  return applyDecorators(
    UseGuards(AuthRolesGuard),
    Roles(...roles)
  );
}

export function RequireTenant() {
  return RequireRoles(UserRole.TENANT);
}

export function RequireManager() {
  return RequireRoles(UserRole.MANAGER);
}

export function RequireAnyRole() {
  return RequireRoles(UserRole.TENANT, UserRole.MANAGER);
}