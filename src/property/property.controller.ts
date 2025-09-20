import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto, QueryPropertyDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) { }

  @Get()
  getProperties(@Query() query: QueryPropertyDto) {
    return this.propertyService.getProperties(query);
  }

  @Get(':id')
  getProperty(@Param('id') id: string) {
    return this.propertyService.getProperty(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  async createProperty(
    @Body() dto: CreatePropertyDto,
    @GetUser() user: any,
  ) {
    // Find the manager record for this user
    const manager = await this.propertyService.getManagerByUserId(user.id);
    return this.propertyService.createProperty(dto, manager.id);
  }
}
