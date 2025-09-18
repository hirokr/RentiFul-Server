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
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('tenant')
  createApplication(
    @Body() dto: CreateApplicationDto,
    @GetUser() user: any,
  ) {
    return this.applicationService.createApplication(dto, user.id);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('manager')
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationService.updateApplicationStatus(id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('manager', 'tenant')
  listApplications(@GetUser() user: any) {
    return this.applicationService.listApplications(user.id, user.role);
  }
}
