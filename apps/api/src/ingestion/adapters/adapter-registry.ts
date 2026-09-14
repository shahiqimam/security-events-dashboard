import { BadRequestException, Injectable } from '@nestjs/common';
import { SourceType } from '../../common/enums';
import { MockEdrAdapter } from './mock-edr.adapter';
import { MockIamAdapter } from './mock-iam.adapter';
import { MockSiemAdapter } from './mock-siem.adapter';
import { SecurityEventAdapter } from './security-event-adapter';

@Injectable()
export class AdapterRegistry {
  private readonly adapters = new Map<SourceType, SecurityEventAdapter<unknown>>();

  constructor() {
    [new MockSiemAdapter(), new MockEdrAdapter(), new MockIamAdapter()].forEach((adapter) => {
      this.adapters.set(adapter.sourceType, adapter as SecurityEventAdapter<unknown>);
    });
  }

  get(sourceType: SourceType): SecurityEventAdapter<unknown> {
    const adapter = this.adapters.get(sourceType);
    if (!adapter) throw new BadRequestException('Unsupported source type');
    return adapter;
  }
}
