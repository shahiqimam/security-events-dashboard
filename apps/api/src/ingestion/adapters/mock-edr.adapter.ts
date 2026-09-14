import { Category, Severity, SourceType } from '../../common/enums';
import { MockEdrPayloadDto } from '../dto/mock-edr.dto';
import { categoryFromText, fingerprint, validatePayload } from './adapter-utils';
import { NormalizedEventInput, SecurityEventAdapter } from './security-event-adapter';

export class MockEdrAdapter implements SecurityEventAdapter<MockEdrPayloadDto> {
  readonly sourceType = SourceType.MOCK_EDR;

  validate(payload: unknown): MockEdrPayloadDto {
    return validatePayload(MockEdrPayloadDto, payload);
  }

  normalize(payload: MockEdrPayloadDto): NormalizedEventInput {
    return {
      sourceType: this.sourceType,
      sourceEventId: payload.detectionId,
      title: payload.detectionType,
      description: `Mock EDR detection on ${payload.device.hostname} (${payload.device.platform}).`,
      severity: mapEdrSeverity(payload.severity),
      category: categoryFromText(payload.detectionType, Category.OTHER),
      assetName: payload.device.hostname,
      username: null,
      sourceIp: null,
      detectedAt: new Date(payload.timestamp),
      fingerprint: fingerprint([this.sourceType, payload.detectionId]),
      rawPayload: payload as unknown as Record<string, unknown>
    };
  }
}

export function mapEdrSeverity(severity: string): Severity {
  return severity.toUpperCase() as Severity;
}
