import { Category, Severity, SourceType } from '../../common/enums';

export interface NormalizedEventInput {
  sourceType: SourceType;
  sourceEventId: string;
  title: string;
  description: string | null;
  severity: Severity;
  category: Category;
  assetName: string | null;
  username: string | null;
  sourceIp: string | null;
  detectedAt: Date;
  fingerprint: string;
  rawPayload: Record<string, unknown>;
}

export interface SecurityEventAdapter<TPayload> {
  readonly sourceType: SourceType;
  validate(payload: unknown): TPayload;
  normalize(payload: TPayload): NormalizedEventInput;
}
