import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { LeaseService } from './lease.service';
import { RequireAnyRole } from '../auth/decorators/auth-roles.decorator';

@Controller('leases')
@RequireAnyRole()
export class LeaseController {
  constructor(private readonly leaseService: LeaseService) { }

  @Get()
  getLeases() {
    return this.leaseService.getLeases();
  }

  @Get(':id/payments')
  getLeasePayments(@Param('id') id: string) {
    return this.leaseService.getLeasePayments(id);
  }
}
