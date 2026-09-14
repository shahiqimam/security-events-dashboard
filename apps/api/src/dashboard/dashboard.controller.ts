import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  summary() {
    return this.dashboard.summary();
  }

  @Get('severity')
  severity() {
    return this.dashboard.groupBy('severity');
  }

  @Get('categories')
  categories() {
    return this.dashboard.groupBy('category');
  }

  @Get('sources')
  sources() {
    return this.dashboard.groupBy('sourceType');
  }

  @Get('timeline')
  timeline() {
    return this.dashboard.timeline();
  }

  @Get('top-assets')
  topAssets() {
    return this.dashboard.topAssets();
  }
}
