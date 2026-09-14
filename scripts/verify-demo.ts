const apiUrl = process.env.API_URL ?? 'http://localhost:3001/api/v1';

async function request(path: string, init: RequestInit = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers
    }
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { response, body };
}

async function login(email: string, password: string) {
  const { response, body } = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error(`Login failed for ${email}: ${response.status}`);
  return body.accessToken as string;
}

async function authed(token: string, path: string, init: RequestInit = {}) {
  return request(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init.headers
    }
  });
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const analyst = await login('analyst@sentinelview.local', 'Password123!');
  const viewer = await login('viewer@sentinelview.local', 'Password123!');

  const badIngest = await request('/ingest/MOCK_SIEM', {
    method: 'POST',
    headers: { 'X-Ingest-Key': 'wrong' },
    body: JSON.stringify({})
  });
  assert(badIngest.response.status === 401, 'Invalid ingest key should return 401');

  const events = await authed(analyst, '/events?limit=5');
  assert(events.response.ok, 'Event list should be readable');
  assert(events.body.total >= 30, `Expected at least 30 events, got ${events.body.total}`);
  const event = events.body.items[0];
  assert(event.id, 'Event list should include event IDs');

  const filtered = await authed(analyst, '/events?sourceType=MOCK_SIEM&limit=5');
  assert(filtered.response.ok && filtered.body.items.every((row: any) => row.sourceType === 'MOCK_SIEM'), 'Source filter should return only MOCK_SIEM rows');

  const duplicateCheck = await authed(analyst, '/events?sourceType=MOCK_SIEM&search=siem-0001&limit=1');
  assert(duplicateCheck.body.items[0]?.occurrenceCount >= 6, 'Duplicate SIEM event should have occurrence count >= 6');

  const assignees = await authed(analyst, '/users/assignees');
  assert(assignees.response.ok && assignees.body.length > 0, 'Assignees endpoint should return analyst/admin users');
  const assignee = assignees.body.find((user: any) => user.role === 'ANALYST') ?? assignees.body[0];

  const assigned = await authed(analyst, `/events/${event.id}/assignment`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedToId: assignee.id })
  });
  assert(assigned.response.ok && assigned.body.assignedToId === assignee.id, 'Assignment should update event assignee');

  const investigating = await authed(analyst, `/events/${event.id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'INVESTIGATING' })
  });
  assert(investigating.response.ok && investigating.body.status === 'INVESTIGATING', 'Status should move to INVESTIGATING');

  const resolved = await authed(analyst, `/events/${event.id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'RESOLVED' })
  });
  assert(resolved.response.ok && resolved.body.resolvedAt, 'Resolving should set resolvedAt');

  const reopened = await authed(analyst, `/events/${event.id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'OPEN' })
  });
  assert(reopened.response.ok && reopened.body.resolvedAt === null, 'Reopening should clear resolvedAt');

  const viewerMutation = await authed(viewer, `/events/${event.id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'INVESTIGATING' })
  });
  assert(viewerMutation.response.status === 403, 'VIEWER should not mutate event status');

  const note = await authed(analyst, `/events/${event.id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content: 'Demo verification note.' })
  });
  assert(note.response.ok && note.body.id, 'Note creation should succeed');

  const history = await authed(analyst, `/events/${event.id}/history`);
  assert(history.response.ok && history.body.length > 0, 'History should be readable');

  const dashboard = await authed(analyst, '/dashboard/summary');
  assert(dashboard.response.ok && dashboard.body.totalEvents >= 30, 'Dashboard summary should include ingested events');

  const swagger = await fetch('http://localhost:3001/api/docs-json');
  assert(swagger.ok, 'Swagger JSON should be reachable');

  console.log('Demo verification passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
