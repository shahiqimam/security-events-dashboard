import { Category, Severity, SourceType } from '../../common/enums';
import { MockIamPayloadDto } from '../dto/mock-iam.dto';
import { categoryFromText, fingerprint, validatePayload } from './adapter-utils';
import { NormalizedEventInput, SecurityEventAdapter } from './security-event-adapter';

export class MockIamAdapter implements SecurityEventAdapter<MockIamPayloadDto> {
  readonly sourceType = SourceType.MOCK_IAM;

  validate(payload: unknown): MockIamPayloadDto {
    return validatePayload(MockIamPayloadDto, payload);
  }

  normalize(payload: MockIamPayloadDto): NormalizedEventInput {
    return {
      sourceType: this.sourceType,
      sourceEventId: payload.id,
      title: payload.activity,
      description: `Mock IAM risk score ${payload.risk} for ${payload.actor}.`,
      severity: mapIamSeverity(payload.risk),
      category: categoryFromText(payload.activity, Category.AUTHENTICATION),
      assetName: null,
      username: payload.actor,
      sourceIp: payload.ipAddress,
      detectedAt: new Date(payload.created),
      fingerprint: fingerprint([this.sourceType, payload.id]),
      rawPayload: payload as unknown as Record<string, unknown>
    };
  }
}

export function mapIamSeverity(risk: number): Severity {
  if (risk <= 19) return Severity.INFO;
  if (risk <= 39) return Severity.LOW;
  if (risk <= 59) return Severity.MEDIUM;
  if (risk <= 79) return Severity.HIGH;
  return Severity.CRITICAL;
}
