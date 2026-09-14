import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventSource } from '../events/entities/event-source.entity';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([EventSource])],
  controllers: [SourcesController],
  providers: [SourcesService]
})
export class SourcesModule {}
