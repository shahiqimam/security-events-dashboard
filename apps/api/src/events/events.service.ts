import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { EventStatus, HistoryAction, UserRole } from '../common/enums';
import { EventQueryDto } from './dto/event-query.dto';
import { EventHistory } from './entities/event-history.entity';
import { EventNote } from './entities/event-note.entity';
import { SecurityEvent } from './entities/security-event.entity';
import { User } from './entities/user.entity';
import { assertStatusTransition, resolvedAtForStatus } from './status-workflow';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(SecurityEvent) private readonly events: Repository<SecurityEvent>,
    @InjectRepository(EventHistory) private readonly histories: Repository<EventHistory>,
    @InjectRepository(EventNote) private readonly eventNotes: Repository<EventNote>,
    @InjectRepository(User) private readonly users: Repository<User>
  ) {}

  async list(query: EventQueryDto) {
    const qb = this.events.createQueryBuilder('event').leftJoinAndSelect('event.assignedTo', 'assignee');
    for (const key of ['sourceType', 'severity', 'category', 'status', 'assetName', 'username', 'sourceIp'] as const) {
      if (query[key]) qb.andWhere(`event.${key} = :${key}`, { [key]: query[key] });
    }
    if (query.assignedTo) qb.andWhere('event.assignedToId = :assignedTo', { assignedTo: query.assignedTo });
    if (query.dateFrom) qb.andWhere('event.detectedAt >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo) qb.andWhere('event.detectedAt <= :dateTo', { dateTo: query.dateTo });
    if (query.search) {
      qb.andWhere(
        new Brackets((where) =>
          where
            .where('event.title ILIKE :search')
            .orWhere('event.assetName ILIKE :search')
            .orWhere('event.username ILIKE :search')
            .orWhere('event.sourceIp ILIKE :search')
            .orWhere('event.sourceEventId ILIKE :search')
        ),
        { search: `%${query.search}%` }
      );
    }
    const [items, total] = await qb
      .orderBy(`event.${query.sortBy}`, query.order)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
    return { items, total, page: query.page, limit: query.limit };
  }

  async get(id: string) {
    const event = await this.events.findOne({ where: { id }, relations: { assignedTo: true } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async updateStatus(id: string, status: EventStatus, actorId: string) {
    const event = await this.get(id);
    assertStatusTransition(event.status, status);
    const previous = event.status;
    event.status = status;
    const resolvedAt = resolvedAtForStatus(status);
    if (resolvedAt !== undefined) event.resolvedAt = resolvedAt;
    const saved = await this.events.save(event);
    await this.histories.save(this.histories.create({
      eventId: id,
      actorId,
      action: status === EventStatus.RESOLVED ? HistoryAction.RESOLVED : status === EventStatus.OPEN ? HistoryAction.REOPENED : HistoryAction.STATUS_CHANGED,
      previousValue: { status: previous },
      newValue: { status }
    }));
    return saved;
  }

  async assign(id: string, assignedToId: string | null, actorId: string) {
    const event = await this.get(id);
    if (assignedToId) {
      const assignee = await this.users.findOne({ where: { id: assignedToId } });
      if (!assignee) throw new NotFoundException('Assignee not found');
      if (assignee.role === UserRole.VIEWER) throw new ForbiddenException('VIEWER users cannot be assigned');
    }
    const previous = event.assignedToId;
    event.assignedToId = assignedToId;
    const saved = await this.events.save(event);
    await this.histories.save(this.histories.create({
      eventId: id,
      actorId,
      action: assignedToId ? HistoryAction.ASSIGNED : HistoryAction.UNASSIGNED,
      previousValue: { assignedToId: previous ?? null } as Record<string, unknown>,
      newValue: { assignedToId: assignedToId ?? null } as Record<string, unknown>
    }));
    return saved;
  }

  history(eventId: string) {
    return this.histories.find({ where: { eventId }, order: { createdAt: 'DESC' } });
  }

  notes(eventId: string) {
    return this.eventNotes.find({ where: { eventId }, relations: { author: true }, order: { createdAt: 'DESC' } });
  }

  async addNote(eventId: string, content: string, actorId: string) {
    await this.get(eventId);
    const note = await this.eventNotes.save({ eventId, content, authorId: actorId });
    await this.histories.save(this.histories.create({ eventId, actorId, action: HistoryAction.NOTE_ADDED, previousValue: null, newValue: { noteId: note.id } }));
    return note;
  }

  async updateNote(id: string, content: string, actorId: string) {
    const note = await this.eventNotes.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    const previous = note.content;
    note.content = content;
    const saved = await this.eventNotes.save(note);
    await this.histories.save(this.histories.create({ eventId: note.eventId, actorId, action: HistoryAction.NOTE_EDITED, previousValue: { content: previous }, newValue: { content } }));
    return saved;
  }

  async deleteNote(id: string) {
    const note = await this.eventNotes.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    await this.eventNotes.delete(id);
    return { deleted: true };
  }
}



