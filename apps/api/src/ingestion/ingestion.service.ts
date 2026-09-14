import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
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
        return this.mergeDuplicate(manager, existing, input);
      }

      const now = new Date();
      const event = manager.create(SecurityEvent, {
        ...input,
        firstSeenAt: now,
        lastSeenAt: now
      });

      try {
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
      } catch (error) {
        if (!this.isUniqueViolation(error)) throw error;
        const racedExisting = await manager.findOneOrFail(SecurityEvent, {
          where: { sourceType: input.sourceType, sourceEventId: input.sourceEventId },
          lock: { mode: 'pessimistic_write' }
        });
        return this.mergeDuplicate(manager, racedExisting, input);
      }
    });
  }

  private async mergeDuplicate(manager: EntityManager, existing: SecurityEvent, input: NormalizedEventInput) {
    const previousCount = existing.occurrenceCount;
    existing.occurrenceCount += 1;
    existing.lastSeenAt = new Date();
    existing.rawPayload = input.rawPayload;
    const saved = await manager.save(existing);
    await manager.insert(EventHistory, {
      eventId: saved.id,
      actorId: null,
      action: HistoryAction.DEDUPLICATED,
      previousValue: { occurrenceCount: previousCount },
      newValue: { occurrenceCount: saved.occurrenceCount }
    });
    await this.updateSource(manager, input.sourceType, input.detectedAt);
    return { created: false, deduplicated: true, event: saved };
  }

  private async updateSource(manager: EntityManager, sourceType: NormalizedEventInput['sourceType'], detectedAt: Date) {
    await manager.update(
      EventSource,
      { sourceType },
      { lastEventAt: detectedAt, totalEvents: () => '"totalEvents" + 1', lastError: null }
    );
  }

  private isUniqueViolation(error: unknown) {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
  }
}
