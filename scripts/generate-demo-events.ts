import { parseArgs } from 'node:util';

type Source = 'MOCK_SIEM' | 'MOCK_EDR' | 'MOCK_IAM';

const { values } = parseArgs({
  options: {
    source: { type: 'string', default: 'MOCK_SIEM' },
    count: { type: 'string', default: '10' },
    duplicates: { type: 'boolean', default: false }
  }
});

const source = values.source as Source;
const count = Number(values.count ?? 10);
const apiUrl = process.env.API_URL ?? 'http://localhost:3001/api/v1';
const ingestKey = process.env.INGEST_API_KEY;

if (!ingestKey) {
  throw new Error('INGEST_API_KEY is required');
}

const titles = ['Repeated login failures', 'Suspicious PowerShell', 'Admin privilege escalation', 'Network policy violation', 'Malware indicator observed'];
const assets = ['WS-014', 'LAPTOP-22', 'SRV-101', 'FIN-07', 'ENG-44'];
const ips = ['198.51.100.25', '203.0.113.15', '192.0.2.44', '198.51.100.77', '203.0.113.88'];

function eventId(prefix: string, index: number) {
  return `${prefix}-${String(index + 1).padStart(4, '0')}`;
}

function payload(index: number) {
  const stable = values.duplicates ? 0 : index;
  const occurred = new Date(Date.now() - index * 60_000).toISOString();
  if (source === 'MOCK_SIEM') {
    return {
      event_id: eventId('siem', stable),
      rule_level: [3, 6, 9, 12, 15][index % 5],
      rule_name: titles[index % titles.length],
      agent_name: assets[index % assets.length],
      src_ip: ips[index % ips.length],
      occurred_at: occurred
    };
  }
  if (source === 'MOCK_EDR') {
    return {
      detectionId: eventId('edr', stable),
      severity: ['info', 'low', 'medium', 'high', 'critical'][index % 5],
      device: { hostname: assets[index % assets.length], platform: index % 2 ? 'macOS' : 'Windows' },
      detectionType: titles[index % titles.length],
      timestamp: occurred
    };
  }
  return {
    id: eventId('iam', stable),
    risk: [12, 28, 55, 74, 90][index % 5],
    actor: `demo.user${index % 5}@example.com`,
    activity: titles[index % titles.length],
    ipAddress: ips[index % ips.length],
    created: occurred
  };
}

async function main() {
  for (let index = 0; index < count; index += 1) {
    const response = await fetch(`${apiUrl}/ingest/${source}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ingest-Key': ingestKey
      },
      body: JSON.stringify(payload(index))
    });
    if (!response.ok) {
      throw new Error(`Ingestion failed at ${index + 1}: ${response.status} ${await response.text()}`);
    }
    const result = await response.json();
    console.log(`${source} ${index + 1}/${count}: ${result.created ? 'created' : 'deduplicated'}`);
  }
}

main();
