import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { IngestKeyGuard } from './ingest-key.guard';

function contextWithKey(key?: string) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers: key ? { 'x-ingest-key': key } : {} }) })
  } as any;
}

describe('IngestKeyGuard', () => {
  it('rejects a missing ingestion key', () => {
    const guard = new IngestKeyGuard({ get: () => 'expected' } as unknown as ConfigService);
    expect(() => guard.canActivate(contextWithKey())).toThrow(UnauthorizedException);
  });

  it('rejects an invalid ingestion key', () => {
    const guard = new IngestKeyGuard({ get: () => 'expected' } as unknown as ConfigService);
    expect(() => guard.canActivate(contextWithKey('wrong'))).toThrow(UnauthorizedException);
  });

  it('accepts the configured ingestion key', () => {
    const guard = new IngestKeyGuard({ get: () => 'expected' } as unknown as ConfigService);
    expect(guard.canActivate(contextWithKey('expected'))).toBe(true);
  });
});
