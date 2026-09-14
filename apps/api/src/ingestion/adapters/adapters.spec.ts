import { BadRequestException } from '@nestjs/common';
import { Category, Severity } from '../../common/enums';
import { MockEdrAdapter, mapEdrSeverity } from './mock-edr.adapter';
import { MockIamAdapter, mapIamSeverity } from './mock-iam.adapter';
import { MockSiemAdapter, mapSiemSeverity } from './mock-siem.adapter';

describe('source adapters', () => {
  it('maps Mock SIEM severity and category', () => {
    expect(mapSiemSeverity(3)).toBe(Severity.INFO);
    expect(mapSiemSeverity(6)).toBe(Severity.LOW);
    expect(mapSiemSeverity(9)).toBe(Severity.MEDIUM);
    expect(mapSiemSeverity(12)).toBe(Severity.HIGH);
    expect(mapSiemSeverity(15)).toBe(Severity.CRITICAL);
    const normalized = new MockSiemAdapter().normalize({
      event_id: 'siem-1001',
      rule_level: 12,
      rule_name: 'Repeated login failures',
      agent_name: 'WS-014',
      src_ip: '198.51.100.25',
      occurred_at: '2026-09-12T10:00:00Z'
    });
    expect(normalized.category).toBe(Category.AUTHENTICATION);
    expect(normalized.assetName).toBe('WS-014');
  });

  it('validates Mock SIEM payloads', () => {
    expect(() => new MockSiemAdapter().validate({ event_id: 'x' })).toThrow(BadRequestException);
  });

  it('maps Mock EDR severity and endpoint categories', () => {
    expect(mapEdrSeverity('high')).toBe(Severity.HIGH);
    const normalized = new MockEdrAdapter().normalize({
      detectionId: 'edr-2001',
      severity: 'high',
      device: { hostname: 'LAPTOP-22', platform: 'Windows' },
      detectionType: 'Suspicious PowerShell',
      timestamp: '2026-09-12T10:05:00Z'
    });
    expect(normalized.category).toBe(Category.ENDPOINT);
  });

  it('maps Mock IAM risk and privilege categories', () => {
    expect(mapIamSeverity(90)).toBe(Severity.CRITICAL);
    const normalized = new MockIamAdapter().normalize({
      id: 'iam-3001',
      risk: 90,
      actor: 'demo.user@example.com',
      activity: 'Admin privilege escalation',
      ipAddress: '203.0.113.15',
      created: '2026-09-12T10:10:00Z'
    });
    expect(normalized.category).toBe(Category.PRIVILEGE);
    expect(normalized.username).toBe('demo.user@example.com');
  });
});
