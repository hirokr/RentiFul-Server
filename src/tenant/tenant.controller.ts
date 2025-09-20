import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { RequireTenant } from '../auth/decorators/auth-roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('tenants')
@RequireTenant()
export class TenantController {
  constructor(private readonly tenantService: TenantService) { }

  @Get('me')
  async getTenant(@GetUser() user: any) {
    // Find the tenant record for this user
    const tenant = await this.tenantService.getTenantByUserId(user.id);
    return this.tenantService.getTenant(tenant.id);
  }

  @Put('me')
  async updateTenant(
    @GetUser() user: any,
    @Body() updateData: { name?: string; email?: string; phoneNumber?: string },
  ) {
    // Find the tenant record for this user
    const tenant = await this.tenantService.getTenantByUserId(user.id);
    return this.tenantService.updateTenant(tenant.id, updateData);
  }

  @Get('me/residences')
  async getCurrentResidences(@GetUser() user: any) {
    // Find the tenant record for this user
    const tenant = await this.tenantService.getTenantByUserId(user.id);
    return this.tenantService.getCurrentResidences(tenant.id);
  }

  @Post('me/favorites/:propertyId')
  async addFavoriteProperty(
    @GetUser() user: any,
    @Param('propertyId') propertyId: string,
  ) {
    // Find the tenant record for this user
    const tenant = await this.tenantService.getTenantByUserId(user.id);
    return this.tenantService.addFavoriteProperty(tenant.id, propertyId);
  }

  @Delete('me/favorites/:propertyId')
  async removeFavoriteProperty(
    @GetUser() user: any,
    @Param('propertyId') propertyId: string,
  ) {
    // Find the tenant record for this user
    const tenant = await this.tenantService.getTenantByUserId(user.id);
    return this.tenantService.removeFavoriteProperty(tenant.id, propertyId);
  }
}
