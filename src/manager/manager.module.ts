import { Module } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';
import { PrismaDbModule } from '../prisma-db/prisma-db.module';

@Module({
  imports: [PrismaDbModule],
  controllers: [ManagerController],
  providers: [ManagerService],
})
export class ManagerModule {}
