import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HistoryAction } from '../../common/enums';
import { SecurityEvent } from './security-event.entity';
import { User } from './user.entity';

@Entity('event_history')
export class EventHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  eventId!: string;

  @ManyToOne(() => SecurityEvent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event!: SecurityEvent;

  @Column({ nullable: true })
  actorId!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'actorId' })
  actor?: User | null;

  @Column({ type: 'enum', enum: HistoryAction, enumName: 'history_action_enum' })
  action!: HistoryAction;

  @Column({ type: 'jsonb', nullable: true })
  previousValue!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  newValue!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}

