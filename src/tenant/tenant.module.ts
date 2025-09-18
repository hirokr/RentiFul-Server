import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { PrismaDbModule } from '../prisma-db/prisma-db.module';

@Module({
  imports: [PrismaDbModule],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {}
