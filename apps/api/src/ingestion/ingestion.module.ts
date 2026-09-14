import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventHistory } from '../events/entities/event-history.entity';
import { EventSource } from '../events/entities/event-source.entity';
import { SecurityEvent } from '../events/entities/security-event.entity';
import { AdapterRegistry } from './adapters/adapter-registry';
import { IngestKeyGuard } from './ingest-key.guard';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityEvent, EventSource, EventHistory])],
  controllers: [IngestionController],
  providers: [AdapterRegistry, IngestKeyGuard, IngestionService],
  exports: [IngestionService]
})
export class IngestionModule {}
