import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { createHash } from 'crypto';
import { Category } from '../../common/enums';

export function validatePayload<T extends object>(dto: new () => T, payload: unknown): T {
  const instance = plainToInstance(dto, payload);
  const errors = validateSync(instance, { whitelist: true, forbidNonWhitelisted: true });
  if (errors.length > 0) {
    throw new BadRequestException({ message: 'Invalid source payload', errors });
  }
  return instance;
}

export function fingerprint(parts: string[]): string {
  return createHash('sha256').update(parts.join('|')).digest('hex');
}

export function categoryFromText(text: string, fallback = Category.OTHER): Category {
  const value = text.toLowerCase();
  if (/(login|logon|auth|mfa|password|credential)/.test(value)) return Category.AUTHENTICATION;
  if (/(malware|ransomware|trojan|virus)/.test(value)) return Category.MALWARE;
  if (/(privilege|admin|sudo|elevation)/.test(value)) return Category.PRIVILEGE;
  if (/(network|firewall|dns|connection|port)/.test(value)) return Category.NETWORK;
  if (/(policy|compliance)/.test(value)) return Category.POLICY;
  if (/(configuration|config|setting)/.test(value)) return Category.CONFIGURATION;
  if (/(data|file|download|exfiltration)/.test(value)) return Category.DATA_ACCESS;
  if (/(powershell|process|executable|endpoint|script)/.test(value)) return Category.ENDPOINT;
  return fallback;
}
