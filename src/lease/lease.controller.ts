import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LeaseService } from './lease.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('leases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager', 'tenant')
export class LeaseController {
  constructor(private readonly leaseService: LeaseService) {}

  @Get()
  getLeases() {
    return this.leaseService.getLeases();
  }

  @Get(':id/payments')
  getLeasePayments(@Param('id') id: string) {
    return this.leaseService.getLeasePayments(id);
  }
}
