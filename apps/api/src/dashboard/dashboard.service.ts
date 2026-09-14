import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventStatus, Severity } from '../common/enums';
import { SecurityEvent } from '../events/entities/security-event.entity';

@Injectable()
export class DashboardService {
  constructor(@InjectRepository(SecurityEvent) private readonly events: Repository<SecurityEvent>) {}

  async summary() {
    const totalEvents = await this.events.count();
    const openEvents = await this.events.count({ where: { status: EventStatus.OPEN } });
    const investigatingEvents = await this.events.count({ where: { status: EventStatus.INVESTIGATING } });
    const criticalOpen = await this.events.count({ where: { status: EventStatus.OPEN, severity: Severity.CRITICAL } });
    const highOpen = await this.events.count({ where: { status: EventStatus.OPEN, severity: Severity.HIGH } });
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await this.events.createQueryBuilder('event').where('event.detectedAt >= :since', { since }).getCount();
    const affected = await this.events
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.assetName)', 'count')
      .where('event.assetName IS NOT NULL')
      .getRawOne<{ count: string }>();
    return {
      totalEvents,
      openEvents,
      investigatingEvents,
      criticalOpen,
      highOpen,
      affectedAssets: Number(affected?.count ?? 0),
      eventsLast24Hours: recent
    };
  }

  groupBy(field: 'severity' | 'category' | 'sourceType') {
    return this.events
      .createQueryBuilder('event')
      .select(`event.${field}`, 'name')
      .addSelect('COUNT(*)', 'value')
      .groupBy(`event.${field}`)
      .orderBy('value', 'DESC')
      .getRawMany();
  }

  timeline() {
    return this.events
      .createQueryBuilder('event')
      .select("date_trunc('hour', event.detectedAt)", 'bucket')
      .addSelect('COUNT(*)', 'count')
      .groupBy('bucket')
      .orderBy('bucket', 'ASC')
      .limit(48)
      .getRawMany();
  }

  topAssets() {
    return this.events
      .createQueryBuilder('event')
      .select('event.assetName', 'assetName')
      .addSelect('COUNT(*)', 'count')
      .where('event.assetName IS NOT NULL')
      .groupBy('event.assetName')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();
  }
}
