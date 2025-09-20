import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto, QueryPropertyDto } from './dto';
import { RequireManager } from '../auth/decorators/auth-roles.decorator';
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
  @RequireManager()
  async createProperty(
    @Body() dto: CreatePropertyDto,
    @GetUser() user: any,
  ) {
    // Find the manager record for this user
    const manager = await this.propertyService.getManagerByUserId(user.id);
    return this.propertyService.createProperty(dto, manager.id);
  }
}
