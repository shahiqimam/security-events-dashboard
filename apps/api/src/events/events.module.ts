import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventHistory } from './entities/event-history.entity';
import { EventNote } from './entities/event-note.entity';
import { SecurityEvent } from './entities/security-event.entity';
import { User } from './entities/user.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityEvent, EventHistory, EventNote, User])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService]
})
export class EventsModule {}
