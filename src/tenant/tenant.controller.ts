import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('me')
  getTenant(@GetUser() user: any) {
    return this.tenantService.getTenant(user.id);
  }

  @Put('me')
  updateTenant(
    @GetUser() user: any,
    @Body() updateData: { name?: string; email?: string; phoneNumber?: string },
  ) {
    return this.tenantService.updateTenant(user.id, updateData);
  }

  @Get('me/residences')
  getCurrentResidences(@GetUser() user: any) {
    return this.tenantService.getCurrentResidences(user.id);
  }

  @Post('me/favorites/:propertyId')
  addFavoriteProperty(
    @GetUser() user: any,
    @Param('propertyId') propertyId: string,
  ) {
    return this.tenantService.addFavoriteProperty(user.id, propertyId);
  }

  @Delete('me/favorites/:propertyId')
  removeFavoriteProperty(
    @GetUser() user: any,
    @Param('propertyId') propertyId: string,
  ) {
    return this.tenantService.removeFavoriteProperty(user.id, propertyId);
  }
}
