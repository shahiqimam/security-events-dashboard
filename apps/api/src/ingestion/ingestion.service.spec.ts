import { Severity, Category, SourceType } from '../common/enums';
import { IngestionService } from './ingestion.service';
import { SecurityEvent } from '../events/entities/security-event.entity';

const input = {
  sourceType: SourceType.MOCK_SIEM,
  sourceEventId: 'siem-1',
  title: 'Repeated login failures',
  description: null,
  severity: Severity.HIGH,
  category: Category.AUTHENTICATION,
  assetName: 'WS-014',
  username: null,
  sourceIp: '198.51.100.25',
  detectedAt: new Date('2026-09-12T10:00:00Z'),
  fingerprint: 'fp',
  rawPayload: { event_id: 'siem-1' }
};

describe('IngestionService', () => {
  function serviceWithManager(manager: any) {
    return new IngestionService({ transaction: (fn: any) => fn(manager) } as any, {} as any);
  }

  it('inserts the first occurrence and writes source metrics', async () => {
    const created = { id: 'event-1', occurrenceCount: 1, ...input };
    const manager = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue(created),
      save: jest.fn().mockResolvedValue(created),
      insert: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({})
    };

    const result = await serviceWithManager(manager).ingest(input);

    expect(result.created).toBe(true);
    expect(result.deduplicated).toBe(false);
    expect(manager.insert).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ action: 'INGESTED' }));
    expect(manager.update).toHaveBeenCalled();
  });

  it('merges duplicate events without changing firstSeenAt', async () => {
    const firstSeenAt = new Date('2026-09-12T09:00:00Z');
    const existing = { id: 'event-1', occurrenceCount: 1, firstSeenAt, rawPayload: {}, lastSeenAt: firstSeenAt } as SecurityEvent;
    const manager = {
      findOne: jest.fn().mockResolvedValue(existing),
      save: jest.fn().mockImplementation(async (event) => event),
      insert: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({})
    };

    const result = await serviceWithManager(manager).ingest(input);

    expect(result.created).toBe(false);
    expect(result.deduplicated).toBe(true);
    expect(existing.occurrenceCount).toBe(2);
    expect(existing.firstSeenAt).toBe(firstSeenAt);
    expect(manager.insert).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ action: 'DEDUPLICATED' }));
  });

  it('handles a concurrent duplicate insert by merging the existing row', async () => {
    const existing = { id: 'event-1', occurrenceCount: 3, rawPayload: {}, lastSeenAt: new Date(), firstSeenAt: new Date() } as SecurityEvent;
    const manager = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue({ id: 'new-event', ...input }),
      save: jest.fn()
        .mockRejectedValueOnce({ code: '23505' })
        .mockImplementationOnce(async (event) => event),
      findOneOrFail: jest.fn().mockResolvedValue(existing),
      insert: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({})
    };

    const result = await serviceWithManager(manager).ingest(input);

    expect(result.created).toBe(false);
    expect(existing.occurrenceCount).toBe(4);
    expect(manager.findOneOrFail).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ lock: { mode: 'pessimistic_write' } }));
  });
});
