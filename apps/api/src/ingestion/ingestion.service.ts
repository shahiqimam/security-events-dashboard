import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HistoryAction } from '../common/enums';
import { EventHistory } from '../events/entities/event-history.entity';
import { EventSource } from '../events/entities/event-source.entity';
import { SecurityEvent } from '../events/entities/security-event.entity';
import { NormalizedEventInput } from './adapters/security-event-adapter';

@Injectable()
export class IngestionService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SecurityEvent) private readonly events: Repository<SecurityEvent>
  ) {}

  async ingest(input: NormalizedEventInput) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(SecurityEvent, {
        where: { sourceType: input.sourceType, sourceEventId: input.sourceEventId },
        lock: { mode: 'pessimistic_write' }
      });

      if (existing) {
        existing.occurrenceCount += 1;
        existing.lastSeenAt = new Date();
        existing.rawPayload = input.rawPayload;
        const saved = await manager.save(existing);
        await manager.insert(EventHistory, {
          eventId: saved.id,
          actorId: null,
          action: HistoryAction.DEDUPLICATED,
          previousValue: { occurrenceCount: existing.occurrenceCount - 1 },
          newValue: { occurrenceCount: existing.occurrenceCount }
        });
        await this.updateSource(manager, input.sourceType, input.detectedAt);
        return { created: false, deduplicated: true, event: saved };
      }

      const event = manager.create(SecurityEvent, {
        ...input,
        firstSeenAt: new Date(),
        lastSeenAt: new Date()
      });
      const saved = await manager.save(event);
      await manager.insert(EventHistory, {
        eventId: saved.id,
        actorId: null,
        action: HistoryAction.INGESTED,
        previousValue: null,
        newValue: { sourceType: input.sourceType, sourceEventId: input.sourceEventId }
      });
      await this.updateSource(manager, input.sourceType, input.detectedAt);
      return { created: true, deduplicated: false, event: saved };
    });
  }

  private async updateSource(manager: DataSource['manager'], sourceType: NormalizedEventInput['sourceType'], detectedAt: Date) {
    await manager.update(
      EventSource,
      { sourceType },
      { lastEventAt: detectedAt, totalEvents: () => '"totalEvents" + 1', lastError: null }
    );
  }
}
