import { ForbiddenException } from '@nestjs/common';
import { EventStatus, UserRole } from '../common/enums';
import { EventsService } from './events.service';

describe('EventsService', () => {
  function makeService(overrides: Record<string, any> = {}) {
    const repos = {
      events: { findOne: jest.fn(), save: jest.fn((event) => Promise.resolve(event)), createQueryBuilder: jest.fn() },
      histories: { save: jest.fn(), create: jest.fn((value) => value) },
      notes: {},
      users: { findOne: jest.fn() },
      ...overrides
    };
    return { service: new EventsService(repos.events as any, repos.histories as any, repos.notes as any, repos.users as any), repos };
  }

  it('sets resolvedAt when resolving an event', async () => {
    const event = { id: 'event-1', status: EventStatus.OPEN, resolvedAt: null };
    const { service, repos } = makeService({ events: { findOne: jest.fn().mockResolvedValue(event), save: jest.fn((value) => Promise.resolve(value)) } });

    const result = await service.updateStatus('event-1', EventStatus.RESOLVED, 'actor-1');

    expect(result.status).toBe(EventStatus.RESOLVED);
    expect(result.resolvedAt).toBeInstanceOf(Date);
    expect(repos.histories.save).toHaveBeenCalled();
  });

  it('prevents assigning events to viewer users', async () => {
    const { service, repos } = makeService({
      events: { findOne: jest.fn().mockResolvedValue({ id: 'event-1', assignedToId: null }), save: jest.fn() },
      users: { findOne: jest.fn().mockResolvedValue({ id: 'viewer-1', role: UserRole.VIEWER }) }
    });

    await expect(service.assign('event-1', 'viewer-1', 'actor-1')).rejects.toThrow(ForbiddenException);
    expect(repos.events.save).not.toHaveBeenCalled();
  });

  it('creates assignment history for analyst assignment', async () => {
    const event = { id: 'event-1', assignedToId: null };
    const { service, repos } = makeService({
      events: { findOne: jest.fn().mockResolvedValue(event), save: jest.fn((value) => Promise.resolve(value)) },
      users: { findOne: jest.fn().mockResolvedValue({ id: 'analyst-1', role: UserRole.ANALYST }) }
    });

    const result = await service.assign('event-1', 'analyst-1', 'actor-1');

    expect(result.assignedToId).toBe('analyst-1');
    expect(repos.histories.create).toHaveBeenCalledWith(expect.objectContaining({ action: 'ASSIGNED' }));
  });
});
