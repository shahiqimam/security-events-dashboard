import { Category, Severity, SourceType } from '../../common/enums';
import { MockSiemPayloadDto } from '../dto/mock-siem.dto';
import { NormalizedEventInput, SecurityEventAdapter } from './security-event-adapter';
import { categoryFromText, fingerprint, validatePayload } from './adapter-utils';

export class MockSiemAdapter implements SecurityEventAdapter<MockSiemPayloadDto> {
  readonly sourceType = SourceType.MOCK_SIEM;

  validate(payload: unknown): MockSiemPayloadDto {
    return validatePayload(MockSiemPayloadDto, payload);
  }

  normalize(payload: MockSiemPayloadDto): NormalizedEventInput {
    return {
      sourceType: this.sourceType,
      sourceEventId: payload.event_id,
      title: payload.rule_name,
      description: `Mock SIEM rule level ${payload.rule_level} observed on ${payload.agent_name}.`,
      severity: mapSiemSeverity(payload.rule_level),
      category: categoryFromText(payload.rule_name, Category.OTHER),
      assetName: payload.agent_name,
      username: null,
      sourceIp: payload.src_ip,
      detectedAt: new Date(payload.occurred_at),
      fingerprint: fingerprint([this.sourceType, payload.event_id]),
      rawPayload: payload as unknown as Record<string, unknown>
    };
  }
}

export function mapSiemSeverity(level: number): Severity {
  if (level <= 3) return Severity.INFO;
  if (level <= 6) return Severity.LOW;
  if (level <= 9) return Severity.MEDIUM;
  if (level <= 12) return Severity.HIGH;
  return Severity.CRITICAL;
}
