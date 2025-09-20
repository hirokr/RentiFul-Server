import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ManagerService } from './manager.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('managers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) { }

  @Get('me')
  async getManager(@GetUser() user: any) {
    // Find the manager record for this user
    const manager = await this.managerService.getManagerByUserId(user.id);
    return this.managerService.getManager(manager.id);
  }

  @Put('me')
  async updateManager(
    @GetUser() user: any,
    @Body() updateData: { name?: string; email?: string; phoneNumber?: string },
  ) {
    // Find the manager record for this user
    const manager = await this.managerService.getManagerByUserId(user.id);
    return this.managerService.updateManager(manager.id, updateData);
  }

  @Get('me/properties')
  async getManagerProperties(@GetUser() user: any) {
    // Find the manager record for this user
    const manager = await this.managerService.getManagerByUserId(user.id);
    return this.managerService.getManagerProperties(manager.id);
  }
}
