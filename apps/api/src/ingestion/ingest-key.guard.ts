import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class IngestKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const provided = request.headers['x-ingest-key'];
    const key = Array.isArray(provided) ? provided[0] : provided;
    const expected = this.config.get<string>('INGEST_API_KEY');
    if (!key || !expected || !safeEquals(key, expected)) {
      throw new UnauthorizedException('Invalid ingestion key');
    }
    return true;
  }
}

function safeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
