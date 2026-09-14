import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventSource } from '../events/entities/event-source.entity';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(EventSource) private readonly sources: Repository<EventSource>,
    private readonly config: ConfigService
  ) {}

  async list() {
    const rows = await this.sources.find({ order: { name: 'ASC' } });
    return rows.map((source) => ({ ...source, activityState: this.activityState(source) }));
  }

  async get(id: string) {
    const source = await this.sources.findOne({ where: { id } });
    if (!source) throw new NotFoundException('Source not found');
    return { ...source, activityState: this.activityState(source) };
  }

  private activityState(source: EventSource) {
    if (!source.enabled) return 'DISABLED';
    if (!source.lastEventAt) return 'NEVER_SEEN';
    const staleMinutes = Number(this.config.get('SOURCE_STALE_MINUTES', 15));
    const ageMinutes = (Date.now() - source.lastEventAt.getTime()) / 60000;
    return ageMinutes > staleMinutes ? 'STALE' : 'ACTIVE_RECENTLY';
  }
}
