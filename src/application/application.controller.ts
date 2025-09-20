import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, UpdateApplicationDto } from './dto';
import { RequireTenant, RequireManager, RequireAnyRole } from '../auth/decorators/auth-roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) { }

  @Post()
  @RequireTenant()
  async createApplication(
    @Body() dto: CreateApplicationDto,
    @GetUser() user: any,
  ) {
    // Find the tenant record for this user
    const tenant = await this.applicationService.getTenantByUserId(user.id);
    return this.applicationService.createApplication(dto, tenant.id);
  }

  @Put(':id/status')
  @RequireManager()
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationService.updateApplicationStatus(id, dto);
  }

  @Get()
  @RequireAnyRole()
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
