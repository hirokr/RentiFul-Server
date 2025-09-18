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
@Roles('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Get('me')
  getManager(@GetUser() user: any) {
    return this.managerService.getManager(user.id);
  }

  @Put('me')
  updateManager(
    @GetUser() user: any,
    @Body() updateData: { name?: string; email?: string; phoneNumber?: string },
  ) {
    return this.managerService.updateManager(user.id, updateData);
  }

  @Get('me/properties')
  getManagerProperties(@GetUser() user: any) {
    return this.managerService.getManagerProperties(user.id);
  }
}
