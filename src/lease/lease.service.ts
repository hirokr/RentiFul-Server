import { Injectable } from '@nestjs/common';
import { PrismaDbService } from '../prisma-db/prisma-db.service';

@Injectable()
export class LeaseService {
  constructor(private prisma: PrismaDbService) {}

  async getLeases() {
    try {
      const leases = await this.prisma.lease.findMany({
        include: {
          tenant: true,
          property: true,
        },
      });
      return leases;
    } catch (error) {
      throw new Error(`Error retrieving leases: ${error.message}`);
    }
  }

  async getLeasePayments(id: string) {
    try {
      const payments = await this.prisma.payment.findMany({
        where: { leaseId: id },
      });
      return payments;
    } catch (error) {
      throw new Error(`Error retrieving lease payments: ${error.message}`);
    }
  }
}
