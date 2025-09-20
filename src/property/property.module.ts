import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaDbModule } from '../prisma-db/prisma-db.module';
@Module({
  imports: [PrismaDbModule],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule { }
