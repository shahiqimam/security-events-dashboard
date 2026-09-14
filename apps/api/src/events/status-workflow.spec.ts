import { BadRequestException } from '@nestjs/common';
import { EventStatus } from '../common/enums';
import { assertStatusTransition } from './status-workflow';

describe('status workflow', () => {
  it('allows configured transitions', () => {
    expect(() => assertStatusTransition(EventStatus.OPEN, EventStatus.INVESTIGATING)).not.toThrow();
    expect(() => assertStatusTransition(EventStatus.RESOLVED, EventStatus.OPEN)).not.toThrow();
  });

  it('rejects invalid terminal transitions', () => {
    expect(() => assertStatusTransition(EventStatus.RESOLVED, EventStatus.FALSE_POSITIVE)).toThrow(BadRequestException);
  });
});
