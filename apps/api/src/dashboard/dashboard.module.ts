import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityEvent } from '../events/entities/security-event.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityEvent])],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
