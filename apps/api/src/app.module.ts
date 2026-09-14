import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventHistory } from './events/entities/event-history.entity';
import { EventNote } from './events/entities/event-note.entity';
import { EventSource } from './events/entities/event-source.entity';
import { SecurityEvent } from './events/entities/security-event.entity';
import { User } from './events/entities/user.entity';
import { EventsModule } from './events/events.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { SourcesModule } from './sources/sources.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: Number(config.get('DATABASE_PORT', 5432)),
        database: config.get('DATABASE_NAME', 'security_events'),
        username: config.get('DATABASE_USER', 'security_events'),
        password: config.get('DATABASE_PASSWORD', 'change_me'),
        entities: [SecurityEvent, EventSource, User, EventNote, EventHistory],
        migrations: ['dist/database/migrations/*.js'],
        synchronize: false,
        migrationsRun: true
      })
    }),
    AuthModule,
    EventsModule,
    IngestionModule,
    DashboardModule,
    SourcesModule
  ]
})
export class AppModule {}
