import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SourcesService } from './sources.service';

@Controller('sources')
@UseGuards(JwtAuthGuard)
export class SourcesController {
  constructor(private readonly sources: SourcesService) {}

  @Get()
  list() {
    return this.sources.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.sources.get(id);
  }
}
