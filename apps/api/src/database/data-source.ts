import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { EventHistory } from '../events/entities/event-history.entity';
import { EventNote } from '../events/entities/event-note.entity';
import { EventSource } from '../events/entities/event-source.entity';
import { SecurityEvent } from '../events/entities/security-event.entity';
import { User } from '../events/entities/user.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  database: process.env.DATABASE_NAME ?? 'security_events',
  username: process.env.DATABASE_USER ?? 'security_events',
  password: process.env.DATABASE_PASSWORD ?? 'change_me',
  entities: [SecurityEvent, EventSource, User, EventNote, EventHistory],
  migrations: ['src/database/migrations/*.ts']
});
