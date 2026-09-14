import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { SourceType } from '../common/enums';
import { AdapterRegistry } from './adapters/adapter-registry';
import { IngestKeyGuard } from './ingest-key.guard';
import { IngestionService } from './ingestion.service';

@Controller('ingest')
@UseGuards(IngestKeyGuard)
export class IngestionController {
  constructor(
    private readonly registry: AdapterRegistry,
    private readonly ingestion: IngestionService
  ) {}

  @Post(':sourceType')
  ingest(@Param('sourceType') sourceType: SourceType, @Body() body: unknown) {
    const adapter = this.registry.get(sourceType);
    const payload = adapter.validate(body);
    return this.ingestion.ingest(adapter.normalize(payload));
  }
}
