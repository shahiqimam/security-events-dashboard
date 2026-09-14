import { BadRequestException } from '@nestjs/common';
import { EventStatus } from '../common/enums';

const allowed: Record<EventStatus, EventStatus[]> = {
  [EventStatus.OPEN]: [EventStatus.INVESTIGATING, EventStatus.RESOLVED, EventStatus.FALSE_POSITIVE],
  [EventStatus.INVESTIGATING]: [EventStatus.OPEN, EventStatus.RESOLVED, EventStatus.FALSE_POSITIVE],
  [EventStatus.RESOLVED]: [EventStatus.OPEN],
  [EventStatus.FALSE_POSITIVE]: [EventStatus.OPEN]
};

export function assertStatusTransition(from: EventStatus, to: EventStatus) {
  if (from === to) return;
  if (!allowed[from].includes(to)) {
    throw new BadRequestException(`Invalid status transition: ${from} -> ${to}`);
  }
}

export function resolvedAtForStatus(status: EventStatus): Date | null | undefined {
  if (status === EventStatus.RESOLVED) return new Date();
  if (status === EventStatus.OPEN) return null;
  return undefined;
}
