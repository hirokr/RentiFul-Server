import { Module } from '@nestjs/common';
import { LeaseService } from './lease.service';
import { LeaseController } from './lease.controller';
import { PrismaDbModule } from '../prisma-db/prisma-db.module';

@Module({
  imports: [PrismaDbModule],
  controllers: [LeaseController],
  providers: [LeaseService],
})
export class LeaseModule {}
