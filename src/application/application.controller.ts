import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, UpdateApplicationDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TENANT')
  async createApplication(
    @Body() dto: CreateApplicationDto,
    @GetUser() user: any,
  ) {
    // Find the tenant record for this user
    const tenant = await this.applicationService.getTenantByUserId(user.id);
    return this.applicationService.createApplication(dto, tenant.id);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('MANAGER')
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationService.updateApplicationStatus(id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'TENANT')
  async listApplications(@GetUser() user: any) {
    let roleSpecificId = user.id;

    if (user.role === 'TENANT') {
      const tenant = await this.applicationService.getTenantByUserId(user.id);
      roleSpecificId = tenant.id;
    } else if (user.role === 'MANAGER') {
      const manager = await this.applicationService.getManagerByUserId(user.id);
      roleSpecificId = manager.id;
    }

    return this.applicationService.listApplications(roleSpecificId, user.role);
  }
}
